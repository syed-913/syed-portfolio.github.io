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
            return handleOptions(request);
        }

        if (request.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
                status: 405,
                headers: getCorsHeaders(),
            });
        }

        try {
            const payload = await request.json();

            // Ensure payload has contents
            if (!payload.contents || !Array.isArray(payload.contents)) {
                return new Response(JSON.stringify({ error: "Invalid payload: missing 'contents' array" }), {
                    status: 400,
                    headers: getCorsHeaders(),
                });
            }

            // 1. KV Caching Logic
            // We will cache based on the most recent user prompt to save quota on common FAQs.
            // For a more robust cache, you could hash the entire 'contents' array.
            const lastMessage = payload.contents[payload.contents.length - 1];
            const cacheKey = `gemini_cache_${env.MODE || 'NORMAL'}_${lastMessage?.parts?.[0]?.text?.trim().toLowerCase()}`;

            if (env.GEMINI_CACHE) {
                const cachedResponse = await env.GEMINI_CACHE.get(cacheKey);
                if (cachedResponse) {
                    return new Response(cachedResponse, {
                        headers: getCorsHeaders(),
                    });
                }
            }

            // 2. Safety Settings Injection
            // Setting everything to BLOCK_ONLY_HIGH to allow for "Nerd" banter and sarcasm without triggering filters.
            const safetySettings = [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ];

            // Ensure the payload structure matches what Gemini expects exactly
            const geminiPayload = {
                contents: payload.contents,
                system_instruction: payload.system_instruction || payload.systemInstruction,
                safetySettings: safetySettings,
                generationConfig: {
                    temperature: payload.temperature ?? 0.7,
                    topP: payload.topP ?? 0.95,
                    maxOutputTokens: 500,
                }
            };

            // 3. Forward to Gemini API
            // Using gemini-2.5-flash - confirmed working with this API key
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

            const response = await fetch(geminiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(geminiPayload),
            });

            const data = await response.json();

            const returnResponse = new Response(JSON.stringify(data), {
                status: response.status,
                headers: getCorsHeaders(),
            });

            // Save successful responses to KV Cache (expires in 24 hours / 86400 seconds)
            if (response.ok && env.GEMINI_CACHE) {
                ctx.waitUntil(env.GEMINI_CACHE.put(cacheKey, JSON.stringify(data), { expirationTtl: 86400 }));
            }

            return returnResponse;

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: getCorsHeaders(),
            });
        }
    },
};

function handleOptions(request) {
    let headers = request.headers;
    if (
        headers.get("Origin") !== null &&
        headers.get("Access-Control-Request-Method") !== null &&
        headers.get("Access-Control-Request-Headers") !== null
    ) {
        return new Response(null, {
            headers: getCorsHeaders(),
        });
    } else {
        return new Response(null, {
            headers: {
                Allow: "POST, OPTIONS",
            },
        });
    }
}

function getCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*", // Or restrict to your github.io domain
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    };
}

