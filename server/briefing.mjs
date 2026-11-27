import http from 'node:http';
import { pathToFileURL } from 'node:url';

const languages = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
const ranges = {
  lowC: [-100, 70],
  highC: [-100, 70],
  rainPercent: [0, 100],
  windKmh: [0, 500],
};

export function createBriefingServer({
  apiKey = process.env.GROQ_API_KEY,
  request = fetch,
} = {}) {
  const cache = new Map();
  let minute = 0;
  let requests = 0;
  return http.createServer({ requestTimeout: 10000 }, async (req, res) => {
    function send(status, data) {
      res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      });
      res.end(JSON.stringify(data));
    }
    if (req.url !== '/briefing') return send(404, {});
    if (req.method === 'OPTIONS') return send(204, {});
    if (req.method !== 'POST') return send(405, {});
    if (!apiKey) return send(503, { error: 'AI briefing is not configured' });
    try {
      let body = '';
      for await (const part of req) {
        body += part;
        if (Buffer.byteLength(body) > 1024) return send(413, {});
      }
      const input = JSON.parse(body);
      if (!input || !Object.hasOwn(languages, input.lang)) return send(400, {});
      const forecast = {};
      for (const [field, [min, max]] of Object.entries(ranges)) {
        const value = input[field];
        if (!Number.isFinite(value) || value < min || value > max)
          return send(400, {});
        forecast[field] = Math.round(value);
      }
      if (forecast.lowC > forecast.highC) return send(400, {});
      const key = JSON.stringify([input.lang, forecast]);
      if (cache.has(key)) return send(200, { briefing: cache.get(key) });
      const window = Math.floor(Date.now() / 60000);
      if (minute !== window) {
        minute = window;
        requests = 0;
      }
      if (++requests > 8) return send(429, { error: 'Try again later' });
      const reply = await request(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(18000),
          body: JSON.stringify({
            model: 'openai/gpt-oss-20b',
            reasoning_effort: 'low',
            max_completion_tokens: 500,
            messages: [
              {
                role: 'system',
                content:
                  'Write two short practical weather sentences in ' +
                  languages[input.lang] +
                  '. Use only supplied daily forecast values. Keep Celsius. Do not invent timings, warnings, health advice or observations.',
              },
              { role: 'user', content: JSON.stringify(forecast) },
            ],
          }),
        },
      );
      if (!reply.ok) return send(reply.status === 429 ? 429 : 502, {});
      const message = (
        await reply.json()
      ).choices?.[0]?.message?.content?.trim();
      if (!message) return send(502, {});
      if (cache.size >= 256) cache.delete(cache.keys().next().value);
      cache.set(key, message);
      send(200, { briefing: message });
    } catch (error) {
      send(error instanceof SyntaxError ? 400 : 503, {});
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  createBriefingServer().listen(
    Number(process.env.PORT || 8787),
    process.env.HOST || '127.0.0.1',
  );
}
