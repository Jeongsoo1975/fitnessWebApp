'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface Activity {
  id: string
  type: 'completed' | 'logged' | 'registered' | 'progress'
  member: string
  action: string
  time: string
  color: string
}

function RecentActivityContent() {
  // 실제로는 API에서 데이터를 가져올 부분
  const activities: Activity[] = [
    {
      id: '1',
      type: 'completed',
      member: '김민수',
      action: '회원이 운동을 완료했습니다.',
      time: '2시간 전',
      color: 'bg-green-400'
    },
    {
      id: '2',
      type: 'logged',
      member: '이지은',
      action: '회원이 식단을 기록했습니다.',
      time: '4시간 전',
      color: 'bg-blue-400'
    },
    {
      id: '3',
      type: 'registered',
      member: '최영희',
      action: '가 등록되었습니다.',
      time: '1일 전',
      color: 'bg-purple-400'
    },
    {
      id: '4',
      type: 'progress',
      member: '박준형',
      action: '회원의 체중이 2kg 감소했습니다.',
      time: '2일 전',
      color: 'bg-yellow-400'
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900">
                  {activity.type === 'registered' ? (
                    <>
                      새로운 회원 <span className="font-medium">{activity.member}</span>{activity.action}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{activity.member}</span> {activity.action}
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            모든 활동 보기 →
          </button>
        </div>
      </div>
    </div>
  )
}

function RecentActivitySkeleton() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start">
              <div className="flex-shrink-0">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
              </div>
              <div className="ml-3 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-32 mx-auto mt-6" />
      </div>
    </div>
  )
}

export default function RecentActivity() {
  return (
    <Suspense fallback={<RecentActivitySkeleton />}>
      <RecentActivityContent />
    </Suspense>
  )
}