export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F'

export interface Database {
  public: {
    Tables: {
      establishments: {
        Row: {
          id: string
          google_place_id: string | null
          name: string
          address: string
          lat: number
          lng: number
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          google_place_id?: string | null
          name: string
          address: string
          lat: number
          lng: number
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          google_place_id?: string | null
          name?: string
          address?: string
          lat?: number
          lng?: number
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          establishment_id: string
          user_id: string
          grade: Grade
          review_text: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          establishment_id: string
          user_id: string
          grade: Grade
          review_text?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          establishment_id?: string
          user_id?: string
          grade?: Grade
          review_text?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          }
        ]
      }
      allowed_emails: {
        Row: {
          email: string
          added_by: string | null
          added_at: string
        }
        Insert: {
          email: string
          added_by?: string | null
          added_at?: string
        }
        Update: {
          email?: string
          added_by?: string | null
          added_at?: string
        }
        Relationships: []
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

// Helper types
export type Establishment = Database['public']['Tables']['establishments']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type AllowedEmail = Database['public']['Tables']['allowed_emails']['Row']

export interface EstablishmentWithReviews extends Establishment {
  reviews: (Review & { user_email?: string })[]
  average_grade?: Grade
}
