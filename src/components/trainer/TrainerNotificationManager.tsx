'use client'

import { useState, useEffect } from 'react'
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications'
import { BellIcon, CheckIcon, UserPlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, UserIcon, ClockIcon } from '@heroicons/react/24/solid'
import { showToast } from '@/components/ui/Toast'

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

export default function TrainerNotificationManager() {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useTrainerNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  // 개별 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: string) => {
    if (processingId) return

    setProcessingId(notificationId)
    try {
      const success = await markAsRead(notificationId)
      if (success) {
        showToast({
          type: 'success',
          title: '알림 읽음 처리 완료',
          message: '알림이 읽음 처리되었습니다.'
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: '알림 읽음 처리 실패',
        message: '알림 읽음 처리 중 오류가 발생했습니다.'
      })
    } finally {
      setProcessingId(null)
    }
  }

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (processingId || unreadCount === 0) return

    setProcessingId('all')
    try {
      const success = await markAllAsRead()
      if (success) {
        showToast({
          type: 'success',
          title: '모든 알림 읽음 처리 완료',
          message: '모든 알림이 읽음 처리되었습니다.'
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: '알림 읽음 처리 실패',
        message: '알림 읽음 처리 중 오류가 발생했습니다.'
      })
    } finally {
      setProcessingId(null)
    }
  }

  // 시간 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    if (diffDays < 7) return `${diffDays}일 전`
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'member_approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'member_rejected':
        return <UserIcon className="h-5 w-5 text-red-500" />
      case 'new_member_request':
        return <UserPlusIcon className="h-5 w-5 text-blue-500" />
      case 'session_scheduled':
        return <CalendarIcon className="h-5 w-5 text-purple-500" />
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />
    }
  }

  // 알림 타입별 배경색
  const getNotificationBgColor = (type: string, isRead: boolean) => {
    const baseColor = isRead ? 'bg-gray-50' : ''
    switch (type) {
      case 'member_approved':
        return isRead ? 'bg-green-50' : 'bg-green-100'
      case 'member_rejected':
        return isRead ? 'bg-red-50' : 'bg-red-100'
      case 'new_member_request':
        return isRead ? 'bg-blue-50' : 'bg-blue-100'
      case 'session_scheduled':
        return isRead ? 'bg-purple-50' : 'bg-purple-100'
      default:
        return isRead ? 'bg-gray-50' : 'bg-white'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 헤더 및 필터 */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">받은 알림</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}개 안읽음
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={processingId === 'all'}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
              >
                {processingId === 'all' ? '처리 중...' : '모두 읽음 처리'}
              </button>
            )}
            <button
              onClick={refreshNotifications}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
        </div>

        {/* 필터 버튼 */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: '전체', count: notifications.length },
            { key: 'unread', label: '안읽음', count: notifications.filter(n => !n.isRead).length },
            { key: 'read', label: '읽음', count: notifications.filter(n => n.isRead).length }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              {filter === 'all' ? '받은 알림이 없습니다' : 
               filter === 'unread' ? '읽지 않은 알림이 없습니다' : '읽은 알림이 없습니다'}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              회원들의 활동에 따라 알림이 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`border rounded-lg p-4 transition-colors ${
                  notification.isRead ? 'border-gray-200' : 'border-blue-200'
                } ${getNotificationBgColor(notification.type, notification.isRead)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* 알림 아이콘 */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 알림 메시지 */}
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>

                      {/* 회원 정보 (있는 경우) */}
                      {notification.memberName && (
                        <p className="text-xs text-gray-500 mt-1">
                          회원: {notification.memberName}
                        </p>
                      )}

                      {/* 시간 및 읽음 상태 */}
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center space-x-1 text-xs text-blue-600">
                            <ClockIcon className="h-3 w-3" />
                            <span>새 알림</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 읽음 처리 버튼 (안읽은 알림만) */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={processingId === notification.id}
                        className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        읽음
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
