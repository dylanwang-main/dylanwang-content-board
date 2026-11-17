// AI layer: demo samples, schema handling, the Claude call loop, and the
// function dispatcher. Uses a fake Claude API, so no key or money needed.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { demoResponse, fillSchema } from '../src/ai/demo.js';
import { invokeLLM, toObjectSchema } from '../src/ai/llm.js';
import { invoke } from '../src/functions/index.js';

const store = {};
globalThis.localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
};
beforeEach(() => { for (const k of Object.keys(store)) delete store[k]; });

const CONTENT_SCHEMA = { type: 'object', properties: { topic: {}, hook: {}, script: {} } };

test('demo mode returns a labeled sample matched by schema shape', async () => {
  const out = await demoResponse(CONTENT_SCHEMA, '', 0);
  assert.ok(out.script.length > 0);
  assert.match(out.production_notes, /demo mode/);
});

test('unknown schemas get labeled placeholders of the right types', () => {
  const out = fillSchema({
    type: 'object',
    properties: { hook: { type: 'string' }, views: { type: 'number' }, tags: { type: 'array', items: { type: 'string' } } },
  });
  assert.equal(out.hook, 'Sample hook (demo mode)');
  assert.equal(out.views, 0);
  assert.equal(out.tags.length, 2);
});

test('non-object schemas are wrapped for Claude tool input', () => {
  assert.equal(toObjectSchema({ type: 'string' }).type, 'object');
});

test('with a key, the forced respond tool result is returned', async () => {
  store['cc.anthropicKey'] = 'sk-test';
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push(JSON.parse(init.body));
    assert.equal(init.headers['x-api-key'], 'sk-test');
    return new Response(JSON.stringify({ stop_reason: 'tool_use', content: [{ type: 'tool_use', name: 'respond', input: { ok: 1 } }] }));
  };
  const out = await invokeLLM({ prompt: 'hi', response_json_schema: { type: 'object', properties: { ok: { type: 'number' } } } });
  assert.deepEqual(out, { ok: 1 });
  assert.deepEqual(calls[0].tool_choice, { type: 'tool', name: 'respond' });
  assert.equal(calls[0].tools.length, 1);
});

test('web research: plain-text answer gets one forced retry', async () => {
  store['cc.anthropicKey'] = 'sk-test';
  const calls = [];
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    const content = calls.length === 1
      ? [{ type: 'text', text: 'here you go' }]
      : [{ type: 'tool_use', name: 'respond', input: { done: true } }];
    return new Response(JSON.stringify({ stop_reason: 'end_turn', content }));
  };
  const out = await invokeLLM({ prompt: 'research', response_json_schema: { type: 'object', properties: {} }, add_context_from_internet: true });
  assert.deepEqual(out, { done: true });
  assert.equal(calls[0].tools[0].name, 'web_search');
  assert.deepEqual(calls[0].tool_choice, { type: 'auto' });
  assert.deepEqual(calls[1].tool_choice, { type: 'tool', name: 'respond' });
});

test('a rejected key gives a clear message', async () => {
  store['cc.anthropicKey'] = 'bad';
  globalThis.fetch = async () => new Response('{}', { status: 401 });
  await assert.rejects(invokeLLM({ prompt: 'x', response_json_schema: { type: 'object', properties: {} } }), /key was rejected/);
});

test('dispatcher unwraps success and failure like Base44 functions.invoke', async () => {
  const registry = {
    ok: async () => ({ default: async (req) => Response.json({ echo: await req.json() }) }),
    bad: async () => ({ default: async () => Response.json({ error: 'Train your brain first' }, { status: 400 }) }),
  };
  assert.deepEqual((await invoke('ok', { a: 1 }, registry)).data, { echo: { a: 1 } });
  await assert.rejects(invoke('bad', {}, registry), (e) => e.response.data.error === 'Train your brain first' && e.status === 400);
  await assert.rejects(invoke('missing', {}, registry), /Unknown function/);
});
