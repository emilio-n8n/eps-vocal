import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Attendance = Database['public']['Tables']['session_attendance']['Row']
export type Observation = Database['public']['Tables']['observations']['Row']
export type Report = Database['public']['Tables']['reports']['Row']

export type ObservationCategory = 
  | 'performance' 
  | 'behavior' 
  | 'progress' 
  | 'difficulty' 
  | 'injury' 
  | 'general'

export type ObservationSentiment = 
  | 'positive' 
  | 'neutral' 
  | 'negative'

export type SessionStatus = 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled'

export type ReportType = 
  | 'session_summary' 
  | 'student_progress' 
  | 'class_report'

export interface ClassWithStats extends Class {
  student_count: number
  session_count: number
}

export interface SessionWithStats extends Session {
  present_count: number
  absent_count: number
  observation_count: number
  positive_count: number
  negative_count: number
}

export interface StudentWithStats extends Student {
  sessions_attended: number
  total_observations: number
  positive_observations: number
  negative_observations: number
  progress_observations: number
}

export interface ObservationWithStudent extends Observation {
  student?: Student
}

export interface ReportContent {
  title: string
  summary: string
  observations: Observation[]
  statistics: {
    totalObservations: number
    positiveCount: number
    neutralCount: number
    negativeCount: number
    byCategory: Record<ObservationCategory, number>
  }
  recommendations?: string[]
  studentProgress?: {
    studentId: string
    studentName: string
    strengths: string[]
    areasForImprovement: string[]
    overallProgress: string
  }[]
}

export interface GeminiProcessedObservation {
  studentId?: string
  studentName?: string
  category: ObservationCategory
  sentiment: ObservationSentiment
  processedText: string
  keywords: string[]
  suggestions?: string[]
}
