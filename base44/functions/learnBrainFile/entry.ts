import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { SECTION_LABELS } from '../../shared/brain.ts';

export default async function (req) {
  let base44 = null;
  let fileId = null;

  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    if (typeof payload?.file_id !== 'string' || !payload.file_id) {
      return Response.json({ error: 'file_id is required' }, { status: 400 });
    }
    fileId = payload.file_id;

    let file = null;
    try {
      file = await base44.entities.BrainFile.get(fileId);
    } catch {
      file = null;
    }
    if (!file || file.created_by_id !== user.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: file.file_uri,
      expires_in: 600,
    });

    const section = SECTION_LABELS[file.section] || file.section;

    const prompt = `You are the "Creator OS Brain" — a private knowledge base that learns everything about one creator so it can later write content, offers and course material exactly in their voice and within their rules.

The attached file ("${file.file_name}") was uploaded to the "${section}" section of the brain.

Study it carefully and extract what the brain must remember about this creator for the "${section}" section:
- summary: a dense, factual 3-6 sentence summary of what this file tells us about the creator (in the creator's own framing, no fluff).
- key_points: 5-15 concise, specific facts, rules, phrases, frameworks, prices, audience traits or constraints taken directly from the file. ${file.section === 'constraints' ? 'These are HARD RULES — phrase each as a clear, non-negotiable instruction.' : ''}
Only use information present in the file. Never invent details.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [signed_url],
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } },
        },
        required: ['summary', 'key_points'],
      },
    });

    const updated = await base44.entities.BrainFile.update(fileId, {
      status: 'learned',
      summary: result?.summary || '',
      key_points: (result?.key_points || []).slice(0, 20),
      error: '',
    });

    return Response.json({ file: updated });
  } catch (error) {
    if (base44 && fileId) {
      try {
        await base44.entities.BrainFile.update(fileId, {
          status: 'failed',
          error: 'Could not read this file',
        });
      } catch {
        // best effort only
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}