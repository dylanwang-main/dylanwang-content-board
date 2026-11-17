// Lets the original backend functions (written for Base44's Deno runtime) run
// in the browser unchanged. createClientFromRequest() returns the same shape
// they were written against, backed by Supabase (data, files) and src/ai
// (LLM calls). Row-level security still scopes every query to the signed-in
// user, so "service role" here has no extra powers.
import { api } from '@/api/db';
import { invokeLLM } from '@/ai/llm';
import { getYouTubeKey } from '@/ai/keys';

function notAvailable(what) {
  return async () => {
    throw new Error(`${what} isn't available in this version of the app.`);
  };
}

const Core = {
  InvokeLLM: invokeLLM,
  CreateFileSignedUrl: api.integrations.Core.CreateFileSignedUrl,
  UploadPrivateFile: api.integrations.Core.UploadPrivateFile,
  UploadPublicFile: api.integrations.Core.UploadPublicFile,
  TranscribeAudio: notAvailable('Audio transcription'),
};

const client = {
  auth: {
    // Base44 threw a 401-tagged error when signed out; functions rely on that.
    me: async () => {
      const user = await api.auth.me();
      if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
      return user;
    },
  },
  entities: api.entities,
  integrations: { Core },
  asServiceRole: {
    entities: api.entities,
    integrations: { Core },
    connectors: {
      getConnection: async (platform) => {
        throw new Error(
          `Connecting ${platform === 'tiktok' ? 'TikTok' : 'Instagram'} needs a developer app review, so sync is off in this version.`,
        );
      },
    },
  },
};

export function createClientFromRequest() {
  return client;
}

export { getYouTubeKey };
