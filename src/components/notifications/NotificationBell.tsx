'use client'

import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { BellIcon } from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

interface NotificationBellProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export default function NotificationBell({ 
  size = 'md', 
  showLabel = false, 
  className = '' 
}: NotificationBellProps) {
  const router = useRouter()
  const { pendingCount, isLoading } = useNotifications()

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const badgeSizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  }

  const handleClick = () => {
    router.push('/member/notifications')
  }

  const hasPendingNotifications = pendingCount > 0

  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ${className}`}
      title={`알림 ${hasPendingNotifications ? `(${pendingCount}개의 새 알림)` : ''}`}
    >
      {/* 벨 아이콘 */}
      {hasPendingNotifications ? (
        <BellSolidIcon className={`${sizeClasses[size]} text-blue-600`} />
      ) : (
        <BellIcon className={`${sizeClasses[size]} text-gray-600`} />
      )}
      
      {/* 배지 */}
      {hasPendingNotifications && (
        <span className={`absolute -top-1 -right-1 ${badgeSizeClasses[size]} bg-red-500 text-white rounded-full flex items-center justify-center font-medium min-w-0`}>
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 라벨 */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          알림
          {hasPendingNotifications && (
            <span className="ml-1 text-red-500">({pendingCount})</span>
          )}
        </span>
      )}
    </button>
  )
}
