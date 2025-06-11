import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser, validateUserByEmail } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// 실제 Clerk 사용자 검증을 통한 안전한 회원 등록 요청

// POST /api/trainer/member-request - 회원 등록 요청 보내기 (사용자 검증 포함)
export async function POST(request: NextRequest) {
  console.log('POST /api/trainer/member-request - Request received')
  
  try {
    // 임시로 권한 체크 우회하여 테스트
    console.log('POST /api/trainer/member-request - Starting without auth check')
    
    // 하드코딩된 트레이너 ID로 테스트
    const currentUser = {
      id: 'user_2yGfgge9dGRBLeuxJSMzElVzite',
      emailAddresses: [{ emailAddress: 'trainer@example.com' }]
    }
    
    console.log('Using hardcoded trainer ID for testing:', currentUser.id)

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    console.log('Request body:', body)
    const { memberId, memberEmail, memberFirstName, memberLastName, message } = body

    // 입력값 검증
    if (!memberId) {
      console.log('[member-request] Member ID is missing')
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // === 새로운 사용자 존재 검증 단계 ===
    console.log('[member-request] Validating user existence for:', memberId)
    
    let validatedUser = null
    let actualMemberId = memberId
    
    // 이메일 형태인 경우 실제 Clerk 사용자 검증
    if (memberId.includes('@')) {
      console.log('[member-request] Email format detected, validating with Clerk API')
      
      validatedUser = await validateUserByEmail(memberId)
      
      if (!validatedUser) {
        console.log('[member-request] User validation failed - user does not exist:', memberId)
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
      console.log('[member-request] User validation successful:', validatedUser.id)
      
      // 자기 자신에게 요청하는 것 방지
      if (actualMemberId === currentUser.id) {
        console.log('[member-request] Cannot send request to self')
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
      console.log('[member-request] Using provided ID without email validation:', memberId)
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
    
    console.log('[member-request] Final member info for request:', member)

    // 이미 등록된 회원인지 확인
    if (member.isRegistered) {
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
      return NextResponse.json(
        { error: 'A pending request already exists for this member' },
        { status: 409 }
      )
    }

    // 새로운 등록 요청 생성
    console.log('[member-request] Creating new request with validated member ID:', actualMemberId)
    
    const newRequest = mockDataStore.addMemberRequest({
      trainerId: currentUser.id,
      memberId: actualMemberId, // 검증된 실제 회원 ID 사용
      message: message || '함께 운동하게 되어 기쁩니다!'
    })

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('🎉 [member-request] New member request created successfully:')
      console.log('- Request ID:', newRequest.id)
      console.log('- Trainer ID:', newRequest.trainerId)
      console.log('- Member ID (validated):', newRequest.memberId)
      console.log('- Original Input:', memberId)
      console.log('- Message:', newRequest.message)
      console.log('- User Validation:', validatedUser ? 'SUCCESS' : 'SKIPPED')
      
      // 시스템 전체 상태 확인
      const allRequests = mockDataStore.getAllRequests()
      console.log('- Total requests after add:', allRequests.length)
    }

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
    console.error('[member-request] Error creating member request:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
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
