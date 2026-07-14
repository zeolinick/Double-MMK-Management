-- ============================================================================
-- Double MMK — seed the 6 current sample properties as real listings rows.
-- Run this AFTER 0001_init.sql. Safe to skip if you'd rather start empty.
-- Idempotent-ish: only inserts if the listings table is currently empty.
-- ============================================================================
insert into public.listings
  (status, neighborhood, address, rent, beds, baths, sqft, type, sort_order)
select * from (values
  ('Available',   'East English Village', null, 1250, 3.0, 1.5, 1400, 'house',      10),
  ('Available',   'Bagley',               null,  950, 2.0, 1.0, 1050, 'apartment',  20),
  ('Available',   'Corktown',             null, 1600, 3.0, 2.0, 1650, 'house',      30),
  ('Available',   'Hubbard Farms',        null, 1100, 2.0, 1.0, 1200, 'duplex',     40),
  ('Available',   'Midtown',              null,  800, 1.0, 1.0,  700, 'apartment',  50),
  ('Coming Soon', 'Rosedale Park',        null, 2100, 4.0, 2.5, 2000, 'house',      60)
) as v(status, neighborhood, address, rent, beds, baths, sqft, type, sort_order)
where not exists (select 1 from public.listings);
