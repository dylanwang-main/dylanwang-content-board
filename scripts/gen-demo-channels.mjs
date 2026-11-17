// Generates supabase/migrations/0013_demo_channels.sql: fictional Instagram,
// TikTok and YouTube posts for guest demo workspaces, so Analysis, Posting
// habits and the channel pages have something real-looking to show.
//
// The data is deterministic (seeded RNG) and dated relative to signup in
// weeks + weekday + hour (Pacific), so weekday/time patterns survive.
// Baked-in patterns the Analysis page should find: Tue/Thu evenings win,
// short captions beat long ones, short TikToks beat long ones, winners get
// more shares per view, plus a 12-day finals gap.
import { writeFileSync } from "node:fs";

let seed = 42;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const normal = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
const pick = (list) => list[Math.floor(rand() * list.length)];
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const round = (n) => Math.max(0, Math.round(n));

// Weeks ago (0 = this week), weekday 0=Mon..6=Sun, Pacific hour/minute.
function slot(maxWeeks) {
  return { w: Math.floor(rand() * maxWeeks), d: Math.floor(rand() * 7), h: 0, mi: Math.floor(rand() * 60) };
}
const inFinalsGap = (s) => s.w * 7 - s.d >= 60 && s.w * 7 - s.d <= 72;

const REEL_SHORT = [
  "Day 1 of filming everything",
  "dorm room b-roll setup",
  "3am edit session",
  "first time using a gimbal",
  "campus at golden hour",
  "this edit took 6 hours",
  "my roommate hates the ring light",
  "filming in the library (got kicked out)",
  "studio tour: it's a desk",
  "posting before I'm ready",
  "week 4 numbers",
  "trying the Casey Neistat transition",
  "one take, no edits",
  "gym then edit then class",
  "the shot I almost didn't get",
  "beach sunset timelapse",
  "my $40 audio setup",
  "climbing gym POV",
  "learning to color grade",
  "finals week vlog pt 1",
];
const REEL_LONG = [
  "Every video I post gets analyzed in my own dashboard. Here's what 6 months of data says about hooks, timing and why my best posts all have one thing in common. Follow along.",
  "I tried posting every single day for 30 days while taking 16 units. Honestly it broke me a little, but the numbers were worth looking at. Full breakdown below and in the next video.",
  "Nobody tells you that the first 1,000 followers are the hardest part. This is what changed for me between 0 and 2,000 and what I would do differently if I started again today.",
  "Here's my full editing workflow in DaVinci from raw footage to export, including the presets I use and the mistakes that cost me hours when I first started out.",
  "I almost didn't post this one. It's the most honest video I've made about how hard it is to keep going when the views flatline for a month straight. Posting it anyway.",
  "Three months ago I couldn't edit a jump cut. Today I cut this whole thing in under an hour. Here's the boring truth about getting better: you just keep doing it badly until it isn't bad.",
];
const TRIAL = ["hook test: version A", "testing a colder open", "same video, new first line", "does the text overlay matter", "silent version test"];
const POSTS = ["photo dump from the week", "camera roll highlights", "behind the scenes carousel", "what I shot vs what I posted", "a month in photos", "setup evolution", "favorite frames this semester", "the edit timeline"];
const TT = ["POV: you film your whole day", "editing speedrun", "dorm setup check", "college creator reality", "the transition everyone asks about", "rating my old videos", "what 1K views actually looks like", "filming in public tips", "camera vs phone test", "my worst video ever"];
const YT_SHORT = ["60 second editing tip", "the 3 shot rule", "best free LUT", "filming alone tips", "my hook formula", "phone b-roll ideas", "how I plan a week of content"];
const YT_LONG = ["I analyzed 6 months of my own content", "Full DaVinci workflow for short form", "A week as a student creator", "My first 2,000 followers, every number"];

const ig = [];
const tt = [];
const yt = [];

// Instagram reels (live). Median around 3K views.
for (let i = 0; i < 46; i++) {
  let s;
  do s = slot(26); while (inFinalsGap(s));
  s.h = rand() < 0.6 ? 18 + Math.floor(rand() * 4) : 8 + Math.floor(rand() * 4);
  const long = rand() < 0.15;
  const caption = long ? REEL_LONG[i % REEL_LONG.length] : REEL_SHORT[i % REEL_SHORT.length];
  let mult = Math.exp(0.45 * normal());
  if (s.d === 1 || s.d === 3) mult *= 1.7;
  if (s.h >= 18) mult *= 1.3;
  else mult *= 0.75;
  if (long) mult *= 0.7;
  if (i === 7) mult *= 14;
  if (i === 23) mult *= 6;
  const views = round(3000 * mult);
  const winner = mult > 1.6;
  ig.push({
    kind: "REELS", type: "VIDEO", feed: true, caption, s, views,
    likes: round(views * (0.03 + rand() * 0.015)),
    comments: round(views * (0.002 + rand() * 0.002)),
    shares: round((views / 1000) * (winner ? 9 : 3) * Math.exp(0.3 * normal())),
    saves: round(views * (0.006 + rand() * 0.006)),
    label: caption,
  });
}

// Trial reels: batches of 4 posted a few minutes apart.
for (let b = 0; b < 5; b++) {
  const base = slot(20);
  if (inFinalsGap(base)) base.w += 3;
  base.h = 22;
  const caption = TRIAL[b];
  for (let k = 0; k < 4; k++) {
    const views = round(900 * Math.exp(0.6 * normal()));
    ig.push({
      kind: "REELS", type: "VIDEO", feed: false, caption,
      s: { ...base, mi: Math.min(59, base.mi + k * 3) }, views,
      likes: round(views * 0.025), comments: round(views * 0.001),
      shares: round(views / 1000 * 2), saves: round(views * 0.004), label: caption,
    });
  }
}

// Feed posts (carousels and photos): no views, scored on likes.
for (let i = 0; i < 8; i++) {
  let s;
  do s = slot(26); while (inFinalsGap(s));
  s.h = 12 + Math.floor(rand() * 8);
  ig.push({
    kind: "FEED", type: i % 3 === 0 ? "IMAGE" : "CAROUSEL_ALBUM", feed: null, caption: POSTS[i], s, views: null,
    likes: round(110 * Math.exp(0.4 * normal())), comments: round(6 + rand() * 10),
    shares: round(rand() * 8), saves: round(rand() * 15), label: POSTS[i],
  });
}

// Guarantee recent activity: two reels in the last few days.
ig.push({ kind: "REELS", type: "VIDEO", feed: true, caption: "week 26 numbers", s: { w: 0, d: 0, h: 19, mi: 12 }, views: 4100, likes: 160, comments: 14, shares: 22, saves: 40, label: "week 26 numbers" });
ig.push({ kind: "REELS", type: "VIDEO", feed: true, caption: "filming in the rain", s: { w: 1, d: 3, h: 20, mi: 5 }, views: 7600, likes: 310, comments: 25, shares: 68, saves: 90, label: "filming in the rain" });

// TikTok: shorter wins.
for (let i = 0; i < 32; i++) {
  let s;
  do s = slot(22); while (inFinalsGap(s));
  s.h = 16 + Math.floor(rand() * 7);
  const seconds = pick([9, 12, 14, 18, 22, 27, 34, 41, 55, 72, 88]);
  let mult = Math.exp(0.5 * normal()) * (seconds < 30 ? 1.5 : 0.7);
  if (i === 11) mult *= 9;
  const views = round(1600 * mult);
  tt.push({ caption: TT[i % TT.length], s, seconds, views, likes: round(views * 0.06), comments: round(views * 0.004), shares: round(views * 0.003 * (mult > 1.5 ? 2.5 : 1)) });
}

// YouTube: Shorts plus a few long videos.
for (let i = 0; i < 14; i++) {
  let s;
  do s = slot(20); while (inFinalsGap(s));
  s.h = 15 + Math.floor(rand() * 5);
  const views = round(900 * Math.exp(0.55 * normal()) * (i === 4 ? 7 : 1));
  yt.push({ title: YT_SHORT[i % YT_SHORT.length], s, seconds: 20 + Math.floor(rand() * 40), format: "short_form", views, likes: round(views * 0.045), comments: round(views * 0.003) });
}
YT_LONG.forEach((title, i) => {
  const s = { w: 2 + i * 5, d: 5, h: 10, mi: 0 };
  const views = round(450 * Math.exp(0.4 * normal()));
  yt.push({ title, s, seconds: 480 + i * 140, format: "long_form", views, likes: round(views * 0.05), comments: round(views * 0.01) });
});

// ---- SQL ---------------------------------------------------------------
const iso = (expr) => `to_char(${expr} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;

const sl = (s) => `${s.w},${s.d},${s.h},${s.mi}`;
const igRows = ig.map((p, i) =>
  `(${q(p.caption)},${q(p.kind)},${q(p.type)},${p.feed === null ? "null::boolean" : p.feed},${p.views ?? "null::float8"},${p.likes},${p.comments},${p.shares},${p.saves},${i},${sl(p.s)})`,
);
const ttRows = tt.map((p, i) => `(${q(p.caption)},${p.seconds},${p.views},${p.likes},${p.comments},${p.shares},${i + 3},${sl(p.s)})`);
const ytRows = yt.map((p, i) => `(${q(p.title)},${q(p.format)},${p.seconds},${p.views},${p.likes},${p.comments},${i + 1},${sl(p.s)})`);

const sql = `-- Generated by scripts/gen-demo-channels.mjs. Do not edit by hand.
-- Fictional channel data for guest demo workspaces.

-- Pacific-time slot (weeks ago, weekday 0=Mon, hour, minute) to a timestamp.
create or replace function public.demo_ts(w int, d int, h int, mi int) returns timestamptz
language sql stable set search_path = '' as $f$
  select (date_trunc('week', now() at time zone 'America/Los_Angeles')
          - make_interval(weeks => w) + make_interval(days => d, hours => h, mins => mi))
         at time zone 'America/Los_Angeles'
$f$;

-- A small gradient thumbnail with the post's first words, as an SVG data URI.
create or replace function public.demo_thumb(label text, i int, tall boolean) returns text
language sql immutable set search_path = '' as $f$
  select 'data:image/svg+xml;utf8,' || replace(format(
    '<svg xmlns=''http://www.w3.org/2000/svg'' width=''%1$s'' height=''%2$s''><defs><linearGradient id=''g'' x1=''0'' y1=''0'' x2=''1'' y2=''1''><stop offset=''0'' stop-color=''%3$s''/><stop offset=''1'' stop-color=''%4$s'' stop-opacity=''.55''/></linearGradient></defs><rect width=''100%%'' height=''100%%'' fill=''url(%%23g)''/><text x=''16'' y=''%5$s'' font-family=''Inter,Arial,sans-serif'' font-size=''20'' font-weight=''700'' fill=''white''>%6$s</text></svg>',
    case when tall then 270 else 320 end,
    case when tall then 480 else 180 end,
    (array['#1a1a1d','#14213d','#0b3d2e','#2b2d42','#3d0c11','#102a43'])[i % 6 + 1],
    (array['#ff5a36','#fca311','#7bd389','#8d99ae','#ff8fab','#62b6cb'])[i % 6 + 1],
    case when tall then 450 else 156 end,
    array_to_string((regexp_split_to_array(regexp_replace(label, '[<>&"'']', '', 'g'), '\\s+'))[1:4], ' ')
  ), '#', '%23')
$f$;
revoke execute on function public.demo_thumb(text, int, boolean) from public, anon, authenticated;
revoke execute on function public.demo_ts(int, int, int, int) from public, anon, authenticated;

create or replace function public.seed_demo_channels(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.instagram_media where created_by_id = uid) then
    return;
  end if;

  insert into public.instagram_media
    (created_by_id, ig_id, caption, media_product_type, media_type, is_shared_to_feed, view_count, like_count, comments_count, shares_count, saved_count, thumbnail_url, media_url, permalink, timestamp, status)
  select uid, gen_random_uuid()::text, v.caption, v.kind, v.type, v.feed, v.views, v.likes, v.comments, v.shares, v.saves,
         public.demo_thumb(v.caption, v.i, v.kind = 'REELS'), public.demo_thumb(v.caption, v.i, v.kind = 'REELS'), null,
         ${iso("public.demo_ts(v.w, v.d, v.h, v.mi)")}, 'synced'
  from (values
    ${igRows.join(",\n    ")}
  ) v(caption, kind, type, feed, views, likes, comments, shares, saves, i, w, d, h, mi)
  where public.demo_ts(v.w, v.d, v.h, v.mi) <= now();

  insert into public.tiktok_media
    (created_by_id, tt_id, video_description, duration, view_count, like_count, comment_count, share_count, cover_image_url, share_url, create_time, status)
  select uid, gen_random_uuid()::text, v.caption, v.seconds, v.views, v.likes, v.comments, v.shares,
         public.demo_thumb(v.caption, v.i, true), null, ${iso("public.demo_ts(v.w, v.d, v.h, v.mi)")}, 'synced'
  from (values
    ${ttRows.join(",\n    ")}
  ) v(caption, seconds, views, likes, comments, shares, i, w, d, h, mi)
  where public.demo_ts(v.w, v.d, v.h, v.mi) <= now();

  insert into public.youtube_videos
    (created_by_id, video_id, title, description, format, duration_seconds, view_count, like_count, comment_count, thumbnail_url, url, published_at, status)
  select uid, gen_random_uuid()::text, v.title, '', v.format, v.seconds, v.views, v.likes, v.comments,
         public.demo_thumb(v.title, v.i, v.format = 'short_form'), null, ${iso("public.demo_ts(v.w, v.d, v.h, v.mi)")}, 'synced'
  from (values
    ${ytRows.join(",\n    ")}
  ) v(title, format, seconds, views, likes, comments, i, w, d, h, mi)
  where public.demo_ts(v.w, v.d, v.h, v.mi) <= now();

  insert into public.social_accounts (created_by_id, platform, handle, follower_count, following_count, media_count, profile_url, last_synced)
  values
    (uid, 'instagram', '@democreator', 2340, 310, 56, null, ${iso("now()")}),
    (uid, 'tiktok', '@democreator', 860, 95, 32, null, ${iso("now()")}),
    (uid, 'youtube', '@democreator', 210, 0, 18, null, ${iso("now()")});
end $$;

revoke execute on function public.seed_demo_channels(uuid) from public, anon, authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  if new.is_anonymous then
    perform public.seed_demo_workspace(new.id);
    perform public.seed_demo_channels(new.id);
  end if;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
`;

writeFileSync(new URL("../supabase/migrations/0013_demo_channels.sql", import.meta.url), sql);
console.log(`ig ${ig.length}, tiktok ${tt.length}, youtube ${yt.length}, ${Math.round(sql.length / 1024)} KB`);
