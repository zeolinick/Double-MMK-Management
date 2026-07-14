-- ============================================================================
-- Double MMK Management — owner-managed website backend (v1)
-- Supabase project: double-mmk  (ref ubtqikgdilmfgtvjrajz, us-east-2)
-- ISOLATED from MAVYN — apply ONLY to this project.
--
-- Security model: self-signup is disabled and only the owner (Mohammad) and
-- developer (Nick) have accounts, so "authenticated" == a trusted operator.
-- The public site reads with the anon key; only logged-in operators can write.
-- ============================================================================

create extension if not exists pgcrypto;

-- Shared: keep updated_at fresh on any row change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- 1. LISTINGS  — mirrors the existing listings.js field contract
-- ============================================================================
create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  status        text    not null default 'Available'
                        check (status in ('Available','Coming Soon','Leased')),
  neighborhood  text    not null,
  address       text,
  rent          integer check (rent is null or rent >= 0),          -- $/month
  beds          numeric(4,1) check (beds is null or beds >= 0),
  baths         numeric(4,1) check (baths is null or baths >= 0),
  sqft          integer check (sqft is null or sqft >= 0),
  type          text    check (type is null or type in ('house','apartment','duplex')),
  photo_url     text,                                               -- primary photo
  photos        text[]  not null default '{}',                     -- optional gallery
  zillow_url    text,                                               -- "View on Zillow" link
  sort_order    integer not null default 0,                        -- lower = higher on page
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists listings_sort_idx
  on public.listings (sort_order asc, created_at desc);

drop trigger if exists listings_touch on public.listings;
create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

alter table public.listings enable row level security;

drop policy if exists "listings public read" on public.listings;
create policy "listings public read"
  on public.listings for select
  to anon, authenticated
  using (true);

drop policy if exists "listings owner write" on public.listings;
create policy "listings owner write"
  on public.listings for all
  to authenticated
  using (true) with check (true);

-- ============================================================================
-- 2. SITE CONTENT — editable page copy / photos (v1 includes content editing)
--    key is a dotted path, e.g. 'home.hero.title' or 'contact.phone'
-- ============================================================================
create table if not exists public.site_content (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "content public read" on public.site_content;
create policy "content public read"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "content owner write" on public.site_content;
create policy "content owner write"
  on public.site_content for all
  to authenticated
  using (true) with check (true);

-- ============================================================================
-- 3. STORAGE — public-read bucket for owner-uploaded, client-downscaled photos
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('listing-photos', 'listing-photos', true)
  on conflict (id) do nothing;

drop policy if exists "listing-photos public read" on storage.objects;
create policy "listing-photos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'listing-photos');

drop policy if exists "listing-photos owner write" on storage.objects;
create policy "listing-photos owner write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'listing-photos')
  with check (bucket_id = 'listing-photos');

-- ============================================================================
-- NEXT (applied via Supabase MCP once connected, not in this file):
--   • Create auth users: Doublemmkmanagement@gmail.com (owner) + Nick (dev)
--   • Disable self-signup; set Auth Site URL + redirect allowlist to the domain
--   • Seed the 6 current sample properties as rows
-- Leads/maintenance inbox is a later phase; Netlify Forms captures leads today.
-- ============================================================================
