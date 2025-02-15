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
          email: string
          role: 'admin' | 'client'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'client'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'client'
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          name: string
          file_url: string
          description: string
          created_at: string
          file_type: string
          file_size: number
          uploaded_by: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          file_url: string
          description?: string
          created_at?: string
          file_type: string
          file_size: number
          uploaded_by: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          file_url?: string
          description?: string
          created_at?: string
          file_type?: string
          file_size?: number
          uploaded_by?: string
          user_id?: string
        }
      }
    }
  }
} 