import { createClientFromRequest } from './runtime.js';
import { instagramEndpoint } from '../lib/instagram.js';
import {
  errorMessage,
  upsertByKey,
  upsertSocialAccount,
} from './shared/socialSync.js';

const MEDIA_FIELDS =
  'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count';
// Facebook-login tokens can also read these on each post.
const EXTRA_FIELDS = ',media_product_type,is_shared_to_feed,shares_count,saved_count,total_views_count';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let connection = null;
    try {
      connection = await base44.asServiceRole.connectors.getConnection('instagram');
    } catch (error) {
      connection = null;
    }

    const token = connection && connection.accessToken;
    if (!token) {
      return Response.json(
        { error: 'Instagram is not connected yet. Add your token in Settings → Channels.' },
        { status: 400 }
      );
    }

    let endpoint;
    try {
      endpoint = instagramEndpoint(token, connection.igUserId);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    const { base, node } = endpoint;

    const profileRes = await fetch(
      `${base}/${node}?fields=id,username,followers_count,follows_count,media_count&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(15000) }
    );
    const profile = await profileRes.json();
    if (!profileRes.ok || profile.error) {
      return Response.json(
        { error: 'Instagram sync failed: ' + errorMessage(profile && profile.error) },
        { status: 502 }
      );
    }

    const firstPage = (fields) =>
      `${base}/${node}/media?fields=${fields}&limit=50&access_token=${encodeURIComponent(token)}`;
    const wantsExtras = base.includes('graph.facebook.com');
    let media = [];
    let next = firstPage(MEDIA_FIELDS + (wantsExtras ? EXTRA_FIELDS : ''));
    let triedBasic = !wantsExtras;

    while (next && media.length < 500) {
      const pageRes = await fetch(next, { signal: AbortSignal.timeout(15000) });
      const page = await pageRes.json();
      if ((!pageRes.ok || page.error) && !triedBasic) {
        // Some accounts can't read the extra fields: start over without them.
        triedBasic = true;
        media = [];
        next = firstPage(MEDIA_FIELDS);
        continue;
      }
      if (!pageRes.ok || page.error) {
        return Response.json(
          { error: 'Instagram sync failed: ' + errorMessage(page && page.error) },
          { status: 502 }
        );
      }
      if (Array.isArray(page.data)) media.push(...page.data);
      next = page.paging && page.paging.next ? page.paging.next : null;
    }

    const items = media.slice(0, 500);

    await upsertByKey(base44, 'InstagramMedia', 'ig_id', items, (item) => ({
      ig_id: item.id,
      media_type: item.media_type,
      caption: item.caption || '',
      permalink: item.permalink,
      thumbnail_url: item.thumbnail_url || item.media_url || '',
      media_url: item.media_url || '',
      timestamp: item.timestamp,
      like_count: item.like_count || 0,
      comments_count: item.comments_count || 0,
      media_product_type: item.media_product_type || null,
      is_shared_to_feed: typeof item.is_shared_to_feed === 'boolean' ? item.is_shared_to_feed : null,
      view_count: item.total_views_count ?? item.view_count ?? null,
      shares_count: item.shares_count ?? null,
      saved_count: item.saved_count ?? null,
    }));

    const account = await upsertSocialAccount(base44, 'instagram', {
      handle: '@' + profile.username,
      follower_count: profile.followers_count || 0,
      following_count: profile.follows_count || 0,
      media_count: profile.media_count || 0,
      profile_url: 'https://instagram.com/' + profile.username,
    });

    return Response.json({ synced: items.length, account });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}