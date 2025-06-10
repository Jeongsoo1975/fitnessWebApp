'use client'

import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationBell from '@/components/notifications/NotificationBell'

export default function NotificationCard() {
  const router = useRouter()
  const { requests, pendingCount, isLoading } = useNotifications()

  const pendingRequests = requests.filter(req => req.status === 'pending')
  const recentRequests = pendingRequests.slice(0, 3) // 최대 3개만 미리보기

  const handleViewAll = () => {
    router.push('/member/notifications')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <NotificationBell size="sm" />
          <h3 className="text-lg font-semibold text-gray-900">알림</h3>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            모두 보기
          </button>
        )}
      </div>

      {pendingCount === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <NotificationBell size="lg" />
          </div>
          <p className="text-gray-500 text-sm">새로운 알림이 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">트레이너 요청이 오면 여기에 표시됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 미리보기 요청들 */}
          {recentRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
              onClick={handleViewAll}
            >
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  새로운 트레이너 요청
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {request.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(request.createdAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* 추가 요청이 있는 경우 */}
          {pendingCount > 3 && (
            <div className="text-center">
              <button
                onClick={handleViewAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                +{pendingCount - 3}개 더 보기
              </button>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={handleViewAll}
              className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              모든 알림 확인하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
