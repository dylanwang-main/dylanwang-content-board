// Supabase-backed client with the same call shape the app used with the Base44
// SDK (entities.X.list/filter/get/create/update/delete, auth.me/updateMe,
// integrations.Core uploads, functions.invoke), so hooks and pages only needed
// an import change.
import { createClient } from '@supabase/supabase-js';

const TABLES = {
  BrainFile: 'brain_files',
  Brand: 'brands',
  ContentItem: 'content_items',
  ContentScan: 'content_scans',
  Research: 'research',
  Outlier: 'outliers',
  SocialAccount: 'social_accounts',
  InstagramMedia: 'instagram_media',
  TikTokMedia: 'tiktok_media',
  YouTubeVideo: 'youtube_videos',
};

const BRAIN_BUCKET = 'brain';
const PUBLIC_BUCKET = 'public-assets';

let client;
// Created on first use so this module can be imported (and tested) without env vars.
export function getSupabase() {
  if (!client) {
    const env = import.meta.env ?? {};
    client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  }
  return client;
}

// Base44 accepted list({ sort, limit }) and the older list(sort, limit).
function readOpts(a, b) {
  if (a && typeof a === 'object') return { sort: a.sort, limit: a.limit };
  return { sort: a, limit: b };
}

function applyOpts(query, { sort, limit }) {
  if (sort) {
    const desc = sort.startsWith('-');
    query = query.order(desc ? sort.slice(1) : sort, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  return query;
}

async function run(query) {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

// list/filter resolve to { items } like the Base44 SDK's paged results.
const page = async (query) => ({ items: (await run(query)) ?? [] });

export function makeEntity(table, injected) {
  const c = () => injected ?? getSupabase();
  return {
    list: (a, b) => page(applyOpts(c().from(table).select('*'), readOpts(a, b))),
    filter: (where = {}, a, b) => {
      let q = c().from(table).select('*');
      for (const [col, val] of Object.entries(where)) {
        q = val === null ? q.is(col, null) : q.eq(col, val);
      }
      return page(applyOpts(q, readOpts(a, b)));
    },
    get: (id) => run(c().from(table).select('*').eq('id', id).maybeSingle()),
    create: (data) => run(c().from(table).insert(data).select().single()),
    update: (id, data) => run(c().from(table).update(data).eq('id', id).select().single()),
    delete: (id) => run(c().from(table).delete().eq('id', id)),
    // Used by the social sync functions to write many rows at once.
    bulkCreate: (rows) => (rows.length ? run(c().from(table).insert(rows).select()) : Promise.resolve([])),
    // Each row carries its id; existing rows are updated in place.
    bulkUpdate: (rows) =>
      rows.length ? run(c().from(table).upsert(rows, { onConflict: 'id' }).select()) : Promise.resolve([]),
  };
}

export function makeEntities(client) {
  return Object.fromEntries(Object.entries(TABLES).map(([name, table]) => [name, makeEntity(table, client)]));
}

async function requireUser(c) {
  const { data: { user } } = await c.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user;
}

export function makeAuth(injected) {
  const c = () => injected ?? getSupabase();
  const check = ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  return {
    // The signed-in user merged with their profile fields, like Base44's auth.me().
    async me() {
      const { data: { user } } = await c().auth.getUser();
      if (!user) return null;
      const profile = await run(c().from('profiles').select('*').eq('id', user.id).maybeSingle());
      return {
        ...profile,
        id: user.id,
        email: user.email,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        is_anonymous: Boolean(user.is_anonymous),
        role: 'user',
      };
    },
    async updateMe(data) {
      const user = await requireUser(c());
      return run(c().from('profiles').upsert({ id: user.id, ...data }).select().single());
    },
    signIn: (email, password) => c().auth.signInWithPassword({ email, password }).then(check),
    signUp: (email, password) =>
      c().auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } }).then(check),
    sendPasswordReset: (email) =>
      c().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }).then(check),
    updatePassword: (password) => c().auth.updateUser({ password }).then(check),
    // Guests are anonymous Supabase users with their own sandboxed rows.
    signInAsGuest: () => c().auth.signInAnonymously().then(check),
    // Turns a guest into a real account and keeps everything they made.
    upgradeGuest: (email, password) => c().auth.updateUser({ email, password }).then(check),
    getSession: () => c().auth.getSession().then((r) => check(r).session),
    onChange: (fn) => c().auth.onAuthStateChange((event, session) => fn(event, session)).data.subscription,
    logout: () => c().auth.signOut(),
  };
}

// Replaces Base44's Core file integrations with Supabase Storage.
export function makeFiles(injected) {
  const c = () => injected ?? getSupabase();
  const keyFor = (userId, file) => `${userId}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
  return {
    async UploadPrivateFile({ file }) {
      const user = await requireUser(c());
      const path = keyFor(user.id, file);
      await run(c().storage.from(BRAIN_BUCKET).upload(path, file, { contentType: file.type }));
      return { file_uri: path };
    },
    async CreateFileSignedUrl({ file_uri, expires_in = 600 }) {
      const data = await run(c().storage.from(BRAIN_BUCKET).createSignedUrl(file_uri, expires_in));
      return { signed_url: data.signedUrl };
    },
    async UploadPublicFile({ file }) {
      const user = await requireUser(c());
      const path = keyFor(user.id, file);
      await run(c().storage.from(PUBLIC_BUCKET).upload(path, file, { contentType: file.type }));
      return { file_url: c().storage.from(PUBLIC_BUCKET).getPublicUrl(path).data.publicUrl };
    },
  };
}

// Backend functions (AI, research, sync) run in the browser; see src/functions.
// Demo guests have fake channel data, so syncing is a no-op for them.
export const functions = {
  invoke: async (name, payload) => {
    if (/^sync/.test(name)) {
      const { data } = await getSupabase().auth.getUser();
      if (data?.user?.is_anonymous) {
        const err = new Error('Syncing is off in the demo. Create an account to connect your own channels.');
        err.response = { data: { error: err.message } };
        throw err;
      }
    }
    return (await import('../functions/index.js')).invoke(name, payload);
  },
};

export const api = {
  entities: makeEntities(),
  auth: makeAuth(),
  integrations: { Core: makeFiles() },
  functions,
};
