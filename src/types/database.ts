/**
 * TypeScript types for the Loaves of Love Supabase schema.
 *
 * These types mirror the SQL schema defined in supabase/migrations/.
 * Run `supabase gen types typescript --local > src/types/database.ts`
 * to regenerate after schema changes.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ─── Enum types ──────────────────────────────────────────────

export type UserRole = 'admin' | 'baker'
export type InventoryCategory =
  | 'loaves'
  | 'cookies'
  | 'coffee_cakes'
  | 'emergency_bags'
  | 'bake_sale'
export type AssignmentStatus = 'open' | 'in_progress' | 'completed'
export type DeliveryDestination =
  | 'ruths_cottage'
  | 'brother_charlies'
  | 'bake_sale'
  | 'individual'
  | 'other'
export type CommentParentType = 'inventory_item' | 'recipe' | 'assignment' | 'announcement'

// ─── Table row types ─────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          email?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          email?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          category: InventoryCategory
          quantity: number
          baked_date: string | null
          freshness_days: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: InventoryCategory
          quantity?: number
          baked_date?: string | null
          freshness_days?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: InventoryCategory
          quantity?: number
          baked_date?: string | null
          freshness_days?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_items_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      inventory_thresholds: {
        Row: {
          id: string
          category: InventoryCategory
          green_threshold: number
          yellow_threshold: number
          red_threshold: number
          reserve_label: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          category: InventoryCategory
          green_threshold: number
          yellow_threshold: number
          red_threshold: number
          reserve_label?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          category?: InventoryCategory
          green_threshold?: number
          yellow_threshold?: number
          red_threshold?: number
          reserve_label?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_thresholds_updated_by_fkey'
            columns: ['updated_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      recipes: {
        Row: {
          id: string
          title: string
          description: string | null
          ingredients: Json | null
          instructions: string | null
          photo_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          ingredients?: Json | null
          instructions?: string | null
          photo_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          ingredients?: Json | null
          instructions?: string | null
          photo_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipes_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      assignments: {
        Row: {
          id: string
          description: string
          assigned_to: string | null
          due_date: string | null
          status: AssignmentStatus
          delivery_destination: DeliveryDestination | null
          delivery_notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          description: string
          assigned_to?: string | null
          due_date?: string | null
          status?: AssignmentStatus
          delivery_destination?: DeliveryDestination | null
          delivery_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          description?: string
          assigned_to?: string | null
          due_date?: string | null
          status?: AssignmentStatus
          delivery_destination?: DeliveryDestination | null
          delivery_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'assignments_assigned_to_fkey'
            columns: ['assigned_to']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'assignments_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      comments: {
        Row: {
          id: string
          parent_type: CommentParentType
          parent_id: string
          body: string
          author_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_type: CommentParentType
          parent_id: string
          body: string
          author_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_type?: CommentParentType
          parent_id?: string
          body?: string
          author_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          author_id: string | null
          pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          body: string
          author_id?: string | null
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          body?: string
          author_id?: string | null
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'announcements_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          threshold_alerts: boolean
          comment_replies: boolean
          weekly_digest: boolean
          assignment_reminders: boolean
        }
        Insert: {
          id?: string
          user_id: string
          threshold_alerts?: boolean
          comment_replies?: boolean
          weekly_digest?: boolean
          assignment_reminders?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          threshold_alerts?: boolean
          comment_replies?: boolean
          weekly_digest?: boolean
          assignment_reminders?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      inventory_category: InventoryCategory
      assignment_status: AssignmentStatus
      delivery_destination: DeliveryDestination
      comment_parent_type: CommentParentType
    }
    CompositeTypes: Record<string, never>
  }
}

// ─── Convenience aliases ──────────────────────────────────────

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type InventoryItem = Tables<'inventory_items'>
export type InventoryThreshold = Tables<'inventory_thresholds'>
export type Recipe = Tables<'recipes'>
export type Assignment = Tables<'assignments'>
export type Comment = Tables<'comments'>
export type Announcement = Tables<'announcements'>
export type NotificationPreference = Tables<'notification_preferences'>
