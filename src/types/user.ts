export type UserRole = 'trainer' | 'member'

export interface User {
  id: string
  clerkId: string
  role: UserRole
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface TrainerProfile extends User {
  role: 'trainer'
  inviteCode: string
  specialties?: string[]
  experience?: number
  certification?: string[]
}

export interface MemberProfile extends User {
  role: 'member'
  trainerId?: string
  goals?: string[]
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
  medicalConditions?: string[]
}