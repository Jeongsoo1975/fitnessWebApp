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
    if (!isLoaded || !user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/member/trainer-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests || [])
      } else {
        setError('Failed to load notifications')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [isLoaded, user])

  const pendingCount = requests.filter(req => req.status === 'pending').length

  return {
    requests,
    pendingCount,
    isLoading,
    error,
    refreshNotifications: fetchNotifications
  }
}
