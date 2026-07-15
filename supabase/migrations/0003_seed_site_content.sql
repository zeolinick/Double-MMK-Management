-- ============================================================================
-- Double MMK — seed the first editable homepage content blocks.
-- Run after 0001_init.sql. Pre-populates the site_content table so the /admin
-- "Site content" tab shows these blocks with their current text, ready to edit.
-- Does not overwrite any block the owner has already changed.
-- ============================================================================
insert into public.site_content (key, value) values
  ('home.hero.badge',    'Trusted by Detroit landlords'),
  ('home.hero.subtitle', 'Owning a rental shouldn’t feel like a second job. We keep your Detroit property occupied, maintained, and profitable — and when you call, a real person picks up. No call centers, no runaround.'),
  ('home.card.title',    'Free Rental Analysis'),
  ('home.card.subtitle', 'See what your property could earn in today’s Detroit market.')
on conflict (key) do nothing;
