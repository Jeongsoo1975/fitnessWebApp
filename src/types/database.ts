// Database entity types for FitnessWebApp

export interface PTSession {
  id: string
  trainerId: string
  memberId: string
  totalSessions: number
  usedSessions: number
  remainingSessions: number
  createdAt: Date
  updatedAt: Date
}

export interface SessionRecord {
  id: string
  ptSessionId: string
  startTime: Date
  endTime?: Date
  signature?: string // Base64 encoded signature
  notes?: string
  completed: boolean
  createdAt: Date
}

export interface Diet {
  id: string
  memberId: string
  date: Date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  description: string
  imageUrl?: string
  calories?: number
  carbs?: number // 탄수화물 (g)
  protein?: number // 단백질 (g)
  fat?: number // 지방 (g)
  createdAt: Date
  updatedAt: Date
}

export interface ProgressTracking {
  id: string
  memberId: string
  date: Date
  weight?: number // 체중 (kg)
  bodyFatPercentage?: number // 체지방률 (%)
  muscleMass?: number // 근육량 (kg)
  chest?: number // 가슴 둘레 (cm)
  waist?: number // 허리 둘레 (cm)
  hip?: number // 엉덩이 둘레 (cm)
  arm?: number // 팔 둘레 (cm)
  thigh?: number // 허벅지 둘레 (cm)
  notes?: string
  createdAt: Date
}

export interface TrainerMemberRelation {
  id: string
  trainerId: string
  memberId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

// 새로 추가된 타입들

export interface ScheduleChangeRequest {
  id: string
  workoutId: string
  memberId: string
  trainerId: string
  requestedDate?: Date
  requestedStartTime?: string
  requestedEndTime?: string
  currentDate: Date
  currentStartTime: string
  currentEndTime: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  trainerResponse?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  workoutId?: string
  changeRequestId?: string
  content: string
  messageType: 'general' | 'schedule_change' | 'system'
  readAt?: Date
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'new_workout' | 'schedule_change_request' | 'schedule_change_response' | 'new_message'
  title: string
  content: string
  relatedId?: string
  relatedType?: 'workout' | 'change_request' | 'message'
  readAt?: Date
  createdAt: Date
}