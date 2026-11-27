import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBriefingServer } from './briefing.mjs';

test('briefing validates the forecast, uses the selected model and caches identical requests', async (t) => {
  let calls = 0;
  const server = createBriefingServer({
    apiKey: 'test-only',
    request: async (_url, options) => {
      calls++;
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'openai/gpt-oss-20b');
      assert.match(body.messages[0].content, /Marathi/);
      return Response.json({
        choices: [{ message: { content: 'Forecast summary' } }],
      });
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const post = (data) =>
    fetch('http://127.0.0.1:' + server.address().port + '/briefing', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  const forecast = {
    lang: 'mr',
    lowC: 20,
    highC: 30,
    windKmh: 12,
    rainPercent: 65,
  };
  assert.equal((await post({ ...forecast, rainPercent: 150 })).status, 400);
  assert.equal((await post({ ...forecast, lang: 'constructor' })).status, 400);
  for (let i = 0; i < 2; i++)
    assert.deepEqual(await (await post(forecast)).json(), {
      briefing: 'Forecast summary',
    });
  assert.equal(calls, 1);
});
