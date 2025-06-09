'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ScheduleItem {
  id: string
  memberName: string
  memberInitial: string
  sessionType: string
  time: string
  status: 'completed' | 'in-progress' | 'scheduled'
  bgColor: string
  textColor: string
  statusColor: string
  statusBg: string
}

function TodayScheduleContent() {
  // 실제로는 API에서 데이터를 가져올 부분
  const scheduleItems: ScheduleItem[] = [
    {
      id: '1',
      memberName: '김민수 회원',
      memberInitial: '김',
      sessionType: '하체 집중 트레이닝',
      time: '14:00 - 15:00',
      status: 'completed',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      statusColor: 'text-green-800',
      statusBg: 'bg-green-100'
    },
    {
      id: '2',
      memberName: '이지은 회원',
      memberInitial: '이',
      sessionType: '전신 순환 운동',
      time: '16:00 - 17:00',
      status: 'in-progress',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      statusColor: 'text-yellow-800',
      statusBg: 'bg-yellow-100'
    },
    {
      id: '3',
      memberName: '박준형 회원',
      memberInitial: '박',
      sessionType: '상체 근력 강화',
      time: '18:00 - 19:00',
      status: 'scheduled',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      statusColor: 'text-gray-800',
      statusBg: 'bg-gray-100'
    }
  ]

  const getStatusLabel = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'completed': return '완료'
      case 'in-progress': return '진행중'
      case 'scheduled': return '예정'
      default: return '알 수 없음'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">오늘 일정</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {scheduleItems.map((item) => (
            <div key={item.id} className={`flex items-center p-4 ${item.bgColor} rounded-lg`}>
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 bg-${item.textColor.split('-')[1]}-100 rounded-full flex items-center justify-center`}>
                  <span className={`${item.textColor} font-medium`}>{item.memberInitial}</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.memberName}</p>
                    <p className="text-sm text-gray-500">{item.sessionType}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.textColor}`}>{item.time}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.statusBg} ${item.statusColor}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            전체 일정 보기 →
          </button>
        </div>
      </div>
    </div>
  )
}

function TodayScheduleSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}

export default function TodaySchedule() {
  return (
    <Suspense fallback={<TodayScheduleSkeleton />}>
      <TodayScheduleContent />
    </Suspense>
  )
}