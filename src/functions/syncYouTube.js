import { createClientFromRequest, getYouTubeKey, getYouTubeAccessToken } from './runtime.js';
import { classifyFormat, parseDuration } from './shared/youtube.js';
import { upsertByKey, upsertSocialAccount } from './shared/socialSync.js';

function apiKey() {
  return getYouTubeKey();
}

// With a connected Google account (OAuth token) the owner's unlisted and
// private uploads are visible too; with only an API key YouTube returns public
// videos. Adds whichever credential we have to a YouTube Data API request.
function ytFetch(url, { key, token }) {
  const full = token ? url : `${url}&key=${key}`;
  return fetch(full, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    signal: AbortSignal.timeout(15000),
  });
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.handle === 'string' ? body.handle.trim() : '';
    const handle = raw.replace(/^@+/, '').trim();

    const key = apiKey();
    const token = getYouTubeAccessToken();
    const auth = { key, token };

    if (!handle && !token) return Response.json({ error: 'Add your channel handle first' }, { status: 400 });

    if (!key && !token) {
      return Response.json(
        { error: 'Add your YouTube Data API key in Settings first' },
        { status: 400 }
      );
    }

    const channelRes = await ytFetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails' +
        (token ? '&mine=true' : `&forHandle=@${encodeURIComponent(handle)}`),
      auth
    );
    const channelData = await channelRes.json();

    if (!channelRes.ok || (channelData.error && channelData.error.message)) {
      return Response.json(
        { error: 'YouTube sync failed: ' + ((channelData.error && channelData.error.message) || 'request failed') },
        { status: 502 }
      );
    }

    const channel = (channelData.items || [])[0];
    if (!channel) {
      return Response.json({ error: 'Channel not found. Check the handle.' }, { status: 404 });
    }

    const uploads =
      channel.contentDetails &&
      channel.contentDetails.relatedPlaylists &&
      channel.contentDetails.relatedPlaylists.uploads;

    let videos = [];

    if (uploads) {
      const ids = [];
      let pageToken = '';

      while (ids.length < 500) {
        const url =
          'https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50' +
          `&playlistId=${uploads}` +
          (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');

        const playlistRes = await ytFetch(url, auth);
        const playlist = await playlistRes.json();

        if (!playlistRes.ok || (playlist.error && playlist.error.message)) {
          return Response.json(
            { error: 'YouTube sync failed: ' + ((playlist.error && playlist.error.message) || 'request failed') },
            { status: 502 }
          );
        }

        (playlist.items || []).forEach((item) => {
          const videoId = item.contentDetails && item.contentDetails.videoId;
          if (videoId) ids.push(videoId);
        });

        pageToken = playlist.nextPageToken || '';
        if (!pageToken) break;
      }

      const uniqueIds = Array.from(new Set(ids)).slice(0, 500);

      for (let index = 0; index < uniqueIds.length; index += 50) {
        const batch = uniqueIds.slice(index, index + 50);

        const videosRes = await ytFetch(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status' +
            `&id=${batch.join(',')}`,
          auth
        );
        const videosData = await videosRes.json();

        if (!videosRes.ok || (videosData.error && videosData.error.message)) {
          return Response.json(
            { error: 'YouTube sync failed: ' + ((videosData.error && videosData.error.message) || 'request failed') },
            { status: 502 }
          );
        }

        videos.push(...(videosData.items || []));
      }
    }

    await upsertByKey(base44, 'YouTubeVideo', 'video_id', videos, (video) => {
      const snippet = video.snippet || {};
      const stats = video.statistics || {};
      const seconds = parseDuration(video.contentDetails && video.contentDetails.duration);

      return {
        video_id: video.id,
        title: snippet.title || '',
        description: (snippet.description || '').slice(0, 2000),
        thumbnail_url: (snippet.thumbnails && snippet.thumbnails.high && snippet.thumbnails.high.url) || '',
        url: 'https://www.youtube.com/watch?v=' + video.id,
        published_at: snippet.publishedAt || '',
        duration_seconds: seconds,
        format: classifyFormat(seconds),
        view_count: Number(stats.viewCount || 0),
        like_count: Number(stats.likeCount || 0),
        comment_count: Number(stats.commentCount || 0),
        // An API-key sync only ever returns public videos.
        privacy_status: (video.status && video.status.privacyStatus) || (token ? null : 'public'),
      };
    });

    const channelHandle = handle || ((channel.snippet && channel.snippet.customUrl) || '').replace(/^@+/, '');
    const account = await upsertSocialAccount(base44, 'youtube', {
      handle: '@' + channelHandle,
      follower_count: Number((channel.statistics && channel.statistics.subscriberCount) || 0),
      // The public videoCount excludes unlisted/private uploads.
      media_count: token ? videos.length : Number((channel.statistics && channel.statistics.videoCount) || videos.length),
      profile_url: 'https://www.youtube.com/@' + channelHandle,
    });

    return Response.json({ synced: videos.length, account, includesPrivate: Boolean(token) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}