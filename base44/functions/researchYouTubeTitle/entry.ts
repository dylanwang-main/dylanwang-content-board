import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === 'string' ? body.topic.trim().slice(0, 200) : '';
    if (!topic) return Response.json({ error: 'Add a topic first' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `Research the best performing YouTube titles for the topic "${topic}". ` +
        'Return 8 title ideas for this exact topic, each with a predicted click-through score from 0 to 100 based on what currently performs, and a one-line reason. ' +
        'Order highest score first.',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          titles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                predicted_ctr: { type: 'number' },
                reason: { type: 'string' },
              },
              required: ['title', 'predicted_ctr', 'reason'],
            },
          },
        },
        required: ['titles'],
      },
    });

    return Response.json({ titles: (result && result.titles) || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}