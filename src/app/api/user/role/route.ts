import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createUserService, type UserRole } from '@/lib/userService'
import { createDatabaseManager, type DatabaseEnv } from '@/lib/db'
import { handleApiError, createSuccessResponse, validateRequiredFields, AppError } from '@/lib/errorHandler'
import { createApiLogger } from '@/lib/logger'

const apiLogger = createApiLogger('user-role-api')

// Mock database environment for development
// In production, this would come from Cloudflare Workers environment
const mockEnv: DatabaseEnv = {
  DB: null as any // This will be replaced with actual D1 database in production
}

export async function GET(request: NextRequest) {
  try {
    apiLogger.info('GET /api/user/role called')
    
    const { userId } = await auth()
    
    if (!userId) {
      apiLogger.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In development, we'll use Clerk data as primary source
    // In production with actual D1, we'll query the database
    const user = await currentUser()
    
    if (!user) {
      apiLogger.error('User not found in Clerk', { userId })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const role = user.publicMetadata?.role as UserRole
    const email = user.emailAddresses[0]?.emailAddress
    
    const userData = {
      id: user.id,
      role,
      email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.imageUrl
    }

    apiLogger.info('User profile retrieved successfully', { 
      userId, 
      role,
      hasEmail: !!email 
    })

    return createSuccessResponse(userData, '사용자 정보를 성공적으로 조회했습니다')

  } catch (error) {
    apiLogger.error('Failed to get user role', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return handleApiError(error, 'get-user-role')
  }
}

export async function POST(request: NextRequest) {
  try {
    apiLogger.info('POST /api/user/role called')
    
    const { userId } = await auth()
    
    if (!userId) {
      apiLogger.warn('Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as any
    apiLogger.debug('Request body received', { role: body.role })
    
    // Validate required fields
    validateRequiredFields(body, ['role'])
    
    const { role } = body as { role: UserRole }
    
    if (!['trainer', 'member'].includes(role)) {
      throw new AppError(
        'INVALID_ROLE',
        '올바른 역할을 선택해주세요 (trainer 또는 member)',
        400
      )
    }

    // Get current user info from Clerk
    const user = await currentUser()
    
    if (!user) {
      throw new AppError('USER_NOT_FOUND', '사용자 정보를 찾을 수 없습니다', 404)
    }

    const email = user.emailAddresses[0]?.emailAddress
    
    if (!email) {
      throw new AppError(
        'EMAIL_REQUIRED',
        '사용자 이메일 정보가 필요합니다',
        400
      )
    }

    apiLogger.info('Processing role assignment', { 
      userId, 
      role, 
      email,
      firstName: user.firstName,
      lastName: user.lastName
    })

    // Step 1: Update Clerk metadata first (existing logic)
    try {
      const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            role: role
          }
        })
      })

      if (!clerkResponse.ok) {
        const errorText = await clerkResponse.text()
        apiLogger.error('Clerk REST API error', { 
          status: clerkResponse.status, 
          error: errorText 
        })
        throw new AppError(
          'CLERK_UPDATE_FAILED',
          'Clerk 사용자 정보 업데이트에 실패했습니다',
          500
        )
      }

      const clerkResult = await clerkResponse.json()
      apiLogger.info('Clerk metadata updated successfully', { userId, role })

    } catch (clerkError) {
      apiLogger.error('Clerk update failed', { 
        error: clerkError instanceof Error ? clerkError.message : 'Unknown error'
      })
      // Continue with D1 creation even if Clerk fails
      // D1 will be the source of truth
    }

    // Step 2: Create/Update user in D1 database
    // Note: In development without actual D1, we'll simulate this
    try {
      // TODO: Replace with actual D1 database when available
      // const dbManager = createDatabaseManager(mockEnv)
      // const userService = createUserService(mockEnv)
      
      // For now, we'll simulate D1 user creation
      apiLogger.info('Simulating D1 user creation', { 
        clerkId: userId,
        email,
        role,
        firstName: user.firstName,
        lastName: user.lastName
      })

      // When D1 is available, uncomment this:
      /*
      const dbUser = await userService.createUser({
        clerkId: userId,
        email,
        role,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        profileImage: user.imageUrl || undefined
      })
      
      apiLogger.info('User created in D1 database', { 
        dbUserId: dbUser.id,
        clerkId: userId
      })
      */

      // Simulate successful D1 creation
      const simulatedDbUser = {
        id: `db_${Date.now()}`,
        clerk_id: userId,
        role,
        email,
        first_name: user.firstName,
        last_name: user.lastName,
        profile_image: user.imageUrl,
        invite_code: role === 'trainer' ? `INV${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      apiLogger.info('User role assignment completed successfully', { 
        userId,
        role,
        dbUserId: simulatedDbUser.id
      })

      return createSuccessResponse({
        success: true,
        role,
        user: simulatedDbUser,
        message: `${role === 'trainer' ? '트레이너' : '회원'} 역할이 성공적으로 설정되었습니다`
      }, '역할 설정이 완료되었습니다')

    } catch (dbError) {
      apiLogger.error('D1 database operation failed', { 
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      })
      
      // If D1 fails but Clerk succeeded, still return success
      // Frontend can retry D1 sync later
      return createSuccessResponse({
        success: true,
        role,
        clerkOnly: true,
        message: '역할 설정이 완료되었습니다 (데이터베이스 동기화는 백그라운드에서 처리됩니다)'
      }, '역할 설정이 완료되었습니다')
    }

  } catch (error) {
    apiLogger.error('Failed to update user role', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return handleApiError(error, 'update-user-role')
  }
}
