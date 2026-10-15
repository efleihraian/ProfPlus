-- P-087: anunțuri de meditații publicate de profesori. Acces numai prin server (service_role), cu filtrare pe user_id în API.
create table if not exists public.profplus_tutoring_ads(
 id uuid primary key,
 user_id text not null check(length(user_id) between 1 and 80),
 display_name text not null check(length(display_name) between 2 and 60),
 title text not null check(length(title) between 5 and 90),
 subject text not null check(length(subject) between 2 and 80),
 levels text[] not null check(cardinality(levels) between 1 and 5 and levels <@ array['primar','gimnaziu','liceu','evaluare','bacalaureat']::text[]),
 formats text[] not null check(cardinality(formats) between 1 and 3 and formats <@ array['online','domiciliu','sediu']::text[]),
 city text not null default '' check(length(city)<=60),
 price integer check(price is null or price between 0 and 1000),
 description text not null check(length(description) between 30 and 1200),
 contact_email text not null default '' check(length(contact_email)<=254),
 contact_phone text not null default '' check(length(contact_phone)<=20),
 status text not null check(status in ('published','paused','hidden')),
 consent_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 expires_at timestamptz not null,
 check(contact_email<>'' or contact_phone<>'')
);
create index if not exists profplus_tutoring_ads_public on public.profplus_tutoring_ads(status,expires_at,updated_at desc);
create index if not exists profplus_tutoring_ads_user on public.profplus_tutoring_ads(user_id);
create table if not exists public.profplus_tutoring_reports(
 ad_id uuid not null references public.profplus_tutoring_ads(id) on delete cascade,
 reporter text not null check(length(reporter) between 1 and 80),
 reason text not null default '' check(length(reason)<=300),
 created_at timestamptz not null default now(),
 primary key(ad_id,reporter)
);
create index if not exists profplus_tutoring_reports_reporter on public.profplus_tutoring_reports(reporter);
alter table public.profplus_tutoring_ads enable row level security;
alter table public.profplus_tutoring_reports enable row level security;
revoke all on public.profplus_tutoring_ads,public.profplus_tutoring_reports from public,anon,authenticated;
grant all on public.profplus_tutoring_ads,public.profplus_tutoring_reports to service_role;
