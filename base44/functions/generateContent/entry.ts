import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { loadCreatorBrain } from '../../shared/brain.ts';

const clean = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const platform = clean(payload?.platform, 60);
    const format = clean(payload?.format, 60);
    const pillar = clean(payload?.pillar, 120);

    if (!platform || !format) {
      return Response.json({ error: 'Platform and format are required' }, { status: 400 });
    }

    const brain = await loadCreatorBrain(base44, user.id);
    if (!brain) {
      return Response.json({ error: 'Train your Content College AI Brain first' }, { status: 400 });
    }

    const prompt = `You are the Creator OS content engine. You create complete, ready-to-film content for ONE specific creator, using only their Creator OS Brain below.

TARGET: a ${format} for ${platform}.${pillar ? ` Content pillar: ${pillar}.` : ''}

STEP 1 — Analyse the platform and format. Research what currently performs best for a ${format} on ${platform}: ideal length, aspect ratio, hook timing, pacing, structure, caption length, hashtag practice and what the algorithm rewards.
STEP 2 — Choose a topic. Pick one specific, high-value topic that sits at the intersection of the creator's offer, ideal client's pains/desires, their story and teaching material. It must naturally lead the viewer toward the creator's offer. If the brain contains customer research, build the piece on one of the strongest ranked angles, speak directly to its avatar (their primary desire, defining experience and main problems) and use the audience's own language.
STEP 3 — Develop the idea: the angle, the promise to the viewer and why it will resonate with this ideal client.
STEP 4 — Write the full piece: a scroll-stopping hook, then a complete scene-by-scene script (visual direction, exact words to say, on-screen text, approximate duration per scene), a CTA, a platform-native caption and hashtags. Write in the creator's voice, use their stories, frameworks and language.

HARD CONSTRAINTS in the brain are non-negotiable — never break them. Never invent facts, prices, results or credentials that are not in the brain.

=== CREATOR OS BRAIN ===
${brain}
=== END BRAIN ===`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          title: { type: 'string' },
          idea: { type: 'string' },
          hook: { type: 'string' },
          script: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                section: { type: 'string' },
                duration: { type: 'string' },
                visual: { type: 'string' },
                voiceover: { type: 'string' },
                on_screen_text: { type: 'string' },
              },
              required: ['section', 'visual', 'voiceover'],
            },
          },
          cta: { type: 'string' },
          caption: { type: 'string' },
          hashtags: { type: 'array', items: { type: 'string' } },
          production_notes: { type: 'string' },
        },
        required: [
          'topic',
          'title',
          'idea',
          'hook',
          'script',
          'cta',
          'caption',
          'production_notes',
        ],
      },
    });

    const r = result || {};

    const scenes = (r.script || [])
      .map((scene, index) => {
        const s = scene || {};
        return (
          `SCENE ${index + 1} — ${s.section}${s.duration ? ` (${s.duration})` : ''}\n` +
          `Visual: ${s.visual}\n` +
          `Say: ${s.voiceover}` +
          (s.on_screen_text ? `\nOn-screen text: ${s.on_screen_text}` : '')
        );
      })
      .join('\n\n');

    const body = `HOOK
${r.hook}

${scenes}

CTA
${r.cta}`;

    const hashtagLine = (r.hashtags || [])
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
      .join(' ');

    const notes = `TOPIC: ${r.topic}

IDEA: ${r.idea}

CAPTION
${r.caption}

${hashtagLine}

PRODUCTION NOTES
${r.production_notes}`;

    const item = await base44.entities.ContentItem.create({
      title: r.title,
      body,
      notes,
      platform,
      format,
      pillar,
      status: 'idea',
    });

    return Response.json({ item, result: r });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}