import { createClientFromRequest } from './runtime.js';

const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' };
const MIN_POSTS = 5;
const OUTLIER_SCORE = 2;

const rows = (result) => (Array.isArray(result) ? result : (result && result.items) || []);

const clip = (value, max) => String(value || '').trim().slice(0, max);

function instagramRow(post) {
  const likes = post.like_count || 0;
  const comments = post.comments_count || 0;

  return {
    sourceId: post.ig_id,
    url: post.permalink || '',
    thumbnail: post.thumbnail_url || '',
    title: clip(post.caption, 80),
    caption: post.caption || '',
    format: 'short_form',
    published: post.timestamp || '',
    performance: likes + comments,
    metrics: { views: 0, likes, comments, shares: 0 },
  };
}

function tiktokRow(post) {
  return {
    sourceId: post.tt_id,
    url: post.share_url || '',
    thumbnail: post.cover_image_url || '',
    title: clip(post.video_description, 80),
    caption: post.video_description || '',
    format: 'short_form',
    published: post.create_time || '',
    performance: post.view_count || 0,
    metrics: {
      views: post.view_count || 0,
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      shares: post.share_count || 0,
    },
  };
}

function youtubeRow(post) {
  return {
    sourceId: post.video_id,
    url: post.url || '',
    thumbnail: post.thumbnail_url || '',
    title: clip(post.title, 80),
    caption: post.description || '',
    format: post.format === 'long_form' ? 'long_form' : 'short_form',
    published: post.published_at || '',
    performance: post.view_count || 0,
    metrics: {
      views: post.view_count || 0,
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      shares: 0,
    },
  };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [igResult, ttResult, ytResult, outlierResult] = await Promise.all([
      base44.entities.InstagramMedia.list({ limit: 500 }),
      base44.entities.TikTokMedia.list({ limit: 500 }),
      base44.entities.YouTubeVideo.list({ limit: 500 }),
      base44.entities.Outlier.list({ limit: 500 }),
    ]);

    const existing = new Map();
    rows(outlierResult).forEach((record) => {
      if (record.platform && record.source_id) {
        existing.set(record.platform + ':' + record.source_id, record);
      }
    });

    const skipped = [];
    let found = 0;

    const platforms = [
      { key: 'instagram', posts: rows(igResult), map: instagramRow },
      { key: 'tiktok', posts: rows(ttResult), map: tiktokRow },
      { key: 'youtube', posts: rows(ytResult), map: youtubeRow },
    ];

    for (const platform of platforms) {
      if (platform.posts.length < MIN_POSTS) {
        skipped.push(PLATFORM_LABELS[platform.key]);
        continue;
      }

      const mapped = platform.posts.map(platform.map).filter((row) => row.sourceId);
      const total = mapped.reduce((sum, row) => sum + row.performance, 0);
      const average = mapped.length ? total / mapped.length : 0;
      if (!average) continue;

      for (const row of mapped) {
        const score = Math.round((row.performance / average) * 10) / 10;
        if (score < OUTLIER_SCORE) continue;

        found += 1;

        const key = platform.key + ':' + row.sourceId;
        const match = existing.get(key);

        if (match) {
          await base44.entities.Outlier.update(match.id, {
            metrics: row.metrics,
            engagement_score: score,
            thumbnail_url: row.thumbnail,
          });
        } else {
          const created = await base44.entities.Outlier.create({
            platform: platform.key,
            source_id: row.sourceId,
            source_url: row.url,
            thumbnail_url: row.thumbnail,
            title: row.title,
            caption: row.caption,
            format: row.format,
            published_date: row.published,
            metrics: row.metrics,
            engagement_score: score,
            status: 'detected',
          });

          existing.set(key, created);
        }
      }
    }

    return Response.json({ found, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}