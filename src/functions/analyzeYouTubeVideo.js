import { createClientFromRequest } from './runtime.js';

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    hook: { type: 'string' },
    summary: { type: 'string' },
    why_it_works: { type: 'array', items: { type: 'string' } },
  },
  required: ['hook', 'summary', 'why_it_works'],
};

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let record = null;

  try {
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recordId = body && body.video_record_id;
    if (!recordId) return Response.json({ error: 'video_record_id is required' }, { status: 400 });

    const video = await base44.entities.YouTubeVideo.get(recordId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!video || video.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    record = video;

    await base44.entities.YouTubeVideo.update(recordId, { status: 'analyzing', error: '' });

    const kind = record.format === 'long_form' ? 'Long form video' : 'Short';

    const prompt =
      'You are a YouTube content analyst. Analyse this ' + kind + '. ' +
      'Title: ' + (record.title || 'none') + '. ' +
      'Description: ' + (record.description || 'none') + '. ' +
      'Views: ' + (record.view_count || 0) + '. ' +
      'Likes: ' + (record.like_count || 0) + '. ' +
      'Comments: ' + (record.comment_count || 0) + '. ' +
      'Return: hook (the idea most likely to grab attention in the first few seconds, based on the title and description), ' +
      'summary (one or two sentences on what the video is about), and ' +
      'why_it_works (3 to 5 specific reasons it performs or does not, for example curiosity gap, clear payoff, relatable problem or strong title). ' +
      'Never invent details that are not in the title or description.';

    const analysis =
      (await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: ANALYSIS_SCHEMA,
      })) || {};

    const updated = await base44.entities.YouTubeVideo.update(recordId, {
      hook: analysis.hook || '',
      summary: analysis.summary || '',
      why_it_works: Array.isArray(analysis.why_it_works) ? analysis.why_it_works : [],
      status: 'analyzed',
      error: '',
    });

    return Response.json({ video: updated });
  } catch (error) {
    if (record && record.id) {
      await base44.entities.YouTubeVideo.update(record.id, {
        status: 'failed',
        error: 'Analysis could not be completed',
      }).catch(() => {});
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}