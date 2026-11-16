// Demo mode: realistic sample answers so every AI feature works without an
// API key. Samples are picked by the shape of the requested JSON schema, so
// the ported functions don't need to know demo mode exists. Every sample says
// it's a sample, so nothing passes as a real AI result.
const DEMO_DELAY_MS = 1200;
const NOTE = 'Sample output (demo mode). Add your Claude API key in Settings for real AI.';

const has = (schema, ...keys) => keys.every((k) => schema?.properties && k in schema.properties);

const SAMPLES = [
  {
    match: (s) => has(s, 'topic', 'hook', 'script'),
    build: () => ({
      topic: 'Posting before you feel ready',
      title: 'My first video got 41 views. Post yours anyway.',
      idea: 'Show the real numbers from the first month to prove that starting badly beats not starting.',
      hook: 'My first video got 41 views. Here is why I am glad I posted it.',
      script: [
        { section: 'Hook', duration: '0-3s', visual: 'Phone screen showing 41 views', voiceover: 'My first video got 41 views.', on_screen_text: '41 views.' },
        { section: 'Turn', duration: '3-12s', visual: 'Scroll through early videos', voiceover: 'I almost deleted it. Instead I posted 29 more, and each one got a little better.', on_screen_text: 'Day 1 to Day 30' },
        { section: 'Proof', duration: '12-22s', visual: 'Analytics chart going up', voiceover: 'Video 30 hit twelve thousand. Same person, same phone, just reps.', on_screen_text: '41 → 12,000' },
        { section: 'Lesson', duration: '22-28s', visual: 'Talking to camera in dorm', voiceover: 'You do not get good and then post. You post and then get good.' },
      ],
      cta: 'Follow to watch the next 30 days.',
      caption: 'Video 1 vs video 30. Post the bad one.',
      hashtags: ['buildinpublic', 'contentcreator', 'collegecreator'],
      production_notes: `${NOTE} Film in one take, natural light, keep the cut on the chart reveal.`,
    }),
  },
  {
    match: (s) => has(s, 'revenue_math', 'steps'),
    build: () => ({
      summary: `${NOTE} A 6-week plan to earn the first $1,000 from a beginner-friendly creator offer.`,
      revenue_math: '$50 editing template pack x 20 sales = $1,000 (price is a suggestion).',
      steps: [
        { title: 'Pick one offer', timeframe: 'Week 1', actions: ['Package your editing presets into a template pack', 'Write a one-page sales page'], target: 'Offer live with a checkout link' },
        { title: 'Post the proof', timeframe: 'Weeks 2-3', actions: ['Post 3 before/after edit reels a week', 'End each with a follow CTA'], target: '500 new followers' },
        { title: 'Open the doors', timeframe: 'Weeks 4-6', actions: ['Share the pack in stories twice a week', 'DM everyone who asks how you edit'], target: '20 sales' },
      ],
    }),
  },
  {
    match: (s) => has(s, 'summary', 'key_points') && Object.keys(s.properties).length === 2,
    build: () => ({
      summary: `${NOTE} This file describes the creator's voice, audience and rules.`,
      key_points: ['Casual, direct tone', 'Audience: students starting to post', 'Always show real numbers', 'Never promise results'],
    }),
  },
  {
    match: (s) => has(s, 'customer_research', 'core_avatar', 'angles'),
    build: () => ({
      customer_research: {
        summary: `${NOTE} The audience is students who want to start posting but feel behind.`,
        commonalities: [
          { theme: 'Feel behind other creators', percentage: 60, detail: 'Comments compare themselves to bigger accounts.' },
          { theme: 'Short on time', percentage: 45, detail: 'Many ask how to fit posting around classes.' },
        ],
        pains: ['No time', 'Afraid of being judged'],
        desires: ['Grow an audience', 'Make first money online'],
        objections: ['My gear is not good enough'],
        language: ['I keep putting it off'],
      },
      core_avatar: { name: 'The Quiet Starter', description: 'Has drafts, has not posted.', primary_desire: 'Post without fear', defining_experience: 'Deleted their first video', main_problems: ['Perfectionism'] },
      sub_avatars: [
        { name: 'The Busy Grinder', description: 'Classes plus a job.', primary_desire: 'A system that fits 3 hours a week', defining_experience: 'Missed a week, lost momentum', main_problems: ['Time'] },
      ],
      angles: [
        { title: 'Post before you are ready', hook_idea: 'My first video got 41 views.', avatar: 'The Quiet Starter', strength: 85, evidence: 'Fear of posting is the top comment theme.' },
        { title: 'The 3-hour week', hook_idea: '5 videos in 3 hours, here is the schedule.', avatar: 'The Busy Grinder', strength: 70, evidence: 'Time is the #2 question.' },
      ],
    }),
  },
];

// Fallback for any other schema: fill each field with a labeled placeholder.
export function fillSchema(schema, key = 'value') {
  switch (schema?.type) {
    case 'object': {
      const out = {};
      for (const [k, v] of Object.entries(schema.properties || {})) out[k] = fillSchema(v, k);
      return out;
    }
    case 'array':
      return [fillSchema(schema.items, key), fillSchema(schema.items, key)];
    case 'number':
    case 'integer':
      return /percent|positive|neutral|negative|strength|score/i.test(key) ? 33 : 0;
    case 'boolean':
      return false;
    default:
      return `Sample ${key.replace(/_/g, ' ')} (demo mode)`;
  }
}

export async function demoResponse(schema, _prompt, delay = DEMO_DELAY_MS) {
  if (delay) await new Promise((r) => setTimeout(r, delay));
  const sample = SAMPLES.find((s) => s.match(schema));
  return sample ? sample.build() : fillSchema(schema);
}
