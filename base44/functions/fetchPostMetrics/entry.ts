import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const METRIC_KEYS = ['views', 'likes', 'comments', 'shares', 'saves'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const url =
      typeof payload?.url === 'string' ? payload.url.trim().slice(0, 500) : '';
    if (!/^https?:\/\/\S+$/.test(url)) {
      return Response.json({ error: 'A valid link is required' }, { status: 400 });
    }

    let item = null;
    if (typeof payload?.content_id === 'string' && payload.content_id) {
      try {
        item = await base44.entities.ContentItem.get(payload.content_id);
      } catch {
        item = null;
      }
      if (!item || item.created_by_id !== user.id) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }
    }

    const prompt = `Use web search to find the current publicly visible performance numbers for this single social media post: ${url}

Return: views (or plays), likes, comments, shares, saves, and the publish date in YYYY-MM-DD format.
Use 0 for any number that is not publicly available, and an empty string for an unknown date. Never invent numbers — only report what you can find.`;

    const result =
      (await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            views: { type: 'number' },
            likes: { type: 'number' },
            comments: { type: 'number' },
            shares: { type: 'number' },
            saves: { type: 'number' },
            published_date: { type: 'string' },
          },
          required: ['views', 'likes', 'comments', 'shares', 'saves'],
        },
      })) || {};

    const metrics = {};
    for (const key of METRIC_KEYS) {
      const found = Math.max(0, Math.round(Number(result[key]) || 0));
      const existing = Math.max(0, Math.round(Number(item?.[key]) || 0));
      metrics[key] = found === 0 ? existing : found;
    }
    if (DATE_PATTERN.test(String(result.published_date || ''))) {
      metrics.published_date = result.published_date;
    }

    if (item) {
      await base44.entities.ContentItem.update(item.id, { ...metrics, url });
    }

    return Response.json({ metrics });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}