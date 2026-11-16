import { createClientFromRequest } from './runtime.js';
import { analyzeWithLLM, markAnalysisFailed } from './shared/socialSync.js';

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let media = null;

  try {
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mediaId = body && body.media_id;
    if (!mediaId) return Response.json({ error: 'media_id is required' }, { status: 400 });

    const record = await base44.entities.TikTokMedia.get(mediaId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!record || record.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    media = record;

    await base44.entities.TikTokMedia.update(mediaId, { status: 'analyzing' });

    const prompt =
      'You are a short-form content analyst. Analyse this TikTok video: ' +
      (record.share_url || 'unknown') + '. ' +
      'Description: ' + (record.video_description || 'none') + '. ' +
      'Views: ' + (record.view_count || 0) + '. ' +
      'Likes: ' + (record.like_count || 0) + '. ' +
      'Comments: ' + (record.comment_count || 0) + '. ' +
      'Shares: ' + (record.share_count || 0) + '. ' +
      'Use web search for any public information about this video if available. ' +
      'Return: hook (the opening line or moment, as close to the real words as you can find, otherwise based on the description), ' +
      'summary (2 to 3 sentences), and why_it_works (3 to 5 specific reasons it performs or does not). ' +
      'Never invent dialogue you cannot find.';

    const analysis = await analyzeWithLLM(base44, prompt, true);

    const updated = await base44.entities.TikTokMedia.update(mediaId, {
      hook: (analysis && analysis.hook) || '',
      summary: (analysis && analysis.summary) || '',
      why_it_works: Array.isArray(analysis && analysis.why_it_works) ? analysis.why_it_works : [],
      status: 'analyzed',
      error: '',
    });

    return Response.json({ media: updated });
  } catch (error) {
    if (media && media.id) await markAnalysisFailed(base44, 'TikTokMedia', media.id);
    return Response.json({ error: error.message }, { status: 500 });
  }
}