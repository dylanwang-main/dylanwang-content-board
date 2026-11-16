import { createClientFromRequest } from './runtime.js';

export default async function (req) {
  let base44 = null;
  let scanId = null;

  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    if (typeof payload?.scan_id !== 'string' || !payload.scan_id) {
      return Response.json({ error: 'scan_id is required' }, { status: 400 });
    }
    scanId = payload.scan_id;

    let scan = null;
    try {
      scan = await base44.entities.ContentScan.get(scanId);
    } catch {
      scan = null;
    }
    if (!scan || scan.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const url = String(scan.url || '').slice(0, 500);
    const platform = String(scan.platform || '').slice(0, 40);

    const prompt = `You are a content analyst. Use web search to study this single ${platform} post/video: ${url}

1. PUBLIC ANALYTICS: find the publicly visible numbers — views, likes, comment count, shares, publish date. Use 0 for any number you cannot find. Add a one-line engagement_note (e.g. engagement rate relative to views, or how it compares to the creator's usual content).
2. COMMENTS: analyse the public comments. Give a summary, sentiment split as percentages (positive/neutral/negative summing to 100), the recurring themes, the questions viewers ask, and 3-6 notable comments quoted as closely as possible.
3. TRANSCRIPT: provide the spoken transcript of the video as fully and accurately as you can from captions, transcripts or descriptions available online. If you genuinely cannot access what is said, set transcript_available to false and write a short description of the content instead — never invent dialogue.
4. Identify the hook (opening line/moment) and 3-5 reasons why this content works (or doesn't).

Also return the title and creator name. Be evidence-based; do not fabricate numbers.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          creator: { type: 'string' },
          analytics: {
            type: 'object',
            properties: {
              views: { type: 'number' },
              likes: { type: 'number' },
              comments: { type: 'number' },
              shares: { type: 'number' },
              published_date: { type: 'string' },
              engagement_note: { type: 'string' },
            },
          },
          comment_analysis: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              sentiment: {
                type: 'object',
                properties: {
                  positive: { type: 'number' },
                  neutral: { type: 'number' },
                  negative: { type: 'number' },
                },
              },
              themes: { type: 'array', items: { type: 'string' } },
              questions: { type: 'array', items: { type: 'string' } },
              notable_comments: { type: 'array', items: { type: 'string' } },
            },
          },
          transcript: { type: 'string' },
          transcript_available: { type: 'boolean' },
          hook: { type: 'string' },
          why_it_works: { type: 'array', items: { type: 'string' } },
        },
        required: ['analytics', 'comment_analysis', 'transcript', 'transcript_available'],
      },
    });

    const updated = await base44.entities.ContentScan.update(scanId, {
      ...(result || {}),
      status: 'complete',
      error: '',
    });

    return Response.json({ scan: updated });
  } catch (error) {
    if (base44 && scanId) {
      try {
        await base44.entities.ContentScan.update(scanId, {
          status: 'failed',
          error: 'Scan could not be completed',
        });
      } catch {
        // best effort only
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}