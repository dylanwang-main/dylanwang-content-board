import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  errorMessage,
  upsertByKey,
  upsertSocialAccount,
} from '../../shared/socialSync.ts';

const VIDEO_FIELDS =
  'id,create_time,cover_image_url,share_url,video_description,duration,view_count,like_count,comment_count,share_count';

function toIso(value) {
  const seconds = Number(value);
  if (!seconds || Number.isNaN(seconds)) return '';
  return new Date(seconds * 1000).toISOString();
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let connection = null;
    try {
      connection = await base44.asServiceRole.connectors.getConnection('tiktok');
    } catch (error) {
      connection = null;
    }

    const token = connection && connection.accessToken;
    if (!token) {
      return Response.json(
        { error: 'Connect TikTok in the Base44 Integrations tab first' },
        { status: 400 }
      );
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    const profileRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count',
      { headers: authHeaders, signal: AbortSignal.timeout(15000) }
    );
    const profile = await profileRes.json();
    const profileError = profile && profile.error;
    if (!profileRes.ok || (profileError && profileError.code && profileError.code !== 'ok')) {
      return Response.json(
        { error: 'TikTok sync failed: ' + errorMessage(profileError) },
        { status: 502 }
      );
    }

    const accountInfo =
      (profile && profile.data && profile.data.user) || (profile && profile.data) || {};

    const videos = [];
    let cursor = null;

    while (videos.length < 100) {
      const body = { max_count: 20 };
      if (cursor) body.cursor = cursor;

      const listRes = await fetch(
        `https://open.tiktokapis.com/v2/video/list/?fields=${VIDEO_FIELDS}`,
        {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15000),
        }
      );
      const list = await listRes.json();
      const listError = list && list.error;
      if (!listRes.ok || (listError && listError.code && listError.code !== 'ok')) {
        return Response.json(
          { error: 'TikTok sync failed: ' + errorMessage(listError) },
          { status: 502 }
        );
      }

      const pageData = (list && list.data) || {};
      if (Array.isArray(pageData.videos)) videos.push(...pageData.videos);

      if (!pageData.has_more || !pageData.cursor) break;
      if (pageData.cursor === cursor) break;
      cursor = pageData.cursor;
    }

    const items = videos.slice(0, 100);

    await upsertByKey(base44, 'TikTokMedia', 'tt_id', items, (video) => ({
      tt_id: video.id,
      video_description: video.video_description || '',
      share_url: video.share_url,
      cover_image_url: video.cover_image_url || '',
      create_time: toIso(video.create_time),
      duration: video.duration || 0,
      view_count: video.view_count || 0,
      like_count: video.like_count || 0,
      comment_count: video.comment_count || 0,
      share_count: video.share_count || 0,
    }));

    const account = await upsertSocialAccount(base44, 'tiktok', {
      handle: accountInfo.display_name || '',
      follower_count: accountInfo.follower_count || 0,
      following_count: accountInfo.following_count || 0,
      media_count:
        accountInfo.video_count === undefined || accountInfo.video_count === null
          ? items.length
          : accountInfo.video_count,
    });

    return Response.json({ synced: items.length, account });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}