export function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, size + i));
  return out;
}

export function errorMessage(error, fallback) {
  if (!error) return fallback || 'unknown error';
  return error.message || error.code || fallback || 'unknown error';
}

export async function upsertSocialAccount(base44, platform, data) {
  const page = await base44.entities.SocialAccount.filter({ platform }, { limit: 1 });
  const existing = (page.items || [])[0];
  const payload = { ...data, platform, last_synced: new Date().toISOString() };

  return existing
    ? await base44.entities.SocialAccount.update(existing.id, payload)
    : await base44.entities.SocialAccount.create(payload);
}

export const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    hook: { type: 'string' },
    summary: { type: 'string' },
    why_it_works: { type: 'array', items: { type: 'string' } },
  },
  required: ['hook', 'summary', 'why_it_works'],
};

export async function analyzeWithLLM(base44, prompt, addContext) {
  return await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: Boolean(addContext),
    response_json_schema: ANALYSIS_SCHEMA,
  });
}

export async function markAnalysisFailed(base44, entityName, mediaId) {
  try {
    await base44.entities[entityName].update(mediaId, {
      status: 'failed',
      error: 'Analysis could not be completed',
    });
  } catch (error) {
    // best effort
  }
}

export async function upsertByKey(base44, entityName, keyField, items, mapItem) {
  const page = await base44.entities[entityName].filter({}, { limit: 500 });
  const byKey = new Map();
  (page.items || []).forEach((record) => {
    const value = record[keyField];
    if (value) byKey.set(value, record);
  });

  for (const batch of chunk(items, 6)) {
    await Promise.allSettled(
      batch.map((item) => {
        const data = mapItem(item);
        const found = byKey.get(data[keyField]);
        return found
          ? base44.entities[entityName].update(found.id, data)
          : base44.entities[entityName].create({ ...data, status: 'synced' });
      })
    );
  }
}