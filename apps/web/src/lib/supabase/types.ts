/**
 * Database Type Definitions
 * Generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          wallet_address: string
          display_name: string | null
          global_bio: string | null
          avatar_ipfs_hash: string | null
          joined_at: string
          updated_at: string
        }
        Insert: {
          wallet_address: string
          display_name?: string | null
          global_bio?: string | null
          avatar_ipfs_hash?: string | null
          joined_at?: string
          updated_at?: string
        }
        Update: {
          wallet_address?: string
          display_name?: string | null
          global_bio?: string | null
          avatar_ipfs_hash?: string | null
          joined_at?: string
          updated_at?: string
        }
      }
      event_personas: {
        Row: {
          id: string
          wallet_address: string
          event_id: number
          display_name: string
          bio: string | null
          interests: string[]
          looking_for: string[]
          visibility: 'public' | 'attendees' | 'connections' | 'private'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          event_id: number
          display_name: string
          bio?: string | null
          interests?: string[]
          looking_for?: string[]
          visibility?: 'public' | 'attendees' | 'connections' | 'private'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          event_id?: number
          display_name?: string
          bio?: string | null
          interests?: string[]
          looking_for?: string[]
          visibility?: 'public' | 'attendees' | 'connections' | 'private'
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          from_wallet: string
          to_wallet: string
          event_id: number
          status: 'pending' | 'accepted' | 'rejected' | 'blocked' | 'removed'
          message: string | null
          is_global: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_wallet: string
          to_wallet: string
          event_id: number
          status?: 'pending' | 'accepted' | 'rejected' | 'blocked' | 'removed'
          message?: string | null
          is_global?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_wallet?: string
          to_wallet?: string
          event_id?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'blocked' | 'removed'
          message?: string | null
          is_global?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          from_wallet: string
          to_wallet: string
          event_id: number | null
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_wallet: string
          to_wallet: string
          event_id?: number | null
          content: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_wallet?: string
          to_wallet?: string
          event_id?: number | null
          content?: string
          read_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_wallet: string
          type:
            | 'connection_request'
            | 'connection_accepted'
            | 'connection_rejected'
            | 'new_message'
            | 'event_reminder'
            | 'waitlist_available'
            | 'event_cancelled'
            | 'system'
          title: string
          message: string
          link: string | null
          metadata: Json | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_wallet: string
          type:
            | 'connection_request'
            | 'connection_accepted'
            | 'connection_rejected'
            | 'new_message'
            | 'event_reminder'
            | 'waitlist_available'
            | 'event_cancelled'
            | 'system'
          title: string
          message: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_wallet?: string
          type?:
            | 'connection_request'
            | 'connection_accepted'
            | 'connection_rejected'
            | 'new_message'
            | 'event_reminder'
            | 'waitlist_available'
            | 'event_cancelled'
            | 'system'
          title?: string
          message?: string
          link?: string | null
          metadata?: Json | null
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      active_connections: {
        Row: {
          id: string
          from_wallet: string
          to_wallet: string
          event_id: number
          is_global: boolean
          created_at: string
        }
      }
      unread_messages_count: {
        Row: {
          user_wallet: string
          unread_count: number
        }
      }
      unread_notifications_count: {
        Row: {
          user_wallet: string
          unread_count: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
