-- ============================================================
-- Migration: Row Level Security policies
-- ============================================================

-- ─── Helper: is_admin() ──────────────────────────────────────
-- Returns true when the calling user has the 'admin' role.
-- Using security definer so the function can read profiles even
-- when a table's own RLS would otherwise block it.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- profiles
-- ============================================================

alter table public.profiles enable row level security;

-- All authenticated users can read all profiles
create policy "profiles: authenticated read"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can update their own profile
create policy "profiles: self update"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admins can update any profile
create policy "profiles: admin update"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- inventory_items
-- ============================================================

alter table public.inventory_items enable row level security;

create policy "inventory_items: authenticated read"
  on public.inventory_items for select
  to authenticated
  using (true);

create policy "inventory_items: authenticated insert"
  on public.inventory_items for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "inventory_items: authenticated update"
  on public.inventory_items for update
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- inventory_thresholds
-- ============================================================

alter table public.inventory_thresholds enable row level security;

create policy "inventory_thresholds: authenticated read"
  on public.inventory_thresholds for select
  to authenticated
  using (true);

-- Only admins can modify thresholds
create policy "inventory_thresholds: admin update"
  on public.inventory_thresholds for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "inventory_thresholds: admin insert"
  on public.inventory_thresholds for insert
  to authenticated
  with check (public.is_admin());

create policy "inventory_thresholds: admin delete"
  on public.inventory_thresholds for delete
  to authenticated
  using (public.is_admin());

-- ============================================================
-- recipes
-- ============================================================

alter table public.recipes enable row level security;

create policy "recipes: authenticated read"
  on public.recipes for select
  to authenticated
  using (true);

create policy "recipes: authenticated insert"
  on public.recipes for insert
  to authenticated
  with check (created_by = auth.uid());

-- Author or admin can update
create policy "recipes: author or admin update"
  on public.recipes for update
  to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

-- Author or admin can delete
create policy "recipes: author or admin delete"
  on public.recipes for delete
  to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- ============================================================
-- assignments
-- ============================================================

alter table public.assignments enable row level security;

create policy "assignments: authenticated read"
  on public.assignments for select
  to authenticated
  using (true);

create policy "assignments: authenticated insert"
  on public.assignments for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "assignments: author or admin update"
  on public.assignments for update
  to authenticated
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

create policy "assignments: author or admin delete"
  on public.assignments for delete
  to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- ============================================================
-- comments
-- ============================================================

alter table public.comments enable row level security;

create policy "comments: authenticated read"
  on public.comments for select
  to authenticated
  using (true);

create policy "comments: authenticated insert"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "comments: author or admin update"
  on public.comments for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy "comments: author or admin delete"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- ============================================================
-- announcements
-- ============================================================

alter table public.announcements enable row level security;

create policy "announcements: authenticated read"
  on public.announcements for select
  to authenticated
  using (true);

create policy "announcements: authenticated insert"
  on public.announcements for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "announcements: author or admin update"
  on public.announcements for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy "announcements: author or admin delete"
  on public.announcements for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- ============================================================
-- notification_preferences
-- ============================================================

alter table public.notification_preferences enable row level security;

create policy "notification_preferences: owner read"
  on public.notification_preferences for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "notification_preferences: owner update"
  on public.notification_preferences for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
