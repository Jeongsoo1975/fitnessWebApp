export interface Workout {
  id: string
  memberId: string
  trainerId: string
  date: Date
  title: string
  description?: string
  bodyParts: string[]
  exercises?: Exercise[]
  status: 'scheduled' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  restTime?: number
  notes?: string
}

export interface WorkoutSession {
  id: string
  workoutId: string
  startTime: Date
  endTime?: Date
  signature?: string
  notes?: string
  completed: boolean
}