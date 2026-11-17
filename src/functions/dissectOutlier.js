import { createClientFromRequest } from './runtime.js';

const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

const DISSECT_SCHEMA = {
  type: 'object',
  properties: {
    hook: { type: 'string' },
    body_analysis: { type: 'string' },
    drop_off_points: { type: 'array', items: { type: 'string' } },
    retention_points: { type: 'array', items: { type: 'string' } },
    why_it_worked: { type: 'array', items: { type: 'string' } },
    full_transcript: { type: 'string' },
  },
  required: ['hook', 'body_analysis', 'drop_off_points', 'retention_points', 'why_it_worked'],
};

async function instagramTranscript(base44, sourceId) {
  if (!sourceId) return '';

  const page = await base44.entities.InstagramMedia.filter({ ig_id: sourceId }, { limit: 1 });
  const record = (page && page.items ? page.items : [])[0];
  return (record && record.transcript) || '';
}

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let outlier = null;

  try {
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const outlierId = body && body.outlier_id;
    if (!outlierId) return Response.json({ error: 'outlier_id is required' }, { status: 400 });

    const record = await base44.entities.Outlier.get(outlierId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!record || record.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    outlier = record;

    await base44.entities.Outlier.update(outlierId, { status: 'dissecting' });

    const platform = outlier.platform || 'social';
    const transcript =
      platform === 'instagram' ? await instagramTranscript(base44, outlier.source_id) : '';

    const prompt =
      'You are a content analyst. This ' +
      platform +
      ' post performed ' +
      (outlier.engagement_score || 0) +
      "x better than the creator's average. Link: " +
      (outlier.source_url || 'unknown') +
      '. Title: ' +
      (outlier.title || 'none') +
      '. Caption: ' +
      (outlier.caption || 'none') +
      '. Numbers: ' +
      JSON.stringify(outlier.metrics || {}) +
      '. Transcript: ' +
      (transcript || 'not available') +
      '. Use web search for public information about this post when available. Break down: ' +
      'the hook (first 3 to 5 seconds or first line), body_analysis (structure, pacing and how it delivers value), ' +
      'drop_off_points (where viewers likely leave), retention_points (moments that pull viewers back in), ' +
      'why_it_worked (3 to 7 specific reasons), and full_transcript only if you can find the real words. ' +
      'Never invent dialogue.';

    const analysis =
      (await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: DISSECT_SCHEMA,
      })) || {};

    const updated = await base44.entities.Outlier.update(outlierId, {
      hook: analysis.hook || '',
      body_analysis: analysis.body_analysis || '',
      drop_off_points: Array.isArray(analysis.drop_off_points) ? analysis.drop_off_points : [],
      retention_points: Array.isArray(analysis.retention_points) ? analysis.retention_points : [],
      why_it_worked: Array.isArray(analysis.why_it_worked) ? analysis.why_it_worked : [],
      full_transcript: analysis.full_transcript || transcript || outlier.full_transcript || '',
      status: 'dissected',
      error: '',
    });

    return Response.json({ outlier: updated });
  } catch (error) {
    if (outlier && outlier.id) {
      await base44.entities.Outlier.update(outlier.id, {
        status: 'failed',
        error: 'Could not break this post down',
      }).catch(() => {});
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}