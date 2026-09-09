-- ===========================================================================
-- DICKALO — Supabase schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- It is idempotent: re-running it will not drop data.
--
-- Design notes:
--  * Row Level Security is on for every table. The anonymous key can INSERT
--    but never SELECT, so a leaked anon key cannot read your enquiry list.
--  * Reads happen server-side with the service role key only.
--  * Every table carries created_at and a status column so the studio can work
--    the list without a separate CRM.
-- ===========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type enquiry_status as enum ('new', 'contacted', 'qualified', 'won', 'lost', 'spam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_type as enum (
    'residential', 'commercial', 'interior', 'renovation', 'consultancy', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type budget_band as enum (
    'under-25m', '25m-100m', '100m-500m', 'over-500m', 'not-sure'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscriber_status as enum ('active', 'unsubscribed', 'bounced');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- contact_submissions — every message sent from /contact
-- ---------------------------------------------------------------------------

create table if not exists public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  name          text not null check (char_length(trim(name)) between 2 and 100),
  email         citext not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone         text check (phone is null or char_length(phone) between 7 and 20),
  company       text,

  project_type  project_type not null default 'other',
  budget        budget_band,
  location      text,
  message       text not null check (char_length(trim(message)) between 20 and 5000),

  status        enquiry_status not null default 'new',
  -- Free-text notes added by the studio while working the enquiry.
  notes         text,

  -- Provenance, for spam triage and attribution. Never shown to the public.
  source        text default 'website',
  referrer      text,
  user_agent    text,
  ip_hash       text,           -- salted hash, not the raw address
  consent       boolean not null default false,
  email_sent    boolean not null default false
);

comment on table public.contact_submissions is
  'Enquiries from the /contact form. Insert-only for anon; reads require service role.';
comment on column public.contact_submissions.ip_hash is
  'SHA-256 of (ip + server salt). Used for rate limiting and abuse review, never for tracking.';

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status) where status = 'new';
create index if not exists contact_submissions_email_idx
  on public.contact_submissions (email);

-- ---------------------------------------------------------------------------
-- project_inquiries — enquiries raised from a specific project page
-- ---------------------------------------------------------------------------

create table if not exists public.project_inquiries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  -- Sanity document id and slug. Not a foreign key: the CMS is the source of
  -- truth for projects, and we do not want a Sanity deletion to cascade here.
  project_slug   text not null,
  project_title  text,

  submission_id  uuid references public.contact_submissions (id) on delete cascade,

  name           text not null,
  email          citext not null,
  message        text not null,
  status         enquiry_status not null default 'new'
);

comment on table public.project_inquiries is
  'Enquiries that started from a project page. Links back to contact_submissions.';

create index if not exists project_inquiries_slug_idx
  on public.project_inquiries (project_slug);
create index if not exists project_inquiries_created_at_idx
  on public.project_inquiries (created_at desc);
create index if not exists project_inquiries_submission_idx
  on public.project_inquiries (submission_id);

-- ---------------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  email            citext not null unique,
  name             text,
  status           subscriber_status not null default 'active',
  source           text default 'footer',
  -- Token embedded in the unsubscribe link so no login is needed to opt out.
  unsubscribe_token uuid not null default gen_random_uuid(),
  confirmed_at     timestamptz,
  unsubscribed_at  timestamptz
);

comment on table public.newsletter_subscribers is
  'Opt-in list. citext + unique means re-subscribing is an upsert, not a duplicate.';

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status) where status = 'active';
create unique index if not exists newsletter_subscribers_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
  before update on public.contact_submissions
  for each row execute function public.set_updated_at();

drop trigger if exists newsletter_subscribers_set_updated_at on public.newsletter_subscribers;
create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- Row Level Security
--
-- The public site only ever needs to INSERT. Anything that reads runs
-- server-side with the service role key, which bypasses RLS entirely.
-- ===========================================================================

alter table public.contact_submissions   enable row level security;
alter table public.project_inquiries     enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- contact_submissions: anonymous insert, no read.
drop policy if exists "anon can submit an enquiry" on public.contact_submissions;
create policy "anon can submit an enquiry"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated staff can read enquiries" on public.contact_submissions;
create policy "authenticated staff can read enquiries"
  on public.contact_submissions
  for select
  to authenticated
  using (auth.jwt() ->> 'role' = 'staff');

-- project_inquiries: same shape.
drop policy if exists "anon can submit a project enquiry" on public.project_inquiries;
create policy "anon can submit a project enquiry"
  on public.project_inquiries
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "authenticated staff can read project enquiries" on public.project_inquiries;
create policy "authenticated staff can read project enquiries"
  on public.project_inquiries
  for select
  to authenticated
  using (auth.jwt() ->> 'role' = 'staff');

-- newsletter_subscribers: insert only. Deliberately no anon select, or the
-- whole mailing list would be one API call away.
drop policy if exists "anon can subscribe" on public.newsletter_subscribers;
create policy "anon can subscribe"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (status = 'active');

drop policy if exists "authenticated staff can read subscribers" on public.newsletter_subscribers;
create policy "authenticated staff can read subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (auth.jwt() ->> 'role' = 'staff');

-- ---------------------------------------------------------------------------
-- Reporting view (service role only — RLS does not apply to views by default,
-- so this is created with security_invoker to inherit the caller's policies).
-- ---------------------------------------------------------------------------

create or replace view public.enquiry_summary
with (security_invoker = true)
as
select
  date_trunc('month', created_at) as month,
  project_type,
  status,
  count(*) as total
from public.contact_submissions
group by 1, 2, 3
order by 1 desc;

comment on view public.enquiry_summary is
  'Monthly enquiry counts by type and status. Inherits the caller RLS policies.';
