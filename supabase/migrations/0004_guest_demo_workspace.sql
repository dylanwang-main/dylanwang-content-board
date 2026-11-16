-- Guest demo workspaces.
-- Visitors are signed in anonymously by the app. Each new anonymous user gets
-- a private, pre-filled sandbox so the app looks alive on first load. Row-level
-- security still applies: a guest only ever sees their own copy.
-- All demo content is fictional ("Demo Creator") and dated relative to signup.

create or replace function public.seed_demo_workspace(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  d date := current_date;
  fmt text := 'YYYY-MM-DD';
begin
  -- Never seed twice.
  if exists (select 1 from public.content_items where created_by_id = uid) then
    return;
  end if;

  update public.profiles
     set display_name = 'Demo Creator', monthly_goal = 8,
         platforms = '["Instagram","TikTok","YouTube"]'::jsonb
   where id = uid;

  insert into public.brands (created_by_id, name, tagline, niche, audience, voice, bio, pillars, platforms, colors)
  values (uid, 'Demo Creator', 'Building in public, one upload at a time',
    'Documenting the content creation journey as a college student',
    'College students and early-career creators who want to start posting but feel behind',
    'Casual, direct, a little self-deprecating. No hype, no guru talk.',
    'Second-year student filming every step of growing a channel from zero: what works, what flops, and the numbers behind it.',
    '["Build in public","Creator craft","College life","Discipline"]'::jsonb,
    '["Instagram","TikTok","YouTube"]'::jsonb,
    '["#0A0A0A","#D4AF37","#F5F1E6"]'::jsonb);

  insert into public.content_items
    (created_by_id, title, body, platform, format, pillar, status, scheduled_date, published_date, views, likes, comments, shares, saves)
  values
    (uid, 'I posted every day for 30 days. Here''s the data.', 'HOOK: 30 days, 30 posts, one spreadsheet.', 'Instagram', 'Reel', 'Build in public', 'published', null, to_char(d - 160, fmt), 48200, 3100, 214, 390, 1250),
    (uid, 'My $0 filming setup in a dorm room', 'HOOK: Everything here cost nothing.', 'TikTok', 'Short', 'Creator craft', 'published', null, to_char(d - 128, fmt), 21400, 1650, 98, 120, 640),
    (uid, 'What a week of classes + content actually looks like', null, 'YouTube', 'Video', 'College life', 'published', null, to_char(d - 95, fmt), 6900, 410, 57, 22, 80),
    (uid, 'The hook formula that doubled my retention', 'HOOK: I tested 12 hooks. One won.', 'Instagram', 'Reel', 'Creator craft', 'published', null, to_char(d - 62, fmt), 112000, 8900, 640, 1420, 5300),
    (uid, '5am gym, 8am lecture, 6pm edit', null, 'TikTok', 'Short', 'Discipline', 'published', null, to_char(d - 34, fmt), 15800, 1200, 76, 64, 310),
    (uid, 'Month 3 numbers: followers, views, money', 'HOOK: I made $41 this month. Here''s how.', 'YouTube', 'Short', 'Build in public', 'published', null, to_char(d - 9, fmt), 9300, 720, 133, 41, 205),
    (uid, 'Editing a reel start to finish in 20 minutes', null, 'Instagram', 'Reel', 'Creator craft', 'scheduled', to_char(d + 3, fmt), null, 0, 0, 0, 0, 0),
    (uid, 'Why I stopped chasing trends', 'Draft script: trends got views, not followers...', 'TikTok', 'Short', 'Build in public', 'draft', null, null, 0, 0, 0, 0, 0),
    (uid, 'Ranking every free editing app', null, 'YouTube', 'Video', 'Creator craft', 'draft', null, null, 0, 0, 0, 0, 0),
    (uid, 'Dorm room lighting under $20', null, 'Instagram', 'Carousel', 'Creator craft', 'idea', null, null, 0, 0, 0, 0, 0),
    (uid, 'Finals week content plan', null, 'TikTok', 'Short', 'College life', 'idea', null, null, 0, 0, 0, 0, 0);

  insert into public.brain_files (created_by_id, section, file_name, file_uri, file_type, file_size, status, summary, key_points)
  values
    (uid, 'brand', 'brand-voice.md', 'demo/brand-voice.md', 'text/markdown', 2048, 'learned',
     'A student creator documenting their content journey in public. Voice is casual and honest, and every claim is backed by their own numbers.',
     '["Talk like a friend, not a coach","Show the numbers, including bad ones","No clickbait or fake urgency","CTA is always a simple follow"]'::jsonb),
    (uid, 'constraints', 'hard-rules.md', 'demo/hard-rules.md', 'text/markdown', 1024, 'learned',
     'Non-negotiable rules for every script.',
     '["Never promise income or results","Never invent stats, names or stories","No brand deals that don''t fit the audience"]'::jsonb);

  insert into public.research (created_by_id, source_type, platform, source, status, customer_research, core_avatar, sub_avatars, angles)
  values (uid, 'own', 'Instagram', 'instagram.com/democreator', 'complete',
    '{"summary":"The audience is mostly students who want to post but are stuck on gear, confidence and time.","commonalities":[{"theme":"Feel behind other creators","percentage":64,"detail":"Comments compare themselves to bigger accounts."},{"theme":"Worried about time","percentage":48,"detail":"Frequent questions about balancing classes and posting."}],"pains":["No time between classes","Embarrassed to post in front of friends"],"desires":["Grow a following that turns into income","Get good at editing fast"],"objections":["I don''t have good gear"],"language":["I keep putting it off","how do you stay consistent"]}'::jsonb,
    '{"name":"The Quiet Starter","description":"A student who has drafted 20 videos and posted none.","primary_desire":"Post without feeling judged","defining_experience":"Deleted their first video after 10 minutes","main_problems":["Fear of judgment","Perfectionism"]}'::jsonb,
    '[{"name":"The Busy Grinder","description":"Full course load plus a job.","primary_desire":"A system that fits 3 hours a week","defining_experience":"Missed a week and lost momentum","main_problems":["Time","Inconsistency"]}]'::jsonb,
    '[{"rank":1,"title":"Post before you''re ready","hook_idea":"My first video had 41 views. Post yours anyway.","avatar":"The Quiet Starter","strength":88,"evidence":"Top comment theme is fear of posting"},{"rank":2,"title":"3 hours a week system","hook_idea":"I make 5 videos a week in 3 hours. Here''s the schedule.","avatar":"The Busy Grinder","strength":74,"evidence":"Time is the #2 question"}]'::jsonb);
end $$;

revoke execute on function public.seed_demo_workspace(uuid) from public, anon, authenticated;

-- Extend the signup trigger: guests get the demo workspace.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  if new.is_anonymous then
    perform public.seed_demo_workspace(new.id);
  end if;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Housekeeping: remove guest accounts (and, via cascades, their data) after 7 days.
create or replace function public.delete_stale_guests() returns integer
language sql security definer set search_path = '' as $$
  with gone as (
    delete from auth.users
     where is_anonymous and created_at < now() - interval '7 days'
    returning 1
  )
  select count(*)::integer from gone;
$$;
revoke execute on function public.delete_stale_guests() from public, anon, authenticated;
