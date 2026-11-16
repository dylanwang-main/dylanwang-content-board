import { createClientFromRequest } from './runtime.js';
import { loadCreatorBrain } from './shared/brain.js';

const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };

const VARIATIONS_SCHEMA = {
  type: 'object',
  properties: {
    variations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          hook: { type: 'string' },
          outline: { type: 'string' },
          why_it_fits: { type: 'string' },
        },
        required: ['title', 'hook', 'outline', 'why_it_fits'],
      },
    },
  },
  required: ['variations'],
};

function contentFormat(platform, outlierFormat) {
  if (platform === 'instagram') return 'Reel';
  if (platform === 'tiktok') return 'Short';
  return outlierFormat === 'long_form' ? 'Video' : 'Short';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const outlierId = body && body.outlier_id;
    if (!outlierId) return Response.json({ error: 'outlier_id is required' }, { status: 400 });

    const outlier = await base44.entities.Outlier.get(outlierId).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!outlier || outlier.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    if (outlier.status !== 'dissected') {
      return Response.json({ error: 'Break this post down first' }, { status: 400 });
    }

    const brain = await loadCreatorBrain(base44, user.id);
    if (!brain) {
      return Response.json({ error: 'Train your Content College AI Brain first' }, { status: 400 });
    }

    const whyItWorked = Array.isArray(outlier.why_it_worked) ? outlier.why_it_worked.join('; ') : '';

    const result =
      (await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt:
          'This post was an outlier for the creator: ' +
          (outlier.title || 'untitled') +
          '. Hook: ' +
          (outlier.hook || 'unknown') +
          '. Why it worked: ' +
          (whyItWorked || 'unknown') +
          '. Structure: ' +
          (outlier.body_analysis || 'unknown') +
          ". Write 3 to 5 new content ideas that reuse the same winning pattern for this creator's niche, offer and audience from the brain. " +
          'Each needs a title, a hook in the creator\'s voice, a short outline, and why it fits. ' +
          'Do not copy the original. HARD CONSTRAINTS in the brain are non-negotiable.\n' +
          '=== CREATOR OS BRAIN ===\n' +
          brain +
          '\n=== END BRAIN ===',
        response_json_schema: VARIATIONS_SCHEMA,
      })) || {};

    const variations = Array.isArray(result.variations) ? result.variations.filter(Boolean) : [];
    const platform = outlier.platform;
    const format = contentFormat(platform, outlier.format);

    const items = await Promise.all(
      variations.map((variation) =>
        base44.entities.ContentItem.create({
          title: variation.title || 'Untitled idea',
          platform: PLATFORM_LABELS[platform] || platform,
          format,
          status: 'idea',
          body: 'HOOK\n' + (variation.hook || '') + '\n\n' + (variation.outline || ''),
          notes:
            'Based on outlier: ' +
            (outlier.title || 'untitled') +
            ' (' +
            (outlier.source_url || '') +
            ')\n\n' +
            (variation.why_it_fits || ''),
        })
      )
    );

    await base44.entities.Outlier.update(outlierId, { variations_generated: true });

    return Response.json({ items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}