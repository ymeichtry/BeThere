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
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      parties: {
        Row: {
          id: string
          title: string
          description: string | null
          host_id: string
          location: string
          latitude: number | null
          longitude: number | null
          date: string
          entry_fee: number | null
          music_genre: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          host_id: string
          location: string
          latitude?: number | null
          longitude?: number | null
          date: string
          entry_fee?: number | null
          music_genre?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          host_id?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          date?: string
          entry_fee?: number | null
          music_genre?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parties_host_id_fkey"
            columns: ["host_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      party_attendees: {
        Row: {
          id: string
          party_id: string
          profile_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          party_id: string
          profile_id: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          party_id?: string
          profile_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_attendees_party_id_fkey"
            columns: ["party_id"]
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_attendees_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      party_invites: {
        Row: {
          id: string
          party_id: string
          profile_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          party_id: string
          profile_id: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          party_id?: string
          profile_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_invites_party_id_fkey"
            columns: ["party_id"]
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_invites_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
  }
}