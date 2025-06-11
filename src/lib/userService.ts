// UserService - D1 Database User Management Service
// Extends DatabaseManager for user-specific operations

import { DatabaseManager, type User, type DatabaseEnv } from './db'
import { validateEmail, AppError, createValidationError, createBusinessError } from './errorHandler'
import { createApiLogger } from './logger'
import { validateUserByEmail, type ValidatedUser, type UserRole } from './auth'

const userLogger = createApiLogger('user-service')

export interface UserCreateInput {
  clerkId: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  profileImage?: string
}

export interface UserUpdateInput {
  firstName?: string
  lastName?: string
  profileImage?: string
  specialties?: string[] // For trainers
  experience?: number // For trainers  
  certification?: string[] // For trainers
  goals?: string[] // For members
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' // For members
  medicalConditions?: string[] // For members
}

export interface UserProfile extends User {
  profileCompleteness: number // 0-100
  missingFields: string[]
}

export class UserService extends DatabaseManager {
  constructor(database: D1Database) {
    super(database)
    userLogger.info('UserService initialized')
  }

  /**
   * Create a new user in the database
   */
  async createUser(input: UserCreateInput): Promise<User> {
    userLogger.info('Creating new user', { clerkId: input.clerkId, role: input.role })

    try {
      // Validate input
      if (!input.clerkId) {
        throw createValidationError('clerkId', 'Clerk ID는 필수입니다')
      }
      if (!input.email) {
        throw createValidationError('email', '이메일은 필수입니다')
      }
      if (!input.role || !['trainer', 'member'].includes(input.role)) {
        throw createValidationError('role', '올바른 역할을 선택해주세요 (trainer 또는 member)')
      }

      // Validate email format
      validateEmail(input.email)

      // Check for duplicate Clerk ID
      const existingUser = await this.first<User>(
        'SELECT * FROM users WHERE clerk_id = ?',
        [input.clerkId]
      )

      if (existingUser) {
        throw createBusinessError(
          'USER_ALREADY_EXISTS',
          '이미 등록된 사용자입니다',
          409
        )
      }

      // Check for duplicate email
      const existingEmailUser = await this.first<User>(
        'SELECT * FROM users WHERE email = ?',
        [input.email]
      )

      if (existingEmailUser) {
        throw createBusinessError(
          'EMAIL_ALREADY_EXISTS',
          '이미 사용 중인 이메일입니다',
          409
        )
      }

      // Generate invite code for trainers
      let inviteCode: string | undefined
      if (input.role === 'trainer') {
        inviteCode = await this.generateUniqueInviteCode()
      }

      // Insert user
      const result = await this.execute(`
        INSERT INTO users (
          clerk_id, role, email, first_name, last_name, profile_image, invite_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        input.clerkId,
        input.role,
        input.email,
        input.firstName || null,
        input.lastName || null,
        input.profileImage || null,
        inviteCode || null
      ])

      // Fetch the created user
      const newUser = await this.first<User>(
        'SELECT * FROM users WHERE id = ?',
        [result.meta?.last_row_id]
      )

      if (!newUser) {
        throw new Error('사용자 생성 후 조회에 실패했습니다')
      }

      userLogger.info('User created successfully', { 
        userId: newUser.id, 
        clerkId: input.clerkId, 
        role: input.role 
      })

      return newUser

    } catch (error) {
      userLogger.error('Failed to create user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        clerkId: input.clerkId,
        email: input.email
      })
      throw error
    }
  }

  /**
   * Get user by Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<User | null> {
    userLogger.debug('Getting user by Clerk ID', { clerkId })

    try {
      if (!clerkId) {
        throw createValidationError('clerkId', 'Clerk ID는 필수입니다')
      }

      const user = await this.first<User>(
        'SELECT * FROM users WHERE clerk_id = ?',
        [clerkId]
      )

      if (user) {
        userLogger.debug('User found', { userId: user.id, role: user.role })
      } else {
        userLogger.debug('User not found', { clerkId })
      }

      return user

    } catch (error) {
      userLogger.error('Failed to get user by Clerk ID', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        clerkId 
      })
      throw error
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    userLogger.debug('Getting user by ID', { id })

    try {
      if (!id) {
        throw createValidationError('id', 'User ID는 필수입니다')
      }

      const user = await this.first<User>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      )

      if (user) {
        userLogger.debug('User found', { userId: user.id, role: user.role })
      } else {
        userLogger.debug('User not found', { id })
      }

      return user

    } catch (error) {
      userLogger.error('Failed to get user by ID', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        id 
      })
      throw error
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    userLogger.debug('Getting user by email', { email })

    try {
      if (!email) {
        throw createValidationError('email', '이메일은 필수입니다')
      }

      validateEmail(email)

      const user = await this.first<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )

      if (user) {
        userLogger.debug('User found', { userId: user.id, role: user.role })
      } else {
        userLogger.debug('User not found', { email })
      }

      return user

    } catch (error) {
      userLogger.error('Failed to get user by email', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email 
      })
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(id: string, input: UserUpdateInput): Promise<User> {
    userLogger.info('Updating user profile', { userId: id })

    try {
      if (!id) {
        throw createValidationError('id', 'User ID는 필수입니다')
      }

      // Check if user exists
      const existingUser = await this.getUserById(id)
      if (!existingUser) {
        throw createBusinessError('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
      }

      // Prepare update fields
      const updateFields: string[] = []
      const updateValues: any[] = []

      if (input.firstName !== undefined) {
        updateFields.push('first_name = ?')
        updateValues.push(input.firstName || null)
      }

      if (input.lastName !== undefined) {
        updateFields.push('last_name = ?')
        updateValues.push(input.lastName || null)
      }

      if (input.profileImage !== undefined) {
        updateFields.push('profile_image = ?')
        updateValues.push(input.profileImage || null)
      }

      // Role-specific fields
      if (existingUser.role === 'trainer') {
        if (input.specialties !== undefined) {
          updateFields.push('specialties = ?')
          updateValues.push(JSON.stringify(input.specialties))
        }

        if (input.experience !== undefined) {
          updateFields.push('experience = ?')
          updateValues.push(input.experience)
        }

        if (input.certification !== undefined) {
          updateFields.push('certification = ?')
          updateValues.push(JSON.stringify(input.certification))
        }
      }

      if (existingUser.role === 'member') {
        if (input.goals !== undefined) {
          updateFields.push('goals = ?')
          updateValues.push(JSON.stringify(input.goals))
        }

        if (input.fitnessLevel !== undefined) {
          if (!['beginner', 'intermediate', 'advanced'].includes(input.fitnessLevel)) {
            throw createValidationError('fitnessLevel', '올바른 운동 수준을 선택해주세요')
          }
          updateFields.push('fitness_level = ?')
          updateValues.push(input.fitnessLevel)
        }

        if (input.medicalConditions !== undefined) {
          updateFields.push('medical_conditions = ?')
          updateValues.push(JSON.stringify(input.medicalConditions))
        }
      }

      if (updateFields.length === 0) {
        throw createValidationError('input', '업데이트할 필드가 없습니다')
      }

      // Add updated_at
      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      updateValues.push(id) // For WHERE clause

      // Execute update
      await this.execute(`
        UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
      `, updateValues)

      // Fetch updated user
      const updatedUser = await this.getUserById(id)
      if (!updatedUser) {
        throw new Error('사용자 업데이트 후 조회에 실패했습니다')
      }

      userLogger.info('User profile updated successfully', { userId: id })
      return updatedUser

    } catch (error) {
      userLogger.error('Failed to update user profile', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id 
      })
      throw error
    }
  }

  /**
   * Delete user (cascade)
   */
  async deleteUser(id: string): Promise<void> {
    userLogger.info('Deleting user', { userId: id })

    try {
      if (!id) {
        throw createValidationError('id', 'User ID는 필수입니다')
      }

      // Check if user exists
      const existingUser = await this.getUserById(id)
      if (!existingUser) {
        throw createBusinessError('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
      }

      // Delete user (CASCADE will handle related records)
      const result = await this.execute('DELETE FROM users WHERE id = ?', [id])

      if (result.meta?.changes === 0) {
        throw new Error('사용자 삭제에 실패했습니다')
      }

      userLogger.info('User deleted successfully', { userId: id })

    } catch (error) {
      userLogger.error('Failed to delete user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id 
      })
      throw error
    }
  }

  /**
   * Get user profile with completeness score
   */
  async getUserProfile(id: string): Promise<UserProfile | null> {
    userLogger.debug('Getting user profile with completeness', { userId: id })

    try {
      const user = await this.getUserById(id)
      if (!user) {
        return null
      }

      const { completeness, missingFields } = this.calculateProfileCompleteness(user)

      const userProfile: UserProfile = {
        ...user,
        profileCompleteness: completeness,
        missingFields
      }

      userLogger.debug('User profile retrieved', { 
        userId: id, 
        completeness,
        missingFieldsCount: missingFields.length 
      })

      return userProfile

    } catch (error) {
      userLogger.error('Failed to get user profile', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id 
      })
      throw error
    }
  }

  /**
   * Calculate profile completeness score
   */
  private calculateProfileCompleteness(user: User): { 
    completeness: number; 
    missingFields: string[] 
  } {
    const missingFields: string[] = []
    let totalFields = 0
    let completedFields = 0

    // Basic fields (common for all roles)
    const basicFields = [
      { name: 'first_name', value: user.first_name, label: '이름' },
      { name: 'last_name', value: user.last_name, label: '성' },
      { name: 'email', value: user.email, label: '이메일' }
    ]

    basicFields.forEach(field => {
      totalFields++
      if (field.value) {
        completedFields++
      } else {
        missingFields.push(field.label)
      }
    })

    // Role-specific fields
    if (user.role === 'trainer') {
      const trainerFields = [
        { name: 'specialties', value: user.specialties, label: '전문분야' },
        { name: 'experience', value: user.experience, label: '경력' }
      ]

      trainerFields.forEach(field => {
        totalFields++
        if (field.value !== null && field.value !== undefined) {
          // Check if JSON array has items
          if (field.name === 'specialties') {
            try {
              const parsed = JSON.parse(field.value as string)
              if (Array.isArray(parsed) && parsed.length > 0) {
                completedFields++
              } else {
                missingFields.push(field.label)
              }
            } catch {
              missingFields.push(field.label)
            }
          } else {
            completedFields++
          }
        } else {
          missingFields.push(field.label)
        }
      })
    }

    if (user.role === 'member') {
      const memberFields = [
        { name: 'goals', value: user.goals, label: '운동 목표' },
        { name: 'fitness_level', value: user.fitness_level, label: '운동 수준' }
      ]

      memberFields.forEach(field => {
        totalFields++
        if (field.value !== null && field.value !== undefined) {
          // Check if JSON array has items
          if (field.name === 'goals') {
            try {
              const parsed = JSON.parse(field.value as string)
              if (Array.isArray(parsed) && parsed.length > 0) {
                completedFields++
              } else {
                missingFields.push(field.label)
              }
            } catch {
              missingFields.push(field.label)
            }
          } else {
            completedFields++
          }
        } else {
          missingFields.push(field.label)
        }
      })
    }

    const completeness = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0

    return { completeness, missingFields }
  }

  /**
   * Generate unique invite code for trainers
   */
  private async generateUniqueInviteCode(): Promise<string> {
    const maxAttempts = 10
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Generate 8-character alphanumeric code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // Check if already exists
      const existing = await this.first<User>(
        'SELECT id FROM users WHERE invite_code = ?',
        [code]
      )
      
      if (!existing) {
        return code
      }
    }
    
    throw new Error('초대 코드 생성에 실패했습니다')
  }

  /**
   * Validate user exists in Clerk and optionally check role
   */
  async validateClerkUser(email: string, expectedRole?: UserRole): Promise<ValidatedUser | null> {
    userLogger.debug('Validating Clerk user', { email, expectedRole })

    try {
      validateEmail(email)

      const clerkUser = await validateUserByEmail(email)
      
      if (!clerkUser) {
        userLogger.debug('User not found in Clerk', { email })
        return null
      }

      if (expectedRole && clerkUser.role !== expectedRole) {
        userLogger.debug('User role mismatch', { 
          email, 
          expectedRole, 
          actualRole: clerkUser.role 
        })
        return null
      }

      userLogger.debug('Clerk user validated successfully', { 
        email, 
        clerkId: clerkUser.id,
        role: clerkUser.role 
      })

      return clerkUser

    } catch (error) {
      userLogger.error('Failed to validate Clerk user', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        email 
      })
      return null
    }
  }

  /**
   * Sync user from Clerk to D1 database
   */
  async syncUserFromClerk(clerkUser: ValidatedUser, role: UserRole): Promise<User> {
    userLogger.info('Syncing user from Clerk to D1', { 
      clerkId: clerkUser.id, 
      email: clerkUser.email,
      role 
    })

    try {
      // Check if user already exists in D1
      const existingUser = await this.getUserByClerkId(clerkUser.id)
      
      if (existingUser) {
        userLogger.debug('User already exists in D1, returning existing user', { 
          userId: existingUser.id 
        })
        return existingUser
      }

      // Create new user in D1
      const newUser = await this.createUser({
        clerkId: clerkUser.id,
        email: clerkUser.email,
        role,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName
      })

      userLogger.info('User synced successfully from Clerk to D1', { 
        userId: newUser.id,
        clerkId: clerkUser.id 
      })

      return newUser

    } catch (error) {
      userLogger.error('Failed to sync user from Clerk', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        clerkId: clerkUser.id,
        email: clerkUser.email
      })
      throw error
    }
  }
}

// Helper function to create UserService instance
export function createUserService(env: DatabaseEnv): UserService {
  return new UserService(env.DB)
}

// Export types for external use
export type { UserCreateInput, UserUpdateInput, UserProfile }
