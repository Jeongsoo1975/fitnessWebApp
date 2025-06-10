import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// Clerk Client 대신 간단한 방식 사용

// GET /api/member/trainer-requests - 받은 트레이너 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 회원 권한 체크
    await requireRole('member')
    
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 회원이 받은 트레이너 요청 목록 조회
    // Clerk ID, 이메일 둘 다로 검색
    const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
    console.log('Looking for requests for:')
    console.log('- Member ID:', currentUser.id)
    console.log('- Member email:', currentUserEmail)
    
    // 먼저 모든 요청을 확인해보자
    const allRequests = mockDataStore.getAllRequests()
    console.log('All requests in system:', allRequests)
    
    // Clerk ID로 검색
    let memberRequests = mockDataStore.getMemberRequests(currentUser.id)
    
    // 이메일로도 검색
    if (memberRequests.length === 0 && currentUserEmail) {
      memberRequests = mockDataStore.getMemberRequestsByEmail(currentUserEmail)
    }
    
    console.log('Found requests for current user:', memberRequests)
    
    // 트레이너 정보와 함께 반환하기 위해 요청 데이터 가공
    const requestsWithTrainerInfo = memberRequests.map(request => {
      // 간단한 트레이너 정보 처리
      const trainerInfo = {
        id: request.trainerId,
        name: `트레이너`,
        email: `trainer@example.com`
      }
      
      return {
        id: request.id,
        trainer: trainerInfo,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      }
    })

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Member requests retrieved:')
      console.log('- Member ID:', currentUser.id)
      console.log('- Total requests:', requestsWithTrainerInfo.length)
      console.log('- Pending requests:', requestsWithTrainerInfo.filter(r => r.status === 'pending').length)
    }

    return NextResponse.json({
      success: true,
      requests: requestsWithTrainerInfo,
      count: requestsWithTrainerInfo.length
    })

  } catch (error) {
    console.error('Error retrieving trainer requests:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve trainer requests' },
      { status: 500 }
    )
  }
}

// PATCH /api/member/trainer-requests - 트레이너 요청 승인/거절
export async function PATCH(request: NextRequest) {
  console.log('PATCH /api/member/trainer-requests - Request received')
  
  try {
    // 회원 권한 체크
    await requireRole('member')
    
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
    console.log('Request body:', body)
    const { requestId, status } = body

    // 입력값 검증
    if (!requestId) {
      console.log('Request ID is missing')
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      console.log('Invalid status:', status)
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // 현재 사용자의 요청들 조회
    const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
    console.log('Looking for user requests:')
    console.log('- User ID:', currentUser.id)
    console.log('- User email:', currentUserEmail)
    
    // 먼저 모든 요청 확인
    const allRequests = mockDataStore.getAllRequests()
    console.log('All requests:', allRequests)
    
    let memberRequests = mockDataStore.getMemberRequests(currentUser.id)
    if (memberRequests.length === 0 && currentUserEmail) {
      memberRequests = mockDataStore.getMemberRequestsByEmail(currentUserEmail)
    }
    
    console.log('User requests:', memberRequests)
    console.log('Looking for request ID:', requestId)
    
    // 요청이 현재 회원에게 온 것인지 확인
    const targetRequest = memberRequests.find(req => req.id === requestId)
    console.log('Found target request:', targetRequest)
    
    if (!targetRequest) {
      console.log('Request not found or not authorized')
      return NextResponse.json(
        { error: 'Request not found or not authorized to modify this request' },
        { status: 404 }
      )
    }

    // 이미 처리된 요청인지 확인
    if (targetRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 409 }
      )
    }

    // 요청 상태 업데이트
    const updatedRequest = mockDataStore.updateRequestStatus(requestId, status)
    
    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Failed to update request status' },
        { status: 500 }
      )
    }

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Request status updated:')
      console.log('- Request ID:', requestId)
      console.log('- New status:', status)
      console.log('- Member ID:', currentUser.id)
      console.log('- Trainer ID:', updatedRequest.trainerId)
    }

    return NextResponse.json({
      success: true,
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        updatedAt: updatedRequest.updatedAt
      },
      message: status === 'approved' 
        ? 'Trainer request approved successfully' 
        : 'Trainer request rejected successfully'
    })

  } catch (error) {
    console.error('Error updating trainer request:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update trainer request' },
      { status: 500 }
    )
  }
}
