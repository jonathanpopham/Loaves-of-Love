import { readFileSync } from 'fs'
import { join } from 'path'

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations')

function readMigration(filename: string): string {
  return readFileSync(join(MIGRATIONS_DIR, filename), 'utf-8')
}

// ─── Schema migration ────────────────────────────────────────

describe('Migration: 20260304000000_create_schema.sql', () => {
  let sql: string

  beforeAll(() => {
    sql = readMigration('20260304000000_create_schema.sql')
  })

  it('defines user_role enum with admin and baker', () => {
    expect(sql).toMatch(/create type public\.user_role as enum/)
    expect(sql).toMatch(/'admin'/)
    expect(sql).toMatch(/'baker'/)
  })

  it('defines inventory_category enum with all required values', () => {
    expect(sql).toMatch(/create type public\.inventory_category as enum/)
    expect(sql).toMatch(/'loaves'/)
    expect(sql).toMatch(/'cookies'/)
    expect(sql).toMatch(/'coffee_cakes'/)
    expect(sql).toMatch(/'emergency_bags'/)
    expect(sql).toMatch(/'bake_sale'/)
  })

  it('defines assignment_status enum', () => {
    expect(sql).toMatch(/create type public\.assignment_status as enum/)
    expect(sql).toMatch(/'open'/)
    expect(sql).toMatch(/'in_progress'/)
    expect(sql).toMatch(/'completed'/)
  })

  it('defines delivery_destination enum', () => {
    expect(sql).toMatch(/create type public\.delivery_destination as enum/)
    expect(sql).toMatch(/'ruths_cottage'/)
    expect(sql).toMatch(/'brother_charlies'/)
  })

  it('defines comment_parent_type enum', () => {
    expect(sql).toMatch(/create type public\.comment_parent_type as enum/)
    expect(sql).toMatch(/'inventory_item'/)
    expect(sql).toMatch(/'recipe'/)
    expect(sql).toMatch(/'assignment'/)
    expect(sql).toMatch(/'announcement'/)
  })

  it('creates profiles table with required columns', () => {
    expect(sql).toMatch(/create table public\.profiles/)
    expect(sql).toMatch(/id\s+uuid\s+primary key/)
    expect(sql).toMatch(/display_name/)
    expect(sql).toMatch(/email/)
    expect(sql).toMatch(/role/)
    expect(sql).toMatch(/created_at/)
    expect(sql).toMatch(/updated_at/)
  })

  it('profiles references auth.users', () => {
    expect(sql).toMatch(/references auth\.users/)
  })

  it('creates inventory_items table with required columns', () => {
    expect(sql).toMatch(/create table public\.inventory_items/)
    expect(sql).toMatch(/category\s+public\.inventory_category/)
    expect(sql).toMatch(/quantity/)
    expect(sql).toMatch(/baked_date/)
    expect(sql).toMatch(/freshness_days/)
    expect(sql).toMatch(/created_by/)
  })

  it('creates inventory_thresholds with threshold columns', () => {
    expect(sql).toMatch(/create table public\.inventory_thresholds/)
    expect(sql).toMatch(/green_threshold/)
    expect(sql).toMatch(/yellow_threshold/)
    expect(sql).toMatch(/red_threshold/)
    expect(sql).toMatch(/reserve_label/)
  })

  it('creates recipes table', () => {
    expect(sql).toMatch(/create table public\.recipes/)
    expect(sql).toMatch(/ingredients\s+jsonb/)
    expect(sql).toMatch(/instructions/)
    expect(sql).toMatch(/photo_url/)
  })

  it('creates assignments table with delivery columns', () => {
    expect(sql).toMatch(/create table public\.assignments/)
    expect(sql).toMatch(/assigned_to/)
    expect(sql).toMatch(/delivery_destination/)
    expect(sql).toMatch(/delivery_notes/)
  })

  it('creates comments table with parent polymorphism', () => {
    expect(sql).toMatch(/create table public\.comments/)
    expect(sql).toMatch(/parent_type\s+public\.comment_parent_type/)
    expect(sql).toMatch(/parent_id\s+uuid/)
  })

  it('creates announcements table with pinned column', () => {
    expect(sql).toMatch(/create table public\.announcements/)
    expect(sql).toMatch(/pinned\s+boolean/)
  })

  it('creates notification_preferences table with all preference columns', () => {
    expect(sql).toMatch(/create table public\.notification_preferences/)
    expect(sql).toMatch(/threshold_alerts/)
    expect(sql).toMatch(/comment_replies/)
    expect(sql).toMatch(/weekly_digest/)
    expect(sql).toMatch(/assignment_reminders/)
  })

  it('has a trigger to create profile on new user', () => {
    expect(sql).toMatch(/handle_new_user/)
    expect(sql).toMatch(/on_auth_user_created/)
    expect(sql).toMatch(/after insert on auth\.users/)
  })

  it('has updated_at trigger for mutable tables', () => {
    expect(sql).toMatch(/set_updated_at/)
    expect(sql).toMatch(/set_profiles_updated_at/)
    expect(sql).toMatch(/set_inventory_items_updated_at/)
    expect(sql).toMatch(/set_recipes_updated_at/)
    expect(sql).toMatch(/set_assignments_updated_at/)
    expect(sql).toMatch(/set_announcements_updated_at/)
  })

  it('assigns admin role to known email addresses', () => {
    expect(sql).toMatch(/stannestifton\.org/)
    expect(sql).toMatch(/'admin'/)
  })
})

// ─── RLS migration ───────────────────────────────────────────

describe('Migration: 20260304000001_rls_policies.sql', () => {
  let sql: string

  beforeAll(() => {
    sql = readMigration('20260304000001_rls_policies.sql')
  })

  it('enables RLS on all tables', () => {
    const tables = [
      'profiles',
      'inventory_items',
      'inventory_thresholds',
      'recipes',
      'assignments',
      'comments',
      'announcements',
      'notification_preferences',
    ]
    for (const table of tables) {
      expect(sql).toMatch(new RegExp(`alter table public\\.${table} enable row level security`))
    }
  })

  it('defines is_admin() helper function', () => {
    expect(sql).toMatch(/create or replace function public\.is_admin\(\)/)
    expect(sql).toMatch(/security definer/)
  })

  it('allows authenticated users to read all profiles', () => {
    expect(sql).toMatch(/profiles: authenticated read/)
  })

  it('restricts profile updates to self or admin', () => {
    expect(sql).toMatch(/profiles: self update/)
    expect(sql).toMatch(/profiles: admin update/)
  })

  it('restricts threshold modifications to admins only', () => {
    expect(sql).toMatch(/inventory_thresholds: admin update/)
    expect(sql).toMatch(/inventory_thresholds: admin insert/)
    expect(sql).toMatch(/inventory_thresholds: admin delete/)
  })

  it('allows authors or admins to update/delete recipes', () => {
    expect(sql).toMatch(/recipes: author or admin update/)
    expect(sql).toMatch(/recipes: author or admin delete/)
  })

  it('allows authors or admins to update/delete comments', () => {
    expect(sql).toMatch(/comments: author or admin update/)
    expect(sql).toMatch(/comments: author or admin delete/)
  })

  it('allows authors or admins to update/delete announcements', () => {
    expect(sql).toMatch(/announcements: author or admin update/)
    expect(sql).toMatch(/announcements: author or admin delete/)
  })

  it('restricts notification_preferences to owner or admin', () => {
    expect(sql).toMatch(/notification_preferences: owner read/)
    expect(sql).toMatch(/notification_preferences: owner update/)
  })
})

// ─── Seed migration ──────────────────────────────────────────

describe('Migration: 20260304000002_seed_data.sql', () => {
  let sql: string

  beforeAll(() => {
    sql = readMigration('20260304000002_seed_data.sql')
  })

  it('seeds loaves thresholds with correct values (30/24/8)', () => {
    expect(sql).toMatch(/'loaves'/)
    // green=30, yellow=24, red=8
    expect(sql).toMatch(/30,\s*24,\s*8/)
  })

  it("seeds Brother Charlie's reserve label for loaves", () => {
    expect(sql).toMatch(/Brother Charlie/)
  })

  it('seeds all five inventory categories', () => {
    expect(sql).toMatch(/'loaves'/)
    expect(sql).toMatch(/'cookies'/)
    expect(sql).toMatch(/'coffee_cakes'/)
    expect(sql).toMatch(/'emergency_bags'/)
    expect(sql).toMatch(/'bake_sale'/)
  })

  it('uses ON CONFLICT DO NOTHING for idempotency', () => {
    expect(sql).toMatch(/on conflict.*do nothing/i)
  })
})
