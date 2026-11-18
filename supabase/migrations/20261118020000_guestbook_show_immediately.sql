-- Guestbook entries now show on the site right away.
-- Moderation moves to after the fact: set status to 'hidden' to take one down.

alter table public.guestbook alter column status set default 'approved';

comment on table public.guestbook is 'Guestbook entries on studio-rayeonjin.vercel.app; shown while status = approved, set hidden to take one down';
