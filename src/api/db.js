// Supabase-backed data layer with the same call shape the app used with the
// Base44 SDK (entities.X.list/filter/get/create/update/delete, auth.me/updateMe),
// so hooks and pages keep working with an import swap.
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

export function makeEntity(table, injected) {
  const c = () => injected ?? getSupabase();
  return {
    list: (a, b) => run(applyOpts(c().from(table).select('*'), readOpts(a, b))),
    filter: (where = {}, a, b) => {
      let q = c().from(table).select('*');
      for (const [col, val] of Object.entries(where)) {
        q = val === null ? q.is(col, null) : q.eq(col, val);
      }
      return run(applyOpts(q, readOpts(a, b)));
    },
    get: (id) => run(c().from(table).select('*').eq('id', id).maybeSingle()),
    create: (data) => run(c().from(table).insert(data).select().single()),
    update: (id, data) => run(c().from(table).update(data).eq('id', id).select().single()),
    delete: (id) => run(c().from(table).delete().eq('id', id)),
  };
}

export function makeEntities(client) {
  return Object.fromEntries(Object.entries(TABLES).map(([name, table]) => [name, makeEntity(table, client)]));
}

export function makeAuth(injected) {
  const c = () => injected ?? getSupabase();
  return {
    // Returns the signed-in user merged with their profile fields, like Base44's auth.me().
    async me() {
      const { data: { user } } = await c().auth.getUser();
      if (!user) return null;
      const profile = await run(c().from('profiles').select('*').eq('id', user.id).maybeSingle());
      return {
        ...profile,
        id: user.id,
        email: user.email,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        role: 'user',
      };
    },
    async updateMe(data) {
      const { data: { user } } = await c().auth.getUser();
      if (!user) throw new Error('Not signed in');
      return run(c().from('profiles').upsert({ id: user.id, ...data }).select().single());
    },
    logout: () => c().auth.signOut(),
  };
}

export const db = {
  entities: makeEntities(),
  auth: makeAuth(),
};
