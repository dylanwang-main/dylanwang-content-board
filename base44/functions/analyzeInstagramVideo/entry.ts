import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { analyzeWithLLM, markAnalysisFailed } from '../../shared/socialSync.ts';

export default async function (req) {
  const base44 = createClientFromRequest(req);
  let media = null;

  try {
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mediaId = body && body.media_id;
    if (!mediaId) return Response.json({ error: 'media_id is required' }, { status: 400 });

    const record = await base44.entities.InstagramMedia.get(mediaId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!record || record.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    media = record;

    await base44.entities.InstagramMedia.update(mediaId, { status: 'analyzing' });

    let transcript = '';
    const mediaType = String(record.media_type || '').toUpperCase();
    if ((mediaType === 'VIDEO' || mediaType === 'REELS') && record.media_url) {
      try {
        const result = await base44.asServiceRole.integrations.Core.TranscribeAudio({
          audio_url: record.media_url,
        });
        transcript = typeof result === 'string' ? result : (result && result.text) || '';
      } catch (error) {
        transcript = '';
      }
    }

    const prompt =
      'You are a short-form content analyst. Analyse this Instagram post. ' +
      'Caption: ' + (record.caption || 'none') + '. ' +
      'Transcript: ' + (transcript ? transcript : 'not available, use the caption only') + '. ' +
      'Likes: ' + (record.like_count || 0) + '. ' +
      'Comments: ' + (record.comments_count || 0) + '. ' +
      'Return: hook (the opening line or first 3 seconds, quoted as closely as possible), ' +
      'summary (2 to 3 sentences on what the post says and does), and why_it_works ' +
      '(3 to 5 specific reasons it performs or does not). Never invent details that are not in the caption or transcript.';

    const analysis = await analyzeWithLLM(base44, prompt, false);

    const updated = await base44.entities.InstagramMedia.update(mediaId, {
      transcript: transcript || '',
      hook: (analysis && analysis.hook) || '',
      summary: (analysis && analysis.summary) || '',
      why_it_works: Array.isArray(analysis && analysis.why_it_works) ? analysis.why_it_works : [],
      status: 'analyzed',
      error: '',
    });

    return Response.json({ media: updated });
  } catch (error) {
    if (media && media.id) await markAnalysisFailed(base44, 'InstagramMedia', media.id);
    return Response.json({ error: error.message }, { status: 500 });
  }
}