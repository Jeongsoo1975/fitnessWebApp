import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser, validateUserByEmail } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'
import { createApiLogger } from '@/lib/logger'

// 실제 Clerk 사용자 검증을 통한 안전한 회원 등록 요청

// API별 로거 생성
const apiLogger = createApiLogger('trainer-member-request')

// POST /api/trainer/member-request - 회원 등록 요청 보내기 (사용자 검증 포함)
export async function POST(request: NextRequest) {
  apiLogger.info('POST /api/trainer/member-request - Request received')
  
  try {
    // 트레이너 권한 체크
    await requireRole('trainer')
    apiLogger.info('Trainer role authentication successful')
    
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      apiLogger.error('Authentication failed - no current user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    apiLogger.info('Current user authenticated', { 
      trainerId: currentUser.id,
      role: currentUser.role
    })

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    apiLogger.debug('Request body received', { 
      memberId: body.memberId,
      memberEmail: body.memberEmail,
      hasMessage: !!body.message
    })
    const { memberId, memberEmail, memberFirstName, memberLastName, message } = body

    // 입력값 검증
    if (!memberId) {
      apiLogger.error('Member ID is missing in request')
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // === 새로운 사용자 존재 검증 단계 ===
    apiLogger.info('Validating user existence', { memberId })
    
    let validatedUser = null
    let actualMemberId = memberId
    
    // 이메일 형태인 경우 실제 Clerk 사용자 검증
    if (memberId.includes('@')) {
      apiLogger.debug('Email format detected, validating with Clerk API')
      
      validatedUser = await validateUserByEmail(memberId)
      
      if (!validatedUser) {
        apiLogger.error('User validation failed - user does not exist', { memberId })
        return NextResponse.json(
          { 
            error: 'User not found',
            message: '해당 이메일로 등록된 사용자를 찾을 수 없습니다. 올바른 이메일 주소인지 확인해주세요.' 
          },
          { status: 404 }
        )
      }
      
      // 검증된 사용자 정보 사용
      actualMemberId = validatedUser.id // 실제 Clerk 사용자 ID 사용
      apiLogger.info('User validation successful', { 
        originalInput: memberId,
        validatedId: validatedUser.id 
      })
      
      // 자기 자신에게 요청하는 것 방지
      if (actualMemberId === currentUser.id) {
        apiLogger.warn('Attempt to send request to self', { userId: actualMemberId })
        return NextResponse.json(
          { 
            error: 'Invalid request',
            message: '자기 자신에게는 등록 요청을 보낼 수 없습니다.' 
          },
          { status: 400 }
        )
      }
      
    } else {
      // 기존 ID 형태인 경우 (mockData 호환성)
      apiLogger.debug('Using provided ID without email validation', { memberId })
    }

    // 회원 정보 구성 (검증된 정보 또는 전달받은 정보 사용)
    const member = validatedUser ? {
      id: validatedUser.id,
      firstName: validatedUser.firstName || '사용자',
      lastName: validatedUser.lastName || '',
      email: validatedUser.email,
      isRegistered: false
    } : {
      id: memberId,
      firstName: memberFirstName || '사용자',
      lastName: memberLastName || '',
      email: memberEmail || '',
      isRegistered: false
    }
    
    apiLogger.debug('Final member info for request', { member })

    // 이미 등록된 회원인지 확인
    if (member.isRegistered) {
      apiLogger.warn('Member is already registered with a trainer', { memberId: member.id })
      return NextResponse.json(
        { error: 'Member is already registered with a trainer' },
        { status: 409 }
      )
    }

    // 중복 요청 체크 (동일 트레이너가 동일 회원에게 pending 상태의 요청이 있는지)
    const existingRequests = mockDataStore.getMemberRequests(memberId)
    const duplicateRequest = existingRequests.find(
      req => req.trainerId === currentUser.id && req.status === 'pending'
    )
    
    if (duplicateRequest) {
      apiLogger.warn('Duplicate pending request detected', { 
        memberId,
        trainerId: currentUser.id,
        existingRequestId: duplicateRequest.id
      })
      return NextResponse.json(
        { error: 'A pending request already exists for this member' },
        { status: 409 }
      )
    }

    // 새로운 등록 요청 생성
    apiLogger.info('Creating new request with validated member ID', { actualMemberId })
    
    const newRequest = mockDataStore.addMemberRequest({
      trainerId: currentUser.id,
      memberId: actualMemberId, // 검증된 실제 회원 ID 사용
      message: message || '함께 운동하게 되어 기쁩니다!'
    })

    // 성공 로깅
    apiLogger.info('New member request created successfully', {
      requestId: newRequest.id,
      trainerId: newRequest.trainerId,
      memberId: newRequest.memberId,
      originalInput: memberId,
      userValidation: validatedUser ? 'SUCCESS' : 'SKIPPED'
    })

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      message: 'Member request sent successfully',
      memberInfo: {
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email
      }
    })

  } catch (error) {
    apiLogger.error('Error creating member request', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // 인증 관련 오류 처리
    if (error instanceof Error) {
      if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
        apiLogger.warn('Unauthorized access attempt', { error: error.message })
        return NextResponse.json(
          { 
            error: 'Unauthorized access',
            message: '트레이너 권한이 필요합니다. 다시 로그인해주세요.'
          },
          { status: 403 }
        )
      }
      
      if (error.message.includes('role') || error.message.includes('Role')) {
        apiLogger.warn('Role verification failed', { error: error.message })
        return NextResponse.json(
          { 
            error: 'Access denied',
            message: '트레이너 계정으로만 접근 가능합니다.'
          },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to send member request',
        message: '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    )
  }
}
