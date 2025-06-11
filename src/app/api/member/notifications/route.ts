import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// GET /api/member/notifications - 회원의 알림 목록 조회
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

    console.log('[member-notifications] GET - Looking for notifications for member:', currentUser.id)
    
    // 회원의 알림 목록 조회
    const notifications = mockDataStore.getMemberNotifications(currentUser.id)
    
    // 읽지 않은 알림 개수
    const unreadCount = mockDataStore.getUnreadMemberNotificationsCount(currentUser.id)

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('[member-notifications] PATCH - Notification marked as read successfully:')
      console.log('- Notification ID:', notificationId)
      console.log('- Member Clerk ID:', currentUser.id)
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
    console.error('Error updating member notification:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update member notification' },
      { status: 500 }
    )
  }
} 'development') {
      console.log('[member-notifications] GET - Notifications retrieved successfully:')
      console.log('- Member Clerk ID:', currentUser.id)
      console.log('- Total notifications found:', notifications.length)
      console.log('- Unread notifications:', unreadCount)
      console.log('- Notification details:', notifications.map(n => ({ 
        id: n.id, 
        type: n.type, 
        isRead: n.isRead, 
        trainerName: n.trainerName 
      })))
    }

    return NextResponse.json({
      success: true,
      notifications: notifications,
      count: notifications.length,
      unreadCount: unreadCount
    })

  } catch (error) {
    console.error('Error retrieving member notifications:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve member notifications' },
      { status: 500 }
    )
  }
}
