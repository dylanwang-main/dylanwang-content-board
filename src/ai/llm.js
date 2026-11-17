// The single entry point for every AI call in the app. It keeps the call shape
// of Base44's Core.InvokeLLM ({ prompt, response_json_schema,
// add_context_from_internet, file_urls }) so the ported functions are unchanged.
//
// - With a Claude API key (Settings): calls the Claude Messages API directly
//   from the browser. Structured output comes from a forced "respond" tool;
//   add_context_from_internet turns on Claude's web search tool.
// - Without a key: returns a realistic sample (demo mode) so the app is fully
//   clickable at zero cost.
import { getAnthropicKey } from './keys.js';
import { demoResponse } from './demo.js';

export const MODEL = 'claude-sonnet-5-5';
const API_URL = 'https://api.anthropic.com/v1/messages';
const WEB_SEARCH_TOOL = { type: 'web_search_20250305', name: 'web_search', max_uses: 5 };
const MAX_TURNS = 4;

const SYSTEM = `You are the AI backend of a creator content app. Follow the user's instructions exactly.
When you are finished (after any web research), deliver your final answer by calling the "respond" tool exactly once. Do not answer in plain text.`;

export async function invokeLLM({ prompt, response_json_schema, add_context_from_internet = false, file_urls = [] }) {
  const key = getAnthropicKey();
  if (!key) return demoResponse(response_json_schema, prompt);

  const content = [...(await Promise.all(file_urls.map(fileBlock))), { type: 'text', text: prompt }];
  const respondTool = {
    name: 'respond',
    description: 'Return the final answer as structured data.',
    input_schema: toObjectSchema(response_json_schema),
  };
  const tools = add_context_from_internet ? [WEB_SEARCH_TOOL, respondTool] : [respondTool];
  const messages = [{ role: 'user', content }];
  // Without web search, force the structured answer immediately.
  let toolChoice = add_context_from_internet ? { type: 'auto' } : { type: 'tool', name: 'respond' };

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await callClaude(key, { system: SYSTEM, messages, tools, tool_choice: toolChoice });
    const answer = res.content.find((b) => b.type === 'tool_use' && b.name === 'respond');
    if (answer) return answer.input;

    messages.push({ role: 'assistant', content: res.content });
    if (res.stop_reason === 'pause_turn') continue; // long web search: let Claude keep going
    // Claude answered in text: ask once more, this time forcing the tool.
    messages.push({ role: 'user', content: 'Now call the respond tool with your final answer.' });
    toolChoice = { type: 'tool', name: 'respond' };
  }
  throw new Error('The AI did not return a usable answer. Please try again.');
}

export async function callClaude(key, body, fetchImpl = fetch) {
  const res = await fetchImpl(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      // Required for browser calls. Safe here: the key is the visitor's own.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 8000, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) throw new Error('Your Claude API key was rejected. Check it in Settings.');
    if (res.status === 429) throw new Error('Claude is rate limiting this key. Wait a minute and try again.');
    throw new Error(data?.error?.message || `Claude API error (${res.status})`);
  }
  return data;
}

// Claude tool schemas must be JSON objects at the top level.
export function toObjectSchema(schema) {
  if (schema?.type === 'object') return schema;
  return { type: 'object', properties: { result: schema || { type: 'string' } }, required: ['result'] };
}

// Turns an uploaded Brain file (signed URL) into a Claude content block.
async function fileBlock(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not read the uploaded file.');
  const blob = await res.blob();
  const type = blob.type || '';
  if (type === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: type, data: await toBase64(blob) } };
  }
  if (type.startsWith('image/')) {
    return { type: 'image', source: { type: 'base64', media_type: type, data: await toBase64(blob) } };
  }
  return { type: 'text', text: `<file>\n${(await blob.text()).slice(0, 150000)}\n</file>` };
}

function toBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
