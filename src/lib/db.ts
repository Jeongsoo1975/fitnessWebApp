// Cloudflare D1 Database Connection Utility
// This module provides typed database access for the FitnessWebApp

// Import Cloudflare Workers types
/// <reference types="@cloudflare/workers-types" />

export interface DatabaseEnv {
  DB: D1Database
}

export class DatabaseManager {
  private db: D1Database

  constructor(database: D1Database) {
    this.db = database
  }

  // Generic query method with prepared statements
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql)
      const result = await stmt.bind(...params).all()
      return result.results as T[]
    } catch (error) {
      console.error('Database query error:', error)
      throw new Error(`Database query failed: ${error}`)
    }
  }

  // Execute single query (INSERT, UPDATE, DELETE)
  async execute(sql: string, params: any[] = []): Promise<D1Result> {
    try {
      const stmt = this.db.prepare(sql)
      return await stmt.bind(...params).run()
    } catch (error) {
      console.error('Database execution error:', error)
      throw new Error(`Database execution failed: ${error}`)
    }
  }

  // Get single record
  async first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql)
      const result = await stmt.bind(...params).first()
      return result as T | null
    } catch (error) {
      console.error('Database first query error:', error)
      throw new Error(`Database first query failed: ${error}`)
    }
  }

  // Transaction support (D1 batch operations)
  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    try {
      return await this.db.batch(statements)
    } catch (error) {
      console.error('Database batch error:', error)
      throw new Error(`Database batch failed: ${error}`)
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as health')
      return true
    } catch {
      return false
    }
  }

  // Get database instance (for direct access if needed)
  getDatabase(): D1Database {
    return this.db
  }

  // Prepare statement
  prepare(sql: string): D1PreparedStatement {
    return this.db.prepare(sql)
  }
}

// Helper function to create database manager instance
export function createDatabaseManager(env: DatabaseEnv): DatabaseManager {
  return new DatabaseManager(env.DB)
}

// Migration runner utility
export async function runMigrations(db: DatabaseManager): Promise<void> {
  try {
    // Check if migrations table exists
    const migrationTableExists = await db.first(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='migrations'
    `)

    if (!migrationTableExists) {
      // Create migrations table
      await db.execute(`
        CREATE TABLE migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    }

    console.log('Migration system initialized')
  } catch (error) {
    console.error('Migration setup failed:', error)
    throw error
  }
}

// Type definitions for database tables
export interface User {
  id: string
  clerk_id: string
  role: 'trainer' | 'member'
  email: string
  first_name?: string
  last_name?: string
  profile_image?: string
  invite_code?: string
  specialties?: string // JSON
  experience?: number
  certification?: string // JSON
  goals?: string // JSON
  fitness_level?: 'beginner' | 'intermediate' | 'advanced'
  medical_conditions?: string // JSON
  created_at: string
  updated_at: string
}

export interface TrainerMember {
  id: string
  trainer_id: string
  member_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface PTSession {
  id: string
  trainer_id: string
  member_id: string
  total_sessions: number
  used_sessions: number
  remaining_sessions: number
  created_at: string
  updated_at: string
}

export interface SessionRecord {
  id: string
  pt_session_id: string
  start_time: string
  end_time?: string
  signature?: string
  notes?: string
  completed: boolean
  created_at: string
}

export interface Workout {
  id: string
  trainer_id: string
  member_id: string
  date: string
  title: string
  description?: string
  body_parts: string // JSON
  exercises?: string // JSON
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Diet {
  id: string
  member_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  description: string
  image_url?: string
  calories?: number
  carbs?: number
  protein?: number
  fat?: number
  created_at: string
  updated_at: string
}

export interface ProgressTracking {
  id: string
  member_id: string
  date: string
  weight?: number
  body_fat_percentage?: number
  muscle_mass?: number
  chest?: number
  waist?: number
  hip?: number
  arm?: number
  thigh?: number
  notes?: string
  created_at: string
}

export interface ExerciseRecord {
  id: string
  member_id: string
  workout_id?: string
  exercise_name: string
  sets?: number
  reps?: number
  weight?: number
  duration?: number
  rest_time?: number
  notes?: string
  performed_at: string
}

// 새로 추가된 테이블 타입들
export interface ScheduleChangeRequest {
  id: string
  workout_id: string
  member_id: string
  trainer_id: string
  requested_date?: string
  requested_start_time?: string
  requested_end_time?: string
  current_date: string
  current_start_time: string
  current_end_time: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  trainer_response?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  workout_id?: string
  change_request_id?: string
  content: string
  message_type: 'general' | 'schedule_change' | 'system'
  read_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'new_workout' | 'schedule_change_request' | 'schedule_change_response' | 'new_message'
  title: string
  content: string
  related_id?: string
  related_type?: 'workout' | 'change_request' | 'message'
  read_at?: string
  created_at: string
}