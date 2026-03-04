/**
 * Type-level tests for the Database type definitions.
 * These tests verify that the type structure is correct and
 * that convenience aliases work as expected.
 */

import type {
  Database,
  Profile,
  InventoryItem,
  InventoryThreshold,
  Recipe,
  Assignment,
  Comment,
  Announcement,
  NotificationPreference,
  Tables,
  TablesInsert,
  TablesUpdate,
  UserRole,
  InventoryCategory,
  AssignmentStatus,
  DeliveryDestination,
  CommentParentType,
} from '@/types/database'

// ─── Enum value checks ───────────────────────────────────────

describe('Enum types', () => {
  it('UserRole includes admin and baker', () => {
    const admin: UserRole = 'admin'
    const baker: UserRole = 'baker'
    expect(admin).toBe('admin')
    expect(baker).toBe('baker')
  })

  it('InventoryCategory includes all required categories', () => {
    const categories: InventoryCategory[] = [
      'loaves',
      'cookies',
      'coffee_cakes',
      'emergency_bags',
      'bake_sale',
    ]
    expect(categories).toHaveLength(5)
  })

  it('AssignmentStatus includes all states', () => {
    const statuses: AssignmentStatus[] = ['open', 'in_progress', 'completed']
    expect(statuses).toHaveLength(3)
  })

  it('DeliveryDestination includes all destinations', () => {
    const destinations: DeliveryDestination[] = [
      'ruths_cottage',
      'brother_charlies',
      'bake_sale',
      'individual',
      'other',
    ]
    expect(destinations).toHaveLength(5)
  })

  it('CommentParentType includes all parent types', () => {
    const types: CommentParentType[] = [
      'inventory_item',
      'recipe',
      'assignment',
      'announcement',
    ]
    expect(types).toHaveLength(4)
  })
})

// ─── Row type shape checks ───────────────────────────────────

describe('Table row type shapes', () => {
  it('Profile has all required fields', () => {
    const profile: Profile = {
      id: 'uuid-1',
      display_name: 'Kim Moore',
      email: 'kim@stannestifton.org',
      role: 'admin',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(profile.role).toBe('admin')
    expect(typeof profile.id).toBe('string')
  })

  it('InventoryItem has quantity and category', () => {
    const item: InventoryItem = {
      id: 'uuid-2',
      name: 'Sourdough Loaves',
      category: 'loaves',
      quantity: 30,
      baked_date: '2026-03-04',
      freshness_days: 5,
      created_by: 'uuid-1',
      created_at: '2026-03-04T00:00:00Z',
      updated_at: '2026-03-04T00:00:00Z',
    }
    expect(item.category).toBe('loaves')
    expect(item.quantity).toBe(30)
  })

  it('InventoryThreshold has all threshold columns', () => {
    const threshold: InventoryThreshold = {
      id: 'uuid-3',
      category: 'loaves',
      green_threshold: 30,
      yellow_threshold: 24,
      red_threshold: 8,
      reserve_label: "Brother Charlie's",
      updated_by: null,
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(threshold.green_threshold).toBe(30)
    expect(threshold.yellow_threshold).toBe(24)
    expect(threshold.red_threshold).toBe(8)
    expect(threshold.reserve_label).toBe("Brother Charlie's")
  })

  it('Assignment has delivery_destination field', () => {
    const assignment: Assignment = {
      id: 'uuid-4',
      description: 'Bake 12 loaves for Brother Charlie',
      assigned_to: 'uuid-1',
      due_date: '2026-03-10',
      status: 'open',
      delivery_destination: 'brother_charlies',
      delivery_notes: null,
      created_by: 'uuid-1',
      created_at: '2026-03-04T00:00:00Z',
      updated_at: '2026-03-04T00:00:00Z',
    }
    expect(assignment.delivery_destination).toBe('brother_charlies')
    expect(assignment.status).toBe('open')
  })

  it('Comment has parent_type and parent_id for polymorphism', () => {
    const comment: Comment = {
      id: 'uuid-5',
      parent_type: 'recipe',
      parent_id: 'uuid-r',
      body: 'Great recipe!',
      author_id: 'uuid-1',
      created_at: '2026-03-04T00:00:00Z',
    }
    expect(comment.parent_type).toBe('recipe')
  })

  it('Announcement has pinned boolean', () => {
    const announcement: Announcement = {
      id: 'uuid-6',
      title: 'Baking Day Saturday',
      body: 'All bakers please join us.',
      author_id: 'uuid-1',
      pinned: true,
      created_at: '2026-03-04T00:00:00Z',
      updated_at: '2026-03-04T00:00:00Z',
    }
    expect(announcement.pinned).toBe(true)
  })

  it('NotificationPreference has all four preference flags', () => {
    const prefs: NotificationPreference = {
      id: 'uuid-7',
      user_id: 'uuid-1',
      threshold_alerts: true,
      comment_replies: true,
      weekly_digest: false,
      assignment_reminders: true,
    }
    expect(prefs.threshold_alerts).toBe(true)
    expect(prefs.weekly_digest).toBe(false)
  })
})

// ─── Insert type shape checks ────────────────────────────────

describe('Insert type shapes', () => {
  it('ProfileInsert requires only id', () => {
    const insert: TablesInsert<'profiles'> = {
      id: 'uuid-new',
    }
    expect(insert.id).toBe('uuid-new')
    expect(insert.role).toBeUndefined()
  })

  it('InventoryItemInsert requires name and category', () => {
    const insert: TablesInsert<'inventory_items'> = {
      name: 'Chocolate Chip Cookies',
      category: 'cookies',
    }
    expect(insert.name).toBe('Chocolate Chip Cookies')
  })

  it('RecipeInsert requires title', () => {
    const insert: TablesInsert<'recipes'> = {
      title: 'Sourdough Bread',
    }
    expect(insert.title).toBe('Sourdough Bread')
  })
})

// ─── Generic Tables helper ───────────────────────────────────

describe('Tables<T> generic helper', () => {
  it('resolves to the correct Row type', () => {
    type ProfileRow = Tables<'profiles'>
    const row: ProfileRow = {
      id: 'uuid-1',
      display_name: 'Art Lawton',
      email: 'art@stannestifton.org',
      role: 'admin',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    expect(row.role).toBe('admin')
  })
})

// ─── Database Functions type ─────────────────────────────────

describe('Database Functions', () => {
  it('is_admin is defined in the Database type', () => {
    type Functions = Database['public']['Functions']
    type IsAdminReturn = Functions['is_admin']['Returns']
    const result: IsAdminReturn = true
    expect(result).toBe(true)
  })
})
