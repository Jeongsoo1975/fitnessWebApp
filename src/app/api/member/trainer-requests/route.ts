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

    // 회원이 받은 트레이너 요청 목록 조회 - 정규화된 매칭 로직 사용
    const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
    apiLogger.info('Looking for requests for member', {
      clerkId: currentUser.id,
      email: currentUserEmail
    })
    
    // 정규화된 매칭 로직 사용
    const memberRequests = mockDataStore.getMemberRequests(currentUser.id)
    
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

    // 현재 사용자의 요청들 조회 - 정규화된 매칭 로직 사용
    const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
    apiLogger.info('Looking for user requests for PATCH operation', {
      clerkId: currentUser.id,
      email: currentUserEmail
    })
    
    // 정규화된 매칭 로직 사용
    const memberRequests = mockDataStore.getMemberRequests(currentUser.id)
    
    apiLogger.info('Found member requests for PATCH', {
      clerkId: currentUser.id,
      email: currentUserEmail,
      requestCount: memberRequests.length,
      lookingForRequestId: requestId
    })
    
    // 요청이 현재 회원에게 온 것인지 확인
    const targetRequest = memberRequests.find(req => req.id === requestId)
    
    if (!targetRequest) {
      apiLogger.warn('Request not found or not authorized', {
        requestId,
        userId: currentUser.id,
        availableRequests: memberRequests.map(r => r.id)
      })
      return NextResponse.json(
        { error: 'Request not found or not authorized to modify this request' },
        { status: 404 }
      )
    }

    // 이미 처리된 요청인지 확인
    if (targetRequest.status !== 'pending') {
      apiLogger.warn('Request already processed', {
        requestId,
        currentStatus: targetRequest.status
      })
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 409 }
      )
    }

    // 요청 상태 업데이트 (트레이너 알림 생성 포함)
    apiLogger.info('Attempting to update request status and create trainer notification', {
      requestId,
      newStatus: status
    })
    
    try {
      // mockDataStore의 updateRequestStatus는 이미 트레이너 알림 생성을 포함하고 있음
      const updatedRequest = mockDataStore.updateRequestStatus(requestId, status)
      
      if (!updatedRequest) {
        apiLogger.error('Failed to update request status - updateRequestStatus returned null')
        return NextResponse.json(
          { error: 'Failed to update request status' },
          { status: 500 }
        )
      }
      
      apiLogger.info('Request status updated successfully', {
        requestId,
        newStatus: status,
        trainerId: updatedRequest.trainerId,
        updatedAt: updatedRequest.updatedAt
      })

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
      apiLogger.error('Error during request status update', {
        error: updateError instanceof Error ? updateError.message : 'Unknown error',
        requestId,
        status
      })
      
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
    apiLogger.error('Error updating trainer request', {
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
      { error: 'Failed to update trainer request' },
      { status: 500 }
    )
  }
}
