-- ============================================================
-- Migration: Seed reference data
-- ============================================================

-- ─── Inventory thresholds ────────────────────────────────────
-- Loaves: 30 green / 24 yellow (time to bake) / 8 red (Brother Charlie's reserve)

insert into public.inventory_thresholds
  (category, green_threshold, yellow_threshold, red_threshold, reserve_label)
values
  ('loaves',         30, 24, 8,  'Brother Charlie''s'),
  ('cookies',        48, 36, 12, null),
  ('coffee_cakes',   10,  6,  2, null),
  ('emergency_bags', 20, 12,  4, null),
  ('bake_sale',       0,  0,  0, null)
on conflict (category) do nothing;
