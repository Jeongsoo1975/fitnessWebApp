import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

export const runtime = 'edge'

// POST /api/trainer/member-request - 회원 등록 요청 보내기
export async function POST(request: NextRequest) {
  try {
    // 트레이너 권한 체크
    await requireRole('trainer')
    
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    const { memberId, message } = body

    // 입력값 검증
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      )
    }

    // 회원 존재 여부 확인
    const member = mockDataStore.getMemberById(memberId)
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

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
    const newRequest = mockDataStore.addMemberRequest({
      trainerId: currentUser.id,
      memberId,
      message: message || '함께 운동하게 되어 기쁩니다!'
    })

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('New member request created:')
      console.log('- Request ID:', newRequest.id)
      console.log('- Trainer ID:', newRequest.trainerId)
      console.log('- Member ID:', newRequest.memberId)
      console.log('- Message:', newRequest.message)
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
