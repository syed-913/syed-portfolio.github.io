// Existing Discord contact proxy. Deploy to the same Worker with the same secret.
// CORS is a browser boundary, not authentication or a substitute for edge rate limits.
const SITE_ORIGIN = 'https://syedammar.engineer';
const MAX_BODY_BYTES = 16 * 1024;

function cors(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = new Set((env.ALLOWED_ORIGINS || `${SITE_ORIGIN},https://www.syedammar.engineer`).split(',').map(value => value.trim()));
    // Local preview uses the same public proxy; loopback is not an authorization credential.
    const local = origin && /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
    if (origin && !allowed.has(origin) && !local) return null;
    return {
        'Access-Control-Allow-Origin': origin || SITE_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Vary': 'Origin',
        'X-Content-Type-Options': 'nosniff',
    };
}

async function readBody(request) {
    if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) throw { status: 415 };
    if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) throw { status: 413 };
    const reader = request.body?.getReader();
    if (!reader) throw { status: 400 };
    const chunks = []; let bytes = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
            if (bytes > MAX_BODY_BYTES) { await reader.cancel(); throw { status: 413 }; }
            chunks.push(value);
        }
    } finally { reader.releaseLock(); }
    const joined = new Uint8Array(bytes); let offset = 0;
    for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength; }
    try { return JSON.parse(new TextDecoder().decode(joined)); } catch { throw { status: 400 }; }
}

function contactPayload(body) {
    const embed = body?.embeds?.length === 1 ? body.embeds[0] : null;
    const fields = Array.isArray(embed?.fields) ? embed.fields : [];
    const field = name => fields.find(item => item?.name === name)?.value;
    const email = field('Email'), subject = field('Subject'), message = field('Message');
    const title = embed?.title;
    if (typeof title !== 'string' || !title.startsWith('New Message from ') || title.length > 160 ||
        typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof subject !== 'string' || !subject.trim() || subject.length > 200 ||
        typeof message !== 'string' || !message.trim() || message.length > 1024) throw { status: 400 };
    // Reconstruct the known form schema. Callers cannot inject mentions, files, URLs or webhook identity.
    return {
        allowed_mentions: { parse: [] },
        embeds: [{
            title, color: 0x008969,
            fields: [{ name: 'Email', value: email, inline: true }, { name: 'Subject', value: subject, inline: true }, { name: 'Message', value: message }],
            footer: { text: 'Portfolio Contact Form' }, timestamp: new Date().toISOString(),
        }],
    };
}

export default {
    async fetch(request, env) {
        const headers = cors(request, env);
        if (!headers) return Response.json({ error: 'Origin not allowed' }, { status: 403, headers: { Vary: 'Origin' } });
        if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
        if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
        try {
            const body = contactPayload(await readBody(request));
            const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
            const cache = caches.default;
            const cacheUrl = new URL(`https://ratelimit.internal/contact/${encodeURIComponent(ip)}`);
            const cached = await cache.match(cacheUrl);
            if (cached) {
                const expires = Number(cached.headers.get('X-Expires-At'));
                const seconds = Number.isFinite(expires) ? Math.max(1, Math.ceil((expires - Date.now()) / 1000)) : 600;
                return Response.json({ error: 'Rate limit exceeded', cooldown: 10 }, { status: 429, headers: { ...headers, 'Retry-After': String(seconds) } });
            }
            const delivered = await fetch(env.DISCORD_WEBHOOK_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000),
            });
            if (!delivered.ok) return Response.json({ error: 'Message gateway unavailable' }, { status: 502, headers });
            await cache.put(cacheUrl, new Response('rate-limited', { headers: { 'Cache-Control': 'public, max-age=600', 'X-Expires-At': String(Date.now() + 600_000) } }));
            return Response.json({ success: true }, { headers });
        } catch (error) {
            const status = [400, 413, 415].includes(error?.status) ? error.status : 500;
            return Response.json({ error: status === 500 ? 'Failed to send message' : 'Invalid contact request' }, { status, headers });
        }
    },
};
