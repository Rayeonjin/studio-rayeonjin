-- Guestbook entries from the studio site.
-- New entries start as 'pending' and only show on the site once status is
-- set to 'approved' (Table Editor in the Supabase dashboard).
-- Rows are written and read only by the guestbook Edge Function (service role).
-- RLS is on with no policies, so the public anon key can neither read nor write.

create table public.guestbook (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  nickname    text not null check (char_length(nickname) between 1 and 30),
  message     text not null check (char_length(message) between 2 and 300),
  lang        text check (lang in ('ko', 'en', 'zh', 'es')),
  status      text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  notified    boolean not null default false
);

comment on table public.guestbook is 'Guestbook entries on studio-rayeonjin.vercel.app; shown only when status = approved';

alter table public.guestbook enable row level security;
revoke all on table public.guestbook from anon, authenticated;

create index guestbook_status_created_idx on public.guestbook (status, created_at desc);
