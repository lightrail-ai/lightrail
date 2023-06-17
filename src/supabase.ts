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
          owner: string | null
          path: string
          project_id: number
          state: Json[] | null
        }
        Insert: {
          contents?: string | null
          created_at?: string | null
          id?: number
          owner?: string | null
          path: string
          project_id: number
          state?: Json[] | null
        }
        Update: {
          contents?: string | null
          created_at?: string | null
          id?: number
          owner?: string | null
          path?: string
          project_id?: number
          state?: Json[] | null
        }
        Relationships: [
          {
            foreignKeyName: "files_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          libraries: string[]
          name: string
          owner: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          libraries?: string[]
          name: string
          owner?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          libraries?: string[]
          name?: string
          owner?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
