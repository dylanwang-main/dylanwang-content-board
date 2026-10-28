import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  errorMessage,
  upsertByKey,
  upsertSocialAccount,
} from '../../shared/socialSync.ts';

const MEDIA_FIELDS =
  'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count';

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
        { error: 'Instagram is not connected yet. Connect the Instagram Business account, then press Sync now.' },
        { status: 400 }
      );
    }

    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(15000) }
    );
    const profile = await profileRes.json();
    if (!profileRes.ok || profile.error) {
      return Response.json(
        { error: 'Instagram sync failed: ' + errorMessage(profile && profile.error) },
        { status: 502 }
      );
    }

    const media = [];
    let next =
      `https://graph.instagram.com/me/media?fields=${MEDIA_FIELDS}` +
      `&limit=50&access_token=${encodeURIComponent(token)}`;

    while (next && media.length < 500) {
      const pageRes = await fetch(next, { signal: AbortSignal.timeout(15000) });
      const page = await pageRes.json();
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