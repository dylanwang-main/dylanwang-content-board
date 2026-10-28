export const SOPS = `- Open with a pattern-interrupt hook in the first 5 seconds.
- In the first 30 seconds state the problem, why it matters, and what the viewer gets.
- Build curiosity gaps the viewer needs closed.
- The title makes one clear value promise.
- The thumbnail and title work together and never repeat each other word for word.
- Add a pattern interrupt every 60 to 90 seconds.
- End with a payoff and one call to action.`;

export function parseDuration(iso) {
  if (!iso || typeof iso !== 'string') return 0;

  const match = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) return 0;

  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);

  return Math.round(days * 86400 + hours * 3600 + minutes * 60 + seconds);
}

export function classifyFormat(seconds) {
  return Number(seconds) > 180 ? 'long_form' : 'short_form';
}

export async function searchCompetitors(apiKey, queries, max = 8) {
  if (!apiKey) return [];

  try {
    const ids = [];

    for (const query of (queries || []).slice(0, 5)) {
      if (!query) continue;

      const searchRes = await fetch(
        'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount' +
          `&maxResults=5&q=${encodeURIComponent(query)}&key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!searchRes.ok) return [];

      const search = await searchRes.json();
      for (const item of search.items || []) {
        const id = item && item.id && item.id.videoId;
        if (id && !ids.includes(id)) ids.push(id);
      }
    }

    if (!ids.length) return [];

    const videosRes = await fetch(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails' +
        `&id=${ids.slice(0, 25).join(',')}&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!videosRes.ok) return [];

    const videos = await videosRes.json();

    const list = (videos.items || []).map((video) => ({
      video_id: video.id,
      title: (video.snippet && video.snippet.title) || '',
      channel: (video.snippet && video.snippet.channelTitle) || '',
      views: Number((video.statistics && video.statistics.viewCount) || 0),
      published_at: (video.snippet && video.snippet.publishedAt) || '',
      url: 'https://www.youtube.com/watch?v=' + video.id,
      thumbnail_url:
        (video.snippet && video.snippet.thumbnails && video.snippet.thumbnails.high
          ? video.snippet.thumbnails.high.url
          : '') || '',
    }));

    list.sort((a, b) => b.views - a.views);

    return list.slice(0, max);
  } catch (error) {
    return [];
  }
}

export function describeCompetitors(list) {
  return (list || [])
    .map((c, i) => `${i + 1}. ${c.title} | ${c.channel} | ${c.views} views`)
    .join('\n');
}

export async function askWithThumbnails(base44, prompt, schema, competitors) {
  const files = (competitors || [])
    .slice(0, 6)
    .map((c) => c.thumbnail_url)
    .filter(Boolean);

  const payload = { prompt, response_json_schema: schema };
  if (files.length) payload.file_urls = files;

  return await base44.asServiceRole.integrations.Core.InvokeLLM(payload);
}