import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createUserService, type UserRole, type UserUpdateInput } from '@/lib/userService'
import { createDatabaseManager, type DatabaseEnv } from '@/lib/db'
import { handleApiError, createSuccessResponse, validateRequiredFields, AppError, validateEmail } from '@/lib/errorHandler'
import { createApiLogger } from '@/lib/logger'
import type { TrainerProfile, MemberProfile } from '@/types/user'

const apiLogger = createApiLogger('user-profile-api')

// Mock database environment for development
const mockEnv: DatabaseEnv = {
  DB: null as any // This will be replaced with actual D1 database in production
}

export async function GET(request: NextRequest) {
  try {
    apiLogger.info('GET /api/user/profile called')
    
    const { userId } = await auth()
    
    if (!userId) {
      apiLogger.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In development, use Clerk as primary source
    // In production, query D1 database first
    const user = await currentUser()
    
    if (!user) {
      apiLogger.error('User not found in Clerk', { userId })
      throw new AppError('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    const role = user.publicMetadata?.role as UserRole
    const email = user.emailAddresses[0]?.emailAddress

    if (!role) {
      apiLogger.warn('User has no role assigned', { userId })
      throw new AppError('ROLE_NOT_ASSIGNED', '사용자 역할이 설정되지 않았습니다', 400)
    }

    // Simulate D1 query result for development
    const mockDbUser = {
      id: `db_${Date.now()}`,
      clerk_id: userId,
      role,
      email: email || '',
      first_name: user.firstName,
      last_name: user.lastName,
      profile_image: user.imageUrl,
      specialties: null,
      experience: null,
      certification: null,
      goals: null,
      fitness_level: null,
      medical_conditions: null,
      invite_code: role === 'trainer' ? `INV${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Calculate profile completeness
    const { completeness, missingFields } = calculateProfileCompleteness(mockDbUser)

    const profileData = {
      ...mockDbUser,
      profileCompleteness: completeness,
      missingFields
    }

    apiLogger.info('User profile retrieved successfully', { 
      userId, 
      role,
      completeness,
      missingFieldsCount: missingFields.length
    })

    return createSuccessResponse(profileData, '프로필 정보를 성공적으로 조회했습니다')

  } catch (error) {
    apiLogger.error('Failed to get user profile', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return handleApiError(error, 'get-user-profile')
  }
}

export async function PUT(request: NextRequest) {
  try {
    apiLogger.info('PUT /api/user/profile called')
    
    const { userId } = await auth()
    
    if (!userId) {
      apiLogger.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    apiLogger.debug('Profile update request received', { 
      fields: Object.keys(body),
      userId
    })

    // Get current user to check role
    const user = await currentUser()
    
    if (!user) {
      throw new AppError('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    const role = user.publicMetadata?.role as UserRole

    if (!role) {
      throw new AppError('ROLE_NOT_ASSIGNED', '사용자 역할이 설정되지 않았습니다', 400)
    }

    // Validate and prepare update input
    const updateInput: UserUpdateInput = {}

    // Basic profile fields
    if (body.firstName !== undefined) {
      updateInput.firstName = body.firstName
    }

    if (body.lastName !== undefined) {
      updateInput.lastName = body.lastName
    }

    if (body.profileImage !== undefined) {
      updateInput.profileImage = body.profileImage
    }

    // Role-specific validation and assignment
    if (role === 'trainer') {
      // Trainer-specific fields
      if (body.specialties !== undefined) {
        if (!Array.isArray(body.specialties)) {
          throw new AppError(
            'INVALID_SPECIALTIES',
            '전문분야는 배열 형태로 입력해주세요',
            400
          )
        }
        
        if (body.specialties.length === 0) {
          throw new AppError(
            'SPECIALTIES_REQUIRED',
            '트레이너는 최소 1개의 전문분야를 입력해야 합니다',
            400
          )
        }

        updateInput.specialties = body.specialties
      }

      if (body.experience !== undefined) {
        const experience = parseInt(body.experience)
        
        if (isNaN(experience) || experience < 0) {
          throw new AppError(
            'INVALID_EXPERIENCE',
            '경력은 0 이상의 숫자로 입력해주세요',
            400
          )
        }

        updateInput.experience = experience
      }

      if (body.certification !== undefined) {
        if (!Array.isArray(body.certification)) {
          throw new AppError(
            'INVALID_CERTIFICATION',
            '자격증은 배열 형태로 입력해주세요',
            400
          )
        }

        updateInput.certification = body.certification
      }

    } else if (role === 'member') {
      // Member-specific fields
      if (body.goals !== undefined) {
        if (!Array.isArray(body.goals)) {
          throw new AppError(
            'INVALID_GOALS',
            '목표는 배열 형태로 입력해주세요',
            400
          )
        }

        updateInput.goals = body.goals
      }

      if (body.fitnessLevel !== undefined) {
        const validLevels = ['beginner', 'intermediate', 'advanced']
        
        if (!validLevels.includes(body.fitnessLevel)) {
          throw new AppError(
            'INVALID_FITNESS_LEVEL',
            '올바른 운동 수준을 선택해주세요 (beginner, intermediate, advanced)',
            400
          )
        }

        updateInput.fitnessLevel = body.fitnessLevel
      }

      if (body.medicalConditions !== undefined) {
        if (!Array.isArray(body.medicalConditions)) {
          throw new AppError(
            'INVALID_MEDICAL_CONDITIONS',
            '건강 상태는 배열 형태로 입력해주세요',
            400
          )
        }

        updateInput.medicalConditions = body.medicalConditions
      }
    }

    // Check if there are fields to update
    if (Object.keys(updateInput).length === 0) {
      throw new AppError(
        'NO_UPDATE_FIELDS',
        '업데이트할 정보가 없습니다',
        400
      )
    }

    apiLogger.info('Processing profile update', { 
      userId,
      role,
      updateFields: Object.keys(updateInput)
    })

    // TODO: Replace with actual D1 database update when available
    // const userService = createUserService(mockEnv)
    // const updatedUser = await userService.updateUserProfile(dbUserId, updateInput)

    // Simulate successful update
    const simulatedUpdatedUser = {
      id: `db_${Date.now()}`,
      clerk_id: userId,
      role,
      email: user.emailAddresses[0]?.emailAddress || '',
      first_name: updateInput.firstName || user.firstName,
      last_name: updateInput.lastName || user.lastName,
      profile_image: updateInput.profileImage || user.imageUrl,
      specialties: updateInput.specialties ? JSON.stringify(updateInput.specialties) : null,
      experience: updateInput.experience || null,
      certification: updateInput.certification ? JSON.stringify(updateInput.certification) : null,
      goals: updateInput.goals ? JSON.stringify(updateInput.goals) : null,
      fitness_level: updateInput.fitnessLevel || null,
      medical_conditions: updateInput.medicalConditions ? JSON.stringify(updateInput.medicalConditions) : null,
      invite_code: role === 'trainer' ? `INV${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Calculate updated profile completeness
    const { completeness, missingFields } = calculateProfileCompleteness(simulatedUpdatedUser)

    const updatedProfileData = {
      ...simulatedUpdatedUser,
      profileCompleteness: completeness,
      missingFields
    }

    apiLogger.info('Profile updated successfully', { 
      userId,
      role,
      newCompleteness: completeness,
      updatedFields: Object.keys(updateInput)
    })

    return createSuccessResponse(updatedProfileData, '프로필이 성공적으로 업데이트되었습니다')

  } catch (error) {
    apiLogger.error('Failed to update user profile', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return handleApiError(error, 'update-user-profile')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    apiLogger.info('DELETE /api/user/profile called')
    
    const { userId } = await auth()
    
    if (!userId) {
      apiLogger.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user info
    const user = await currentUser()
    
    if (!user) {
      throw new AppError('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    apiLogger.warn('User account deletion requested', { 
      userId,
      email: user.emailAddresses[0]?.emailAddress
    })

    // TODO: Replace with actual D1 database deletion when available
    // const userService = createUserService(mockEnv)
    // await userService.deleteUser(dbUserId)

    // Simulate successful deletion
    apiLogger.info('User account deleted successfully (simulated)', { userId })

    return createSuccessResponse(
      { deleted: true, userId },
      '계정이 성공적으로 삭제되었습니다'
    )

  } catch (error) {
    apiLogger.error('Failed to delete user account', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return handleApiError(error, 'delete-user-account')
  }
}

export async function POST(request: NextRequest) {
  try {
    apiLogger.info('POST /api/user/profile called (completeness check)')
    
    const { userId } = await auth()
    
    if (!userId) {
      apiLogger.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user info
    const user = await currentUser()
    
    if (!user) {
      throw new AppError('USER_NOT_FOUND', '사용자를 찾을 수 없습니다', 404)
    }

    const role = user.publicMetadata?.role as UserRole

    if (!role) {
      throw new AppError('ROLE_NOT_ASSIGNED', '사용자 역할이 설정되지 않았습니다', 400)
    }

    // Simulate current user data from D1
    const mockDbUser = {
      id: `db_${Date.now()}`,
      clerk_id: userId,
      role,
      email: user.emailAddresses[0]?.emailAddress || '',
      first_name: user.firstName,
      last_name: user.lastName,
      profile_image: user.imageUrl,
      specialties: null,
      experience: null,
      certification: null,
      goals: null,
      fitness_level: null,
      medical_conditions: null,
      invite_code: role === 'trainer' ? `INV${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Calculate profile completeness
    const { completeness, missingFields } = calculateProfileCompleteness(mockDbUser)

    // Determine completion status
    const isComplete = completeness >= 80 // 80% or higher is considered complete
    const requiresOnboarding = completeness < 50 // Less than 50% requires onboarding

    const completenessData = {
      completeness,
      missingFields,
      isComplete,
      requiresOnboarding,
      role,
      recommendations: generateCompletionRecommendations(role, missingFields)
    }

    apiLogger.info('Profile completeness checked', { 
      userId,
      role,
      completeness,
      isComplete,
      requiresOnboarding,
      missingFieldsCount: missingFields.length
    })

    return createSuccessResponse(completenessData, '프로필 완성도 확인이 완료되었습니다')

  } catch (error) {
    apiLogger.error('Failed to check profile completeness', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return handleApiError(error, 'check-profile-completeness')
  }
}

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user: any): { 
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

// Helper function to generate completion recommendations
function generateCompletionRecommendations(role: UserRole, missingFields: string[]): string[] {
  const recommendations: string[] = []

  if (missingFields.includes('이름')) {
    recommendations.push('개인정보에서 이름을 입력해주세요')
  }

  if (missingFields.includes('성')) {
    recommendations.push('개인정보에서 성을 입력해주세요')
  }

  if (role === 'trainer') {
    if (missingFields.includes('전문분야')) {
      recommendations.push('트레이너 전문분야를 최소 1개 이상 선택해주세요')
    }
    
    if (missingFields.includes('경력')) {
      recommendations.push('트레이너 경력을 입력해주세요 (연 단위)')
    }
  }

  if (role === 'member') {
    if (missingFields.includes('운동 목표')) {
      recommendations.push('운동 목표를 설정해주세요')
    }
    
    if (missingFields.includes('운동 수준')) {
      recommendations.push('현재 운동 수준을 선택해주세요')
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('프로필이 완성되었습니다!')
  }

  return recommendations
}
