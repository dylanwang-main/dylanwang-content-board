import { createClientFromRequest } from './runtime.js';
import { loadCreatorBrain } from './shared/brain.js';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const brain = await loadCreatorBrain(base44, user.id);
    if (!brain) {
      return Response.json({ error: 'Train your Content College AI Brain first' }, { status: 400 });
    }

    const prompt = `You are a business strategist for creators. Build a practical, step-by-step roadmap for this ONE creator to earn their first $1,000 online, in their specific niche, using their existing offer, audience, story and content pillars from the Creator OS Brain below.

Give 5-7 sequential steps. Each step has a short title, a realistic timeframe (e.g. "Week 1"), 2-4 concrete actions tailored to this creator (name the content to post, the angle to use, who to reach, what to sell), and a measurable target for that step. Include the revenue math (price x number of sales) showing how they reach $1,000. If customer research is present, use its avatars and strongest angles.

HARD CONSTRAINTS in the brain are non-negotiable. Never invent prices, results or credentials that are not in the brain; if no price exists, suggest one and label it as a suggestion.

=== CREATOR OS BRAIN ===
${brain}
=== END BRAIN ===`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          revenue_math: { type: 'string' },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                timeframe: { type: 'string' },
                actions: { type: 'array', items: { type: 'string' } },
                target: { type: 'string' },
              },
              required: ['title', 'timeframe', 'actions', 'target'],
            },
          },
        },
        required: ['summary', 'revenue_math', 'steps'],
      },
    });

    return Response.json({
      roadmap: { ...(result || {}), created_at: new Date().toISOString() },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}