'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface TrainerRequest {
  id: string
  trainer: {
    id: string
    name: string
    email: string
  }
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

interface UseNotificationsReturn {
  requests: TrainerRequest[]
  pendingCount: number
  isLoading: boolean
  error: string | null
  refreshNotifications: () => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { user, isLoaded } = useUser()
  const [requests, setRequests] = useState<TrainerRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    if (!isLoaded || !user) {
      console.log('[useNotifications] User not loaded or not available')
      return
    }

    console.log('[useNotifications] Fetching notifications for user:', user.id)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/member/trainer-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('[useNotifications] API response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`)
      }

      const data = await response.json() as any
      console.log('[useNotifications] API response data:', data)
      
      if (data.success) {
        setRequests(data.requests || [])
        console.log('[useNotifications] Requests set:', data.requests?.length || 0)
        console.log('[useNotifications] Pending requests:', data.requests?.filter((r: any) => r.status === 'pending').length || 0)
      } else {
        setError('Failed to load notifications')
        console.error('[useNotifications] API returned success: false')
      }
    } catch (err) {
      console.error('[useNotifications] Error fetching notifications:', err)
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isLoaded, user])

  const pendingCount = requests.filter(req => req.status === 'pending').length
  
  // 디버깅 로그
  console.log('[useNotifications] Current state:', {
    requestsLength: requests.length,
    requests: requests.map(r => ({ id: r.id, status: r.status })),
    pendingCount,
    isLoading,
    error
  })

  return {
    requests,
    pendingCount,
    isLoading,
    error,
    refreshNotifications: fetchNotifications
  }
}
