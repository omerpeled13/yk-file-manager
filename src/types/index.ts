export interface File {
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
  
  export interface Profile {
    id: string
    name: string | null
    image_url: string | null
  }