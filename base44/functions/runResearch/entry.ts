import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildBrain } from '../../shared/brain.ts';

export default async function (req) {
  let base44 = null;
  let researchId = null;

  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    if (typeof payload?.research_id !== 'string' || !payload.research_id) {
      return Response.json({ error: 'research_id is required' }, { status: 400 });
    }
    researchId = payload.research_id;

    let research = null;
    try {
      research = await base44.entities.Research.get(researchId);
    } catch {
      research = null;
    }
    if (!research || research.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const [{ items: files }, { items: brands }] = await Promise.all([
      base44.entities.BrainFile.filter(
        { status: 'learned', created_by_id: user.id },
        { sort: '-created_date', limit: 100 }
      ),
      base44.entities.Brand.filter({ created_by_id: user.id }, { sort: '-created_date', limit: 1 }),
    ]);

    const brain = buildBrain(files, brands[0] || null) || 'No brain data yet.';

    const source = String(research.source || '').slice(0, 300);
    const whose = research.source_type === 'competitor' ? "a COMPETITOR's" : "the creator's OWN";

    const prompt = `You are the Creator OS research engine. You do deep customer research for ONE creator, tailored to their Creator OS Brain below.

SOURCE: ${whose} ${research.platform} page: ${source}

STEP 1 — CUSTOMER RESEARCH. Use web search to study this ${research.platform} page: its posts, captions, top-performing content, comments, the people engaging, and any public discussion around it. Identify who the audience is and what they have in common. For each shared theme, estimate what % of the audience/content signals share it (commonalities, percentages 0-100, based on the evidence you found). Extract their pains, desires, objections, and the exact language/phrases they use.
STEP 2 — AVATARS. From the research, define 1 core avatar and exactly 3 sub avatars. Each has: name, short description, primary desire, defining experience (the pivotal moment/experience that shapes them), and main problems. Make them fit the creator's offer and ideal client in the brain.
STEP 3 — ANGLES. Create 8-12 content angles derived from the avatars. Each angle: title, hook_idea (one line), avatar (name of the avatar it targets), strength (0-100: how strongly the research points to it), evidence (what in the research supports it). Order strongest first.

Be specific and evidence-based. Never invent statistics you have no basis for — if evidence is thin, lower the percentages/strength accordingly. Respect any hard constraints in the brain.

=== CREATOR OS BRAIN ===
${brain}
=== END BRAIN ===`;

    const avatarSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        primary_desire: { type: 'string' },
        defining_experience: { type: 'string' },
        main_problems: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'primary_desire', 'defining_experience', 'main_problems'],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          customer_research: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              commonalities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    theme: { type: 'string' },
                    percentage: { type: 'number' },
                    detail: { type: 'string' },
                  },
                  required: ['theme', 'percentage', 'detail'],
                },
              },
              pains: { type: 'array', items: { type: 'string' } },
              desires: { type: 'array', items: { type: 'string' } },
              objections: { type: 'array', items: { type: 'string' } },
              language: { type: 'array', items: { type: 'string' } },
            },
            required: ['summary', 'commonalities', 'pains', 'desires'],
          },
          core_avatar: avatarSchema,
          sub_avatars: { type: 'array', items: avatarSchema },
          angles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                hook_idea: { type: 'string' },
                avatar: { type: 'string' },
                strength: { type: 'number' },
                evidence: { type: 'string' },
              },
              required: ['title', 'hook_idea', 'avatar', 'strength', 'evidence'],
            },
          },
        },
        required: ['customer_research', 'core_avatar', 'sub_avatars', 'angles'],
      },
    });

    const angles = (result?.angles || [])
      .slice()
      .sort((a, b) => (b?.strength || 0) - (a?.strength || 0))
      .map((angle, index) => ({ ...angle, rank: index + 1 }));

    const updated = await base44.entities.Research.update(researchId, {
      status: 'complete',
      customer_research: result?.customer_research || {},
      core_avatar: result?.core_avatar || null,
      sub_avatars: (result?.sub_avatars || []).slice(0, 3),
      angles,
      error: '',
    });

    return Response.json({ research: updated });
  } catch (error) {
    if (base44 && researchId) {
      try {
        await base44.entities.Research.update(researchId, {
          status: 'failed',
          error: 'Research could not be completed',
        });
      } catch {
        // best effort only
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}