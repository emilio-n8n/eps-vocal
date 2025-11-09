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
          full_name: string
          school_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          school_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          school_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          teacher_id: string
          name: string
          level: string
          school_year: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          level: string
          school_year: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          level?: string
          school_year?: string
          description?: string | null
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          class_id: string
          first_name: string
          last_name: string
          date_of_birth: string | null
          gender: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          first_name: string
          last_name: string
          date_of_birth?: string | null
          gender?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          gender?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          class_id: string
          teacher_id: string
          sport: string
          date: string
          start_time: string
          end_time: string | null
          general_notes: string | null
          weather: string | null
          location: string | null
          status: 'in_progress' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class_id: string
          teacher_id: string
          sport: string
          date?: string
          start_time?: string
          end_time?: string | null
          general_notes?: string | null
          weather?: string | null
          location?: string | null
          status?: 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          teacher_id?: string
          sport?: string
          date?: string
          start_time?: string
          end_time?: string | null
          general_notes?: string | null
          weather?: string | null
          location?: string | null
          status?: 'in_progress' | 'completed' | 'cancelled'
          updated_at?: string
        }
      }
      session_attendance: {
        Row: {
          id: string
          session_id: string
          student_id: string
          is_present: boolean
          absence_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          is_present?: boolean
          absence_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          is_present?: boolean
          absence_reason?: string | null
        }
      }
      observations: {
        Row: {
          id: string
          session_id: string
          student_id: string | null
          raw_text: string
          processed_text: string | null
          category: 'performance' | 'behavior' | 'progress' | 'difficulty' | 'injury' | 'general' | null
          sentiment: 'positive' | 'neutral' | 'negative' | null
          keywords: string[] | null
          timestamp: string
          audio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id?: string | null
          raw_text: string
          processed_text?: string | null
          category?: 'performance' | 'behavior' | 'progress' | 'difficulty' | 'injury' | 'general' | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          keywords?: string[] | null
          timestamp?: string
          audio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string | null
          raw_text?: string
          processed_text?: string | null
          category?: 'performance' | 'behavior' | 'progress' | 'difficulty' | 'injury' | 'general' | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          keywords?: string[] | null
          timestamp?: string
          audio_url?: string | null
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          session_id: string | null
          student_id: string | null
          report_type: 'session_summary' | 'student_progress' | 'class_report'
          content: Json
          pdf_url: string | null
          generated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          student_id?: string | null
          report_type: 'session_summary' | 'student_progress' | 'class_report'
          content: Json
          pdf_url?: string | null
          generated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string | null
          student_id?: string | null
          report_type?: 'session_summary' | 'student_progress' | 'class_report'
          content?: Json
          pdf_url?: string | null
          generated_at?: string
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
  }
}
