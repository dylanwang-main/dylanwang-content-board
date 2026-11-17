import { createClientFromRequest, getYouTubeKey } from './runtime.js';
import { loadCreatorBrain } from './shared/brain.js';
import {
  SOPS,
  askWithThumbnails,
  describeCompetitors,
  searchCompetitors,
} from './shared/youtube.js';

const STOP_WORDS = ['the', 'and', 'for', 'your', 'you', 'how', 'with', 'that', 'this', 'are', 'from', 'into', 'about', 'a', 'to', 'of', 'in', 'on'];

function apiKey() {
  return getYouTubeKey();
}

function mainWords(topic) {
  return String(topic || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.includes(word));
}

function buildBody(plan) {
  const opening = plan.opening || {};
  const blocks = [];

  blocks.push(
    [
      'OPENING',
      `Problem: ${opening.problem || ''}`,
      `Why it matters: ${opening.why_it_matters || ''}`,
      `What they get: ${opening.what_they_get || ''}`,
    ].join('\n')
  );

  (plan.plan || []).forEach((step, index) => {
    blocks.push(
      [`STEP ${index + 1}: ${step.step || ''}`, ...(step.points || []).map((point) => `- ${point}`)].join('\n')
    );
  });

  blocks.push(`PAYOFF\n${plan.payoff || ''}`);

  if ((plan.pattern_interrupts || []).length) {
    blocks.push(['PATTERN INTERRUPTS', ...plan.pattern_interrupts.map((line) => `- ${line}`)].join('\n'));
  }

  return blocks.join('\n\n');
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 200) : '';
    if (!topic) return Response.json({ error: 'Add a topic first' }, { status: 400 });

    const brain = await loadCreatorBrain(base44, user.id);
    if (!brain) {
      return Response.json({ error: 'Train your Brain first' }, { status: 400 });
    }

    const stepOne = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `=== MANDATORY TOPIC (HIGHEST PRIORITY) ===
The creator has chosen this EXACT topic: "${topic}".
The working_title MUST directly reference this topic. For example, if the topic is "how to post on Instagram", the working title must be something like "How To Post On Instagram: ..." or "The Right Way To Post On Instagram".
Do NOT write a title about a different angle, framework or topic from the brain. The brain shapes the approach and voice, NOT the topic.
=== END MANDATORY TOPIC ===
Return the topic exactly as given, a working title for a long-form YouTube video, and 3 YouTube search queries that would find the top competing videos on this exact topic.
=== CREATOR OS BRAIN ===
${brain}
=== END BRAIN ===`,
      response_json_schema: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          working_title: { type: 'string' },
          search_queries: { type: 'array', items: { type: 'string' } },
        },
        required: ['topic', 'working_title', 'search_queries'],
      },
    });

    const workingTitle = (stepOne && stepOne.working_title) || topic;
    const queries = (stepOne && Array.isArray(stepOne.search_queries) ? stepOne.search_queries : []).filter(Boolean);

    const competitors = await searchCompetitors(apiKey(), queries);

    const result = await askWithThumbnails(
      base44,
      `=== MANDATORY TOPIC (HIGHEST PRIORITY) ===
Topic: "${topic}". Working title: "${workingTitle}".
The FIRST title option MUST directly reference this topic. Every title option, thumbnail and section of the plan MUST be directly about this topic. Do not replace the topic with a brain framework or a different angle, and do not drift to a different topic.
=== END MANDATORY TOPIC ===
You are a YouTube strategist writing a complete long-form video plan for ONE creator, in their voice, using their stories, proof and frameworks from the brain. Follow these rules:
${SOPS}
Competing videos on this topic (thumbnails attached in the same order):
${describeCompetitors(competitors) || 'No competitor data available.'}
Study what the top competitors do in their titles and thumbnails and find how this creator can stand out.
HARD CONSTRAINTS in the brain are non-negotiable. Never invent results, prices or credentials that are not in the brain.
=== CREATOR OS BRAIN ===
${brain}
=== END BRAIN ===`,
      {
        type: 'object',
        properties: {
          idea: { type: 'string' },
          opening: {
            type: 'object',
            properties: {
              problem: { type: 'string' },
              why_it_matters: { type: 'string' },
              what_they_get: { type: 'string' },
            },
            required: ['problem', 'why_it_matters', 'what_they_get'],
          },
          proof: { type: 'array', items: { type: 'string' } },
          plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                step: { type: 'string' },
                points: { type: 'array', items: { type: 'string' } },
              },
              required: ['step', 'points'],
            },
          },
          payoff: { type: 'string' },
          pattern_interrupts: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          clip_ideas: { type: 'array', items: { type: 'string' } },
          title_options: { type: 'array', items: { type: 'string' } },
          thumbnails: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                concept: { type: 'string' },
                text_overlay: { type: 'string' },
                visual_direction: { type: 'string' },
              },
              required: ['concept', 'text_overlay', 'visual_direction'],
            },
          },
          standout_strategy: { type: 'string' },
          competitor_insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                why_it_works: { type: 'string' },
              },
              required: ['title', 'why_it_works'],
            },
          },
        },
        required: [
          'idea',
          'opening',
          'proof',
          'plan',
          'payoff',
          'pattern_interrupts',
          'description',
          'tags',
          'clip_ideas',
          'title_options',
          'thumbnails',
          'standout_strategy',
          'competitor_insights',
        ],
      },
      competitors
    );

    const titleOptions = Array.isArray(result.title_options) ? result.title_options.filter(Boolean) : [];
    const words = mainWords(topic);
    const first = String(titleOptions[0] || '').toLowerCase();

    if (!first || words.some((word) => !first.includes(word))) {
      titleOptions.unshift(workingTitle);
    }

    const insights = Array.isArray(result.competitor_insights) ? result.competitor_insights : [];
    const mergedCompetitors = competitors.map((competitor) => {
      const match = insights.find(
        (insight) => String(insight.title || '').toLowerCase() === String(competitor.title || '').toLowerCase()
      );
      return { ...competitor, why_it_works: match ? match.why_it_works || '' : '' };
    });

    const plan = {
      topic,
      working_title: workingTitle,
      ...result,
      title_options: titleOptions,
      competitors: mergedCompetitors,
      source: 'ai',
    };

    const item = await base44.entities.ContentItem.create({
      title: titleOptions[0] || workingTitle,
      platform: 'YouTube',
      format: 'Video',
      status: 'idea',
      body: buildBody(plan),
      notes: `DESCRIPTION\n${plan.description || ''}\n\nTAGS\n${(plan.tags || []).join(', ')}`,
      youtube_plan: plan,
    });

    return Response.json({ item, plan });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}