import { createClientFromRequest, getYouTubeKey } from './runtime.js';
import { classifyFormat, parseDuration } from './shared/youtube.js';
import { upsertByKey, upsertSocialAccount } from './shared/socialSync.js';

function apiKey() {
  return getYouTubeKey();
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const raw = typeof body.handle === 'string' ? body.handle.trim() : '';
    const handle = raw.replace(/^@+/, '').trim();

    if (!handle) return Response.json({ error: 'Add your channel handle first' }, { status: 400 });

    const key = apiKey();
    if (!key) {
      return Response.json(
        { error: 'Add your YOUTUBE_API_KEY secret in the app settings first' },
        { status: 400 }
      );
    }

    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails' +
        `&forHandle=@${encodeURIComponent(handle)}&key=${key}`,
      { signal: AbortSignal.timeout(15000) }
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
          `&playlistId=${uploads}&key=${key}` +
          (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '');

        const playlistRes = await fetch(url, { signal: AbortSignal.timeout(15000) });
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

        const videosRes = await fetch(
          'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails' +
            `&id=${batch.join(',')}&key=${key}`,
          { signal: AbortSignal.timeout(15000) }
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
      };
    });

    const account = await upsertSocialAccount(base44, 'youtube', {
      handle: '@' + handle,
      follower_count: Number((channel.statistics && channel.statistics.subscriberCount) || 0),
      media_count: Number((channel.statistics && channel.statistics.videoCount) || videos.length),
      profile_url: 'https://www.youtube.com/@' + handle,
    });

    return Response.json({ synced: videos.length, account });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}