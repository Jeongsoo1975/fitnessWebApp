import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'
import { createApiLogger } from '@/lib/logger'

// Clerk Client 대신 간단한 방식 사용

// API별 로거 생성
const apiLogger = createApiLogger('member-trainer-requests')

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
    // 우선순위: 1) Clerk ID, 2) 이메일
    const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
    console.log('[member-requests] Looking for requests for:')
    console.log('- Member Clerk ID:', currentUser.id)
    console.log('- Member email:', currentUserEmail)
    
    // 먼저 모든 요청을 확인 (디버깅용)
    const allRequests = mockDataStore.getAllRequests()
    console.log('[member-requests] All requests in system:', allRequests.length)
    console.log('[member-requests] All requests details:')
    allRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ID: ${req.id}, TrainerID: ${req.trainerId}, MemberID: ${req.memberId}, Status: ${req.status}, Created: ${req.createdAt}`)
    })
    
    // 1. 먼저 Clerk ID로 검색 (최우선)
    let memberRequests = mockDataStore.getMemberRequests(currentUser.id)
    apiLogger.debug('Found by Clerk ID', { count: memberRequests.length })
    
    // 2. Clerk ID로 찾지 못한 경우 이메일로 검색
    if (memberRequests.length === 0 && currentUserEmail) {
      apiLogger.debug('Trying email search as fallback')
      memberRequests = mockDataStore.getMemberRequestsByEmail(currentUserEmail)
      apiLogger.debug('Found by email', { count: memberRequests.length })
    }
    
    // 3. 여전히 찾지 못한 경우 모든 요청에서 이메일 매칭 시도
    if (memberRequests.length === 0 && currentUserEmail) {
      apiLogger.debug('Trying comprehensive email matching')
      memberRequests = allRequests.filter(request => {
        // memberId가 현재 사용자의 이메일과 매치되는지 확인
        return request.memberId === currentUserEmail || 
               request.memberId === currentUser.id ||
               (request.memberId.includes('@') && currentUserEmail.includes('@') && 
                request.memberId.split('@')[0] === currentUserEmail.split('@')[0])
      })
      apiLogger.debug('Found by comprehensive matching', { count: memberRequests.length })
    }
    
    apiLogger.info('Final found requests', { 
      totalFound: memberRequests.length,
      requests: memberRequests.map(req => ({ id: req.id, status: req.status }))
    })
    
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

    // 성공 로깅
    apiLogger.info('Member requests retrieved successfully', {
      clerkId: currentUser.id,
      email: currentUserEmail,
      totalRequests: requestsWithTrainerInfo.length,
      pendingRequests: requestsWithTrainerInfo.filter(r => r.status === 'pending').length,
      approvedRequests: requestsWithTrainerInfo.filter(r => r.status === 'approved').length
    })

    return NextResponse.json({
      success: true,
      requests: requestsWithTrainerInfo,
      count: requestsWithTrainerInfo.length
    })

  } catch (error) {
    apiLogger.error('Error retrieving trainer requests', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
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
  apiLogger.info('PATCH /api/member/trainer-requests - Request received')
  
  try {
    // 회원 권한 체크
    await requireRole('member')
    
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      apiLogger.error('Unauthorized - no current user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 요청 본문에서 데이터 추출
    const body = await request.json()
    apiLogger.debug('Request body received', { 
      requestId: body.requestId, 
      status: body.status 
    })
    const { requestId, status } = body

    // 입력값 검증
    if (!requestId) {
      apiLogger.error('Request ID is missing')
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      apiLogger.error('Invalid status provided', { status })
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      )
    }

    // 현재 사용자의 요청들 조회 (GET과 동일한 로직)
    const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
    console.log('[member-requests-patch] Looking for user requests:')
    console.log('- User Clerk ID:', currentUser.id)
    console.log('- User email:', currentUserEmail)
    
    // 모든 요청 확인
    const allRequests = mockDataStore.getAllRequests()
    console.log('[member-requests-patch] Total requests in system:', allRequests.length)
    
    // 동일한 검색 로직 적용
    let memberRequests = mockDataStore.getMemberRequests(currentUser.id)
    console.log('[member-requests-patch] Found by Clerk ID:', memberRequests.length)
    
    if (memberRequests.length === 0 && currentUserEmail) {
      console.log('[member-requests-patch] Trying email search as fallback')
      memberRequests = mockDataStore.getMemberRequestsByEmail(currentUserEmail)
      console.log('[member-requests-patch] Found by email:', memberRequests.length)
    }
    
    if (memberRequests.length === 0 && currentUserEmail) {
      console.log('[member-requests-patch] Trying comprehensive email matching')
      memberRequests = allRequests.filter(request => {
        return request.memberId === currentUserEmail || 
               request.memberId === currentUser.id ||
               (request.memberId.includes('@') && currentUserEmail.includes('@') && 
                request.memberId.split('@')[0] === currentUserEmail.split('@')[0])
      })
      console.log('[member-requests-patch] Found by comprehensive matching:', memberRequests.length)
    }
    
    console.log('[member-requests-patch] Final user requests:', memberRequests)
    console.log('[member-requests-patch] Looking for request ID:', requestId)
    
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

    // 요청 상태 업데이트 (트레이너 알림 생성 포함)
    console.log('[member-requests-patch] Attempting to update request status and create trainer notification')
    
    try {
      // mockDataStore의 updateRequestStatus는 이미 트레이너 알림 생성을 포함하고 있음
      const updatedRequest = mockDataStore.updateRequestStatus(requestId, status)
      
      if (!updatedRequest) {
        console.error('[member-requests-patch] Failed to update request status - updateRequestStatus returned null')
        return NextResponse.json(
          { error: 'Failed to update request status' },
          { status: 500 }
        )
      }
      
      console.log('[member-requests-patch] Request status updated successfully')
      console.log('[member-requests-patch] Trainer notification should have been created automatically')
      
      // 개발 환경 로깅
      if (process.env.NODE_ENV === 'development') {
        console.log('[member-requests-patch] Request status updated successfully:')
        console.log('- Request ID:', requestId)
        console.log('- New status:', status)
        console.log('- Member Clerk ID:', currentUser.id)
        console.log('- Member email:', currentUserEmail)
        console.log('- Trainer ID:', updatedRequest.trainerId)
        console.log('- Updated at:', updatedRequest.updatedAt)
        
        // 트레이너 알림이 생성되었는지 확인
        if (status === 'approved') {
          console.log('[member-requests-patch] Checking if trainer notification was created...')
          const trainerNotifications = mockDataStore.getTrainerNotifications(updatedRequest.trainerId)
          const recentNotifications = trainerNotifications.filter(n => 
            new Date(n.createdAt).getTime() > new Date(updatedRequest.updatedAt).getTime() - 5000 // 5초 내
          )
          console.log('[member-requests-patch] Recent trainer notifications:', recentNotifications.length)
        }
      }

      return NextResponse.json({
        success: true,
        request: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          updatedAt: updatedRequest.updatedAt
        },
        message: status === 'approved' 
          ? 'Trainer request approved successfully and trainer has been notified' 
          : 'Trainer request rejected successfully'
      })
      
    } catch (updateError) {
      console.error('[member-requests-patch] Error during request status update:', updateError)
      
      // 트랜잭션 실패 시 상세 에러 정보 제공
      return NextResponse.json(
        { 
          error: 'Failed to update request status', 
          details: updateError instanceof Error ? updateError.message : 'Unknown error during update'
        },
        { status: 500 }
      )
    }

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
