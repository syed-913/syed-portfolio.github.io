// Discord Webhook Proxy - Cloudflare Worker
// This keeps your Discord webhook URL secure and prevents spam

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Only allow POST requests
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            // Rate limiting: 10 minute cooldown per IP
            const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
            const rateLimitKey = `ratelimit:${ip}`;
            const cooldownMinutes = 10;

            // Check if IP is rate limited (using cache API for simple rate limiting)
            const cache = caches.default;
            const cacheUrl = new URL(`https://ratelimit.internal/${rateLimitKey}`);
            const cachedResponse = await cache.match(cacheUrl);

            if (cachedResponse) {
                const expiresAtHeader = cachedResponse.headers.get('X-Expires-At');
                const timeLeft = expiresAtHeader ? Math.ceil((parseInt(expiresAtHeader) - Date.now()) / 1000 / 60) : cooldownMinutes;
                return new Response(
                    JSON.stringify({
                        error: 'Rate limit exceeded',
                        message: `Please wait ${timeLeft} minutes before sending another message.`,
                        cooldown: cooldownMinutes
                    }),
                    {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Retry-After': String(timeLeft * 60),
                        },
                    }
                );
            }

            // Get the request body
            const body = await request.json();

            // Forward to Discord webhook
            const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!discordResponse.ok) {
                throw new Error('Discord webhook failed');
            }

            // Set rate limit (cache for 10 minutes)
            const expiresAt = Date.now() + (cooldownMinutes * 60 * 1000);
            const rateLimitResponse = new Response('rate-limited', {
                headers: {
                    'Cache-Control': `public, max-age=${cooldownMinutes * 60}`,
                    'X-Expires-At': String(expiresAt),
                },
            });
            await cache.put(cacheUrl, rateLimitResponse);

            // Return success response with CORS headers
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to send message' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    },
};
