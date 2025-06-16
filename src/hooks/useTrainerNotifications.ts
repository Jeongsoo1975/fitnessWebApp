'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

interface TrainerNotification {
  id: string
  trainerId: string
  type: 'member_approved' | 'member_rejected' | 'new_member_request' | 'session_scheduled' | 'other'
  message: string
  memberId?: string
  memberName?: string
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

interface UseTrainerNotificationsReturn {
  notifications: TrainerNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
}

export function useTrainerNotifications(): UseTrainerNotificationsReturn {
  const { user, isLoaded } = useUser()
  const [notifications, setNotifications] = useState<TrainerNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!isLoaded || !user) {
      console.log('[useTrainerNotifications] User not loaded or not available')
      return
    }

    console.log('[useTrainerNotifications] Fetching notifications for trainer:', user.id)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/trainer/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('[useTrainerNotifications] API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch trainer notifications: ${response.status}`)
      }

      const data = await response.json() as any
      console.log('[useTrainerNotifications] API response data:', data)
      
      if (data.success) {
        setNotifications(data.notifications || [])
        console.log('[useTrainerNotifications] Notifications set:', data.notifications?.length || 0)
        console.log('[useTrainerNotifications] Unread notifications:', data.unreadCount || 0)
      } else {
        setError('Failed to load trainer notifications')
        console.error('[useTrainerNotifications] API returned success: false')
      }
    } catch (err) {
      console.error('[useTrainerNotifications] Error fetching notifications:', err)
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [isLoaded, user])

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    if (!isLoaded || !user) {
      console.log('[useTrainerNotifications] markAsRead - User not available')
      return false
    }

    console.log('[useTrainerNotifications] Marking notification as read:', notificationId)

    try {
      const response = await fetch('/api/trainer/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId: notificationId
        }),
      })

      console.log('[useTrainerNotifications] Mark as read response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`)
      }

      const data = await response.json() as any
      console.log('[useTrainerNotifications] Mark as read response data:', data)

      if (data.success) {
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true, updatedAt: data.notification.updatedAt }
              : notification
          )
        )
        console.log('[useTrainerNotifications] Local notification marked as read successfully')
        return true
      } else {
        setError('Failed to mark notification as read')
        return false
      }
    } catch (err) {
      console.error('[useTrainerNotifications] Error marking notification as read:', err)
      setError('알림 읽음 처리 중 오류가 발생했습니다.')
      return false
    }
  }

  const markAllAsRead = async (): Promise<boolean> => {
    if (!isLoaded || !user) {
      console.log('[useTrainerNotifications] markAllAsRead - User not available')
      return false
    }

    console.log('[useTrainerNotifications] Marking all notifications as read')

    try {
      const response = await fetch('/api/trainer/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          markAllAsRead: true
        }),
      })

      console.log('[useTrainerNotifications] Mark all as read response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`)
      }

      const data = await response.json() as any
      console.log('[useTrainerNotifications] Mark all as read response data:', data)

      if (data.success) {
        // 로컬 상태 업데이트 - 모든 알림을 읽음 처리
        setNotifications(prev => 
          prev.map(notification => ({ 
            ...notification, 
            isRead: true, 
            updatedAt: new Date().toISOString() 
          }))
        )
        console.log('[useTrainerNotifications] All notifications marked as read locally')
        return true
      } else {
        setError('Failed to mark all notifications as read')
        return false
      }
    } catch (err) {
      console.error('[useTrainerNotifications] Error marking all notifications as read:', err)
      setError('모든 알림 읽음 처리 중 오류가 발생했습니다.')
      return false
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter(notification => !notification.isRead).length
  
  // 디버깅 로그
  console.log('[useTrainerNotifications] Current state:', {
    notificationsLength: notifications.length,
    notifications: notifications.map(n => ({ id: n.id, type: n.type, isRead: n.isRead })),
    unreadCount,
    isLoading,
    error
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
