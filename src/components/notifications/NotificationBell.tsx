'use client'

import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import { useTrainerNotifications } from '@/hooks/useTrainerNotifications'
import { useUserRole } from '@/hooks/useAuth'
import { BellIcon } from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'

interface NotificationBellProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  userRole?: 'trainer' | 'member' // 명시적으로 역할 지정 가능
}

export default function NotificationBell({ 
  size = 'md', 
  showLabel = false, 
  className = '',
  userRole 
}: NotificationBellProps) {
  const router = useRouter()
  const { role } = useUserRole()
  
  // 실제 사용할 역할 결정 (props가 우선, 없으면 현재 사용자 역할)
  const currentRole = userRole || role
  
  // 역할에 따라 적절한 훅 사용
  const memberNotifications = useNotifications()
  const trainerNotifications = useTrainerNotifications()
  
  const { pendingCount, isLoading } = currentRole === 'trainer' 
    ? { pendingCount: trainerNotifications.unreadCount, isLoading: trainerNotifications.isLoading }
    : { pendingCount: memberNotifications.pendingCount, isLoading: memberNotifications.isLoading }

  // 디버깅 로그
  console.log('[NotificationBell] Rendering with:', { 
    currentRole, 
    pendingCount, 
    isLoading,
    userRole,
    role 
  })

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
    const targetPath = currentRole === 'trainer' ? '/trainer/notifications' : '/member/notifications'
    console.log('[NotificationBell] Clicked, navigating to:', targetPath)
    router.push(targetPath)
  }

  const hasPendingNotifications = pendingCount > 0
  console.log('[NotificationBell] Has pending notifications:', hasPendingNotifications)

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
