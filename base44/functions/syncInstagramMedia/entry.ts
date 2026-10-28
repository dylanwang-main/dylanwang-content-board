import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MEDIA_FIELDS =
  'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count';

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

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
        { error: 'Connect Instagram in the Base44 Integrations tab first' },
        { status: 400 }
      );
    }

    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,followers_count,follows_count,media_count&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(15000) }
    );
    const profile = await profileRes.json();
    if (!profileRes.ok || profile.error) {
      const message = (profile && profile.error && profile.error.message) || 'unknown error';
      return Response.json({ error: 'Instagram sync failed: ' + message }, { status: 502 });
    }

    const media = [];
    let next =
      `https://graph.instagram.com/me/media?fields=${MEDIA_FIELDS}` +
      `&limit=50&access_token=${encodeURIComponent(token)}`;

    while (next && media.length < 200) {
      const pageRes = await fetch(next, { signal: AbortSignal.timeout(15000) });
      const page = await pageRes.json();
      if (!pageRes.ok || page.error) {
        const message = (page && page.error && page.error.message) || 'unknown error';
        return Response.json({ error: 'Instagram sync failed: ' + message }, { status: 502 });
      }
      if (Array.isArray(page.data)) media.push(...page.data);
      next = page.paging && page.paging.next ? page.paging.next : null;
    }

    const items = media.slice(0, 200);

    const existingPage = await base44.entities.InstagramMedia.filter({}, { limit: 500 });
    const existing = existingPage.items || [];
    const byIgId = new Map();
    existing.forEach((record) => {
      if (record.ig_id) byIgId.set(record.ig_id, record);
    });

    for (const batch of chunk(items, 6)) {
      await Promise.allSettled(
        batch.map((item) => {
          const data = {
            ig_id: item.id,
            media_type: item.media_type,
            caption: item.caption || '',
            permalink: item.permalink,
            thumbnail_url: item.thumbnail_url || item.media_url || '',
            media_url: item.media_url || '',
            timestamp: item.timestamp,
            like_count: item.like_count || 0,
            comments_count: item.comments_count || 0,
          };

          const found = byIgId.get(item.id);
          if (found) return base44.entities.InstagramMedia.update(found.id, data);
          return base44.entities.InstagramMedia.create({ ...data, status: 'synced' });
        })
      );
    }

    const accountPage = await base44.entities.SocialAccount.filter(
      { platform: 'instagram' },
      { limit: 1 }
    );
    const accountData = {
      platform: 'instagram',
      handle: '@' + profile.username,
      follower_count: profile.followers_count || 0,
      following_count: profile.follows_count || 0,
      media_count: profile.media_count || 0,
      profile_url: 'https://instagram.com/' + profile.username,
      last_synced: new Date().toISOString(),
    };

    const existingAccount = (accountPage.items || [])[0];
    const account = existingAccount
      ? await base44.entities.SocialAccount.update(existingAccount.id, accountData)
      : await base44.entities.SocialAccount.create(accountData);

    return Response.json({ synced: items.length, account });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}