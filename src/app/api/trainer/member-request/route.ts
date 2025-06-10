import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// Clerk Client 대신 간단한 방식 사용

// POST /api/trainer/member-request - 회원 등록 요청 보내기
export async function POST(request: NextRequest) {
  console.log('POST /api/trainer/member-request - Request received')
  
  try {
    // 트레이너 권한 체크
    await requireRole('trainer')
    console.log('Role check passed: trainer')
    
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    console.log('Current user:', currentUser?.id)
    
    if (!currentUser) {
      console.log('No current user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    console.log('Request body:', body)
    const { memberId, memberEmail, memberFirstName, memberLastName, message } = body

    // 입력값 검증
    if (!memberId) {
      console.log('Member ID is missing')
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // 회원 존재 여부 확인 (전달받은 정보 활용)
    console.log('Processing request for member ID:', memberId)
    
    const member = {
      id: memberId,
      firstName: memberFirstName || '사용자',
      lastName: memberLastName || '',
      email: memberEmail || '',
      isRegistered: false
    }
    
    console.log('Member info for request:', member)

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
    // memberId가 이메일인 경우, 실제 사용자를 찾아서 Clerk ID를 사용해야 함
    let actualMemberId = memberId
    
    // memberId가 이메일 형태라면, 이를 그대로 사용하거나 다른 방식으로 처리
    if (memberId.includes('@')) {
      console.log('MemberId is email format, using as is for now:', memberId)
      actualMemberId = memberId // 이메일을 ID로 사용
    }
    
    const newRequest = mockDataStore.addMemberRequest({
      trainerId: currentUser.id,
      memberId: actualMemberId, // 실제 회원 ID 또는 이메일
      message: message || '함께 운동하게 되어 기쁩니다!'
    })

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('New member request created:')
      console.log('- Request ID:', newRequest.id)
      console.log('- Trainer ID:', newRequest.trainerId)
      console.log('- Member ID:', newRequest.memberId)
      console.log('- Message:', newRequest.message)
      console.log('- All requests after creation:', mockDataStore.getAllRequests())
    }

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      message: 'Member request sent successfully'
    })

  } catch (error) {
    console.error('Error creating member request:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send member request' },
      { status: 500 }
    )
  }
}
