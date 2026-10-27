/**
 * Cloudflare Worker for Gemini API Proxy with KV Caching and Safety Settings
 * 
 * Setup Instructions:
 * 1. Create a Cloudflare worker.
 * 2. Create a KV Namespace named `GEMINI_CACHE` and bind it to your worker.
 * 3. Add your `GEMINI_API_KEY` to the worker's secrets.
 * 4. Deploy this script.
 */

export default {
    async fetch(request, env, ctx) {
        // Handle CORS preflight requests
        if (request.method === "OPTIONS") {
            return handleOptions(request, env);
        }

        const corsHeaders = getCorsHeaders(request, env);
        if (!corsHeaders) return Response.json({ error: "Origin not allowed" }, { status: 403, headers: { Vary: "Origin" } });
        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
                status: 405,
                headers: corsHeaders,
            });
        }

        try {
            const payload = await readPayload(request);

            // Retain the existing provider safety policy.
            const safetySettings = [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ];

            // Ensure the payload structure matches what Gemini expects exactly
            const instruction = payload.system_instruction || payload.systemInstruction;
            const textParts = parts => parts.map(part => ({ text: part.text }));
            const geminiPayload = {
                contents: payload.contents.map(item => ({ role: item.role, parts: textParts(item.parts) })),
                system_instruction: instruction ? { role: 'system', parts: textParts(instruction.parts) } : undefined,
                safetySettings: safetySettings,
                generationConfig: {
                    temperature: Number.isFinite(payload.temperature) ? Math.max(0, Math.min(2, payload.temperature)) : 0.7,
                    topP: Number.isFinite(payload.topP) ? Math.max(0, Math.min(1, payload.topP)) : 0.95,
                    maxOutputTokens: 500,
                }
            };

            // Cache the full context and instruction, never just the last visitor prompt.
            // The digest also keeps raw visitor text out of KV key listings.
            const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(geminiPayload)));
            const cacheKey = "gemini_v2_" + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
            if (env.GEMINI_CACHE) {
                const cached = await env.GEMINI_CACHE.get(cacheKey);
                if (cached) return new Response(cached, { headers: corsHeaders });
            }

            // A server-side cost backstop; the browser's daily limit is only UX.
            // Cache API accounting is best-effort per data center, not a global atomic quota.
            const budget = await takeDailyBudget(request, env);
            if (!budget.allowed) return Response.json({ error: "Daily assistant request limit reached" }, {
                status: 429, headers: { ...corsHeaders, "Retry-After": String(budget.retryAfter) },
            });

            // 3. Forward to Gemini API
            // Using gemini-2.5-flash - confirmed working with this API key
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

            const response = await fetch(geminiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(geminiPayload),
                signal: AbortSignal.timeout(25_000),
            });

            const data = await response.json();

            const returnResponse = new Response(JSON.stringify(data), {
                status: response.status,
                headers: corsHeaders,
            });

            // Save successful responses to KV Cache (expires in 24 hours / 86400 seconds)
            if (response.ok && env.GEMINI_CACHE) {
                ctx.waitUntil(env.GEMINI_CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 }));
            }

            return returnResponse;

        } catch (error) {
            return new Response(JSON.stringify({ error: error?.status ? "Invalid assistant request" : "Assistant gateway unavailable" }), {
                status: [400, 413, 415].includes(error?.status) ? error.status : 500,
                headers: corsHeaders,
            });
        }
    },
};

function handleOptions(request, env) {
    const headers = getCorsHeaders(request, env);
    return headers ? new Response(null, { status: 204, headers }) : new Response(null, { status: 403, headers: { Vary: "Origin" } });
}

function getCorsHeaders(request, env) {
    const origin = request.headers.get("Origin");
    const site = "https://syedammar.engineer";
    const allowed = new Set((env.ALLOWED_ORIGINS || `${site},https://www.syedammar.engineer`).split(",").map(value => value.trim()));
    const local = origin && /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
    if (origin && !allowed.has(origin) && !local) return null;
    return {
        "Access-Control-Allow-Origin": origin || site,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Vary": "Origin",
        "X-Content-Type-Options": "nosniff",
    };
}

async function readPayload(request) {
    const limit = 128 * 1024;
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) throw { status: 415 };
    if (Number(request.headers.get("Content-Length")) > limit) throw { status: 413 };
    const reader = request.body?.getReader();
    if (!reader) throw { status: 400 };
    const chunks = []; let bytes = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > limit) { await reader.cancel(); throw { status: 413 }; }
            chunks.push(value);
        }
    } finally { reader.releaseLock(); }
    const joined = new Uint8Array(bytes); let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    let body;
    try { body = JSON.parse(new TextDecoder().decode(joined)); } catch { throw { status: 400 }; }
    const partsValid = (parts, maxLength) => Array.isArray(parts) && parts.length > 0 && parts.length <= 8 && parts.every(part => typeof part?.text === "string" && part.text.length <= maxLength);
    const instruction = body?.system_instruction || body?.systemInstruction;
    if (!Array.isArray(body?.contents) || !body.contents.length || body.contents.length > 50 ||
        !body.contents.every(item => ["user", "model"].includes(item?.role) && partsValid(item.parts, 32_000)) ||
        instruction && !partsValid(instruction.parts, 64_000)) throw { status: 400 };
    return body;
}

async function takeDailyBudget(request, env) {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const retryAfter = Math.max(1, Math.ceil((Date.parse(`${day}T00:00:00Z`) + 86_400_000 - now.getTime()) / 1000));
    const configured = Number(env.AI_DAILY_REQUEST_LIMIT);
    const limit = Number.isInteger(configured) && configured > 0 && configured <= 1000 ? configured : 60;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${day}:${ip}`));
    const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const url = new URL(`https://ratelimit.internal/assistant/${key}`);
    const cached = await caches.default.match(url);
    const stored = cached ? Number(await cached.text()) : 0;
    const count = Number.isFinite(stored) && stored >= 0 ? stored : 0;
    if (count >= limit) return { allowed: false, retryAfter };
    await caches.default.put(url, new Response(String(count + 1), { headers: { "Cache-Control": `public, max-age=${retryAfter}` } }));
    return { allowed: true, retryAfter };
}
