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
          name: string
          email: string
          role: 'admin' | 'user' | 'client_admin'
          created_at: string
          confirmed: boolean
          client: {name:string,id:string}
        }
        Insert: {
          id: string
          name: string
          email: string
          role: 'admin' | 'user' | 'client_admin'
          client_id: string
        }
        Update: {
          email?: string
          name?: string
          role?: 'admin' | 'user' | 'client_admin'
          confirmed?: boolean
          client_id?: string
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
          client_id: string
        }
        Insert: {
          name: string
          file_url: string
          description: string
          file_type: string
          file_size: number
          uploaded_by: string
          client_id: string
        }
        Update: {
          name?: string
          description?: string
          client_id?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
      }
    }
  }
} 