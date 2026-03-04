-- ============================================================
-- Migration: Create core schema for Loaves of Love
-- ============================================================

-- ─── Enums ───────────────────────────────────────────────────

create type public.user_role as enum ('admin', 'baker');

create type public.inventory_category as enum (
  'loaves',
  'cookies',
  'coffee_cakes',
  'emergency_bags',
  'bake_sale'
);

create type public.assignment_status as enum ('open', 'in_progress', 'completed');

create type public.delivery_destination as enum (
  'ruths_cottage',
  'brother_charlies',
  'bake_sale',
  'individual',
  'other'
);

create type public.comment_parent_type as enum (
  'inventory_item',
  'recipe',
  'assignment',
  'announcement'
);

-- ─── profiles ────────────────────────────────────────────────
-- Extends auth.users. Created automatically via trigger on signup.

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  email        text not null default '',
  role         public.user_role not null default 'baker',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── inventory_items ─────────────────────────────────────────

create table public.inventory_items (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       public.inventory_category not null,
  quantity       integer not null default 0 check (quantity >= 0),
  baked_date     date,
  freshness_days integer check (freshness_days > 0),
  created_by     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── inventory_thresholds ────────────────────────────────────

create table public.inventory_thresholds (
  id               uuid primary key default gen_random_uuid(),
  category         public.inventory_category not null unique,
  green_threshold  integer not null check (green_threshold >= 0),
  yellow_threshold integer not null check (yellow_threshold >= 0),
  red_threshold    integer not null check (red_threshold >= 0),
  reserve_label    text,
  updated_by       uuid references public.profiles (id) on delete set null,
  updated_at       timestamptz not null default now()
);

-- ─── recipes ─────────────────────────────────────────────────

create table public.recipes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  ingredients  jsonb,
  instructions text,
  photo_url    text,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── assignments ─────────────────────────────────────────────

create table public.assignments (
  id                   uuid primary key default gen_random_uuid(),
  description          text not null,
  assigned_to          uuid references public.profiles (id) on delete set null,
  due_date             date,
  status               public.assignment_status not null default 'open',
  delivery_destination public.delivery_destination,
  delivery_notes       text,
  created_by           uuid references public.profiles (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─── comments ────────────────────────────────────────────────

create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  parent_type public.comment_parent_type not null,
  parent_id   uuid not null,
  body        text not null,
  author_id   uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── announcements ───────────────────────────────────────────

create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  author_id  uuid references public.profiles (id) on delete set null,
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── notification_preferences ────────────────────────────────

create table public.notification_preferences (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references public.profiles (id) on delete cascade,
  threshold_alerts      boolean not null default true,
  comment_replies       boolean not null default true,
  weekly_digest         boolean not null default true,
  assignment_reminders  boolean not null default true
);

-- ─── Trigger: auto-create profile on auth.users insert ───────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role public.user_role;
begin
  -- Assign admin role to known ministry coordinators
  if new.email in (
    'kim@stannestifton.org',
    'jonathan@stannestifton.org',
    'art@stannestifton.org'
  ) then
    v_role := 'admin';
  else
    v_role := 'baker';
  end if;

  insert into public.profiles (id, display_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    v_role
  );

  insert into public.notification_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Trigger: auto-update updated_at ─────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_inventory_items_updated_at
  before update on public.inventory_items
  for each row execute procedure public.set_updated_at();

create trigger set_inventory_thresholds_updated_at
  before update on public.inventory_thresholds
  for each row execute procedure public.set_updated_at();

create trigger set_recipes_updated_at
  before update on public.recipes
  for each row execute procedure public.set_updated_at();

create trigger set_assignments_updated_at
  before update on public.assignments
  for each row execute procedure public.set_updated_at();

create trigger set_announcements_updated_at
  before update on public.announcements
  for each row execute procedure public.set_updated_at();
