'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { BellIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { showToast } from '@/components/ui/Toast'

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

export default function MemberNotificationManager() {
  const { getToken } = useAuth()
  const [requests, setRequests] = useState<TrainerRequest[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null)

  // 트레이너 요청 목록 로드
  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/member/trainer-requests', {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('요청 목록을 불러오는데 실패했습니다.')
      }

      const data = await response.json() as any
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error loading requests:', error)
      setError(error instanceof Error ? error.message : '요청 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  // 요청 상태 업데이트 (승인/거절)
  const updateRequestStatus = useCallback(async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessingRequestId(requestId)
      setError(null)

      const response = await fetch('/api/member/trainer-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          requestId,
          status
        })
      })

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(errorData.error || '요청 처리에 실패했습니다.')
      }

      // 로컬 상태 업데이트
      setRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status, updatedAt: new Date().toISOString() }
          : request
      ))

      // 성공 토스트 알림
      const actionText = status === 'approved' ? '승인' : '거절'
      showToast({
        type: status === 'approved' ? 'success' : 'info',
        title: `트레이너 요청 ${actionText} 완료`,
        message: `트레이너 요청을 ${actionText}했습니다.`
      })

    } catch (error) {
      console.error('Error updating request status:', error)
      setError(error instanceof Error ? error.message : '요청 처리에 실패했습니다.')
    } finally {
      setProcessingRequestId(null)
    }
  }, [getToken])

  // 필터링된 요청 목록
  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true
    return request.status === filter
  })

  // 미처리 요청 개수
  const pendingCount = requests.filter(r => r.status === 'pending').length

  // 컴포넌트 마운트 시 및 주기적으로 데이터 로드
  useEffect(() => {
    loadRequests()
    
    // 30초마다 새로운 요청 확인
    const interval = setInterval(loadRequests, 30000)
    return () => clearInterval(interval)
  }, [loadRequests])

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

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'rejected':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중'
      case 'approved':
        return '승인됨'
      case 'rejected':
        return '거절됨'
      default:
        return status
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 헤더 및 필터 */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-6 w-6 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900">트레이너 요청</h2>
            {pendingCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {pendingCount}개 대기
              </span>
            )}
          </div>
          <button
            onClick={loadRequests}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? '새로고침 중...' : '새로고침'}
          </button>
        </div>

        {/* 필터 버튼 */}
        <div className="flex space-x-1">
          {[
            { key: 'all', label: '전체', count: requests.length },
            { key: 'pending', label: '대기 중', count: requests.filter(r => r.status === 'pending').length },
            { key: 'approved', label: '승인됨', count: requests.filter(r => r.status === 'approved').length },
            { key: 'rejected', label: '거절됨', count: requests.filter(r => r.status === 'rejected').length }
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

      {/* 요청 목록 */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">
              {filter === 'all' ? '받은 요청이 없습니다' : `${getStatusText(filter)} 요청이 없습니다`}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              트레이너가 등록 요청을 보내면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 트레이너 정보 */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {request.trainer.name[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.trainer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.trainer.email}
                        </p>
                      </div>
                    </div>

                    {/* 요청 메시지 */}
                    {request.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">&quot;{request.message}&quot;</p>
                      </div>
                    )}

                    {/* 상태 및 시간 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md border ${getStatusStyle(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{getStatusText(request.status)}</span>
                      </div>
                      <span>{formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 (대기 중인 요청만) */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        disabled={processingRequestId === request.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckIcon className="h-3 w-3 mr-1" />
                        승인
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'rejected')}
                        disabled={processingRequestId === request.id}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XMarkIcon className="h-3 w-3 mr-1" />
                        거절
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
