export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          contents: string | null
          created_at: string | null
          id: number
          path: string
          project_id: number
        }
        Insert: {
          contents?: string | null
          created_at?: string | null
          id?: number
          path: string
          project_id: number
        }
        Update: {
          contents?: string | null
          created_at?: string | null
          id?: number
          path?: string
          project_id?: number
        }
      }
      projects: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
