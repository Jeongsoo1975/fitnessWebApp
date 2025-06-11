import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// GET /api/trainer/notifications - 트레이너의 알림 목록 조회
export async function GET(request: NextRequest) {
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

    console.log('[trainer-notifications] GET - Looking for notifications for trainer:', currentUser.id)
    
    // 트레이너의 알림 목록 조회
    const notifications = mockDataStore.getTrainerNotifications(currentUser.id)
    
    // 읽지 않은 알림 개수
    const unreadCount = mockDataStore.getUnreadTrainerNotificationsCount(currentUser.id)

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('[trainer-notifications] GET - Notifications retrieved successfully:')
      console.log('- Trainer Clerk ID:', currentUser.id)
      console.log('- Total notifications found:', notifications.length)
      console.log('- Unread notifications:', unreadCount)
      console.log('- Notification details:', notifications.map(n => ({ 
        id: n.id, 
        type: n.type, 
        isRead: n.isRead, 
        memberName: n.memberName 
      })))
    }

    return NextResponse.json({
      success: true,
      notifications: notifications,
      count: notifications.length,
      unreadCount: unreadCount
    })

  } catch (error) {
    console.error('Error retrieving trainer notifications:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve trainer notifications' },
      { status: 500 }
    )
  }
}

// PATCH /api/trainer/notifications - 알림 읽음 처리
export async function PATCH(request: NextRequest) {
  console.log('PATCH /api/trainer/notifications - Request received')
  
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
    console.log('Request body:', body)
    const { notificationId, markAllAsRead } = body

    // 모든 알림을 읽음 처리하는 경우
    if (markAllAsRead === true) {
      const updatedCount = mockDataStore.markAllTrainerNotificationsAsRead(currentUser.id)
      
      console.log('[trainer-notifications] PATCH - Marked all notifications as read:', updatedCount)
      
      return NextResponse.json({
        success: true,
        message: `${updatedCount}개의 알림이 읽음 처리되었습니다.`,
        updatedCount: updatedCount
      })
    }

    // 특정 알림을 읽음 처리하는 경우
    if (!notificationId) {
      console.log('Notification ID is missing')
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // 알림이 현재 트레이너에게 속한 것인지 확인
    const trainerNotifications = mockDataStore.getTrainerNotifications(currentUser.id)
    const targetNotification = trainerNotifications.find(n => n.id === notificationId)
    
    if (!targetNotification) {
      console.log('Notification not found or not authorized')
      return NextResponse.json(
        { error: 'Notification not found or not authorized to modify this notification' },
        { status: 404 }
      )
    }

    // 이미 읽음 처리된 알림인지 확인
    if (targetNotification.isRead) {
      return NextResponse.json(
        { error: 'Notification has already been marked as read' },
        { status: 409 }
      )
    }

    // 알림 읽음 처리
    const updatedNotification = mockDataStore.markTrainerNotificationAsRead(notificationId)
    
    if (!updatedNotification) {
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      )
    }

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('[trainer-notifications] PATCH - Notification marked as read successfully:')
      console.log('- Notification ID:', notificationId)
      console.log('- Trainer Clerk ID:', currentUser.id)
      console.log('- Notification type:', updatedNotification.type)
      console.log('- Updated at:', updatedNotification.updatedAt)
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: updatedNotification.id,
        isRead: updatedNotification.isRead,
        updatedAt: updatedNotification.updatedAt
      },
      message: 'Notification marked as read successfully'
    })

  } catch (error) {
    console.error('Error updating trainer notification:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update trainer notification' },
      { status: 500 }
    )
  }
}
