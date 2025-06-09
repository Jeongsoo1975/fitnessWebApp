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
    <div className="mobile-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="mobile-subheading">오늘 일정</h3>
        <span className="mobile-caption text-gray-500">
          {scheduleItems.length}개
        </span>
      </div>
      
      <div className="mobile-spacing-compact">
        {scheduleItems.map((item) => (
          <div key={item.id} className={`mobile-card-compact ${item.bgColor} border-l-4 border-${item.textColor.split('-')[1]}-500 touch-target-large transition-all active:scale-95`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${item.textColor.split('-')[1]}-100 rounded-full flex items-center justify-center`}>
                  <span className={`${item.textColor} font-medium mobile-body`}>{item.memberInitial}</span>
                </div>
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="mobile-body font-medium text-gray-900 truncate">{item.memberName}</p>
                    <p className="mobile-caption text-gray-500 mt-1 truncate">{item.sessionType}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className={`mobile-caption font-medium ${item.textColor}`}>{item.time}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.statusBg} ${item.statusColor} mt-1`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <a 
          href="/schedule"
          className="mobile-button w-full bg-blue-600 text-white text-center flex items-center justify-center gap-2"
        >
          전체 일정 보기
          <span>→</span>
        </a>
      </div>
    </div>
  )
}

function TodayScheduleSkeleton() {
  return (
    <div className="mobile-card">
      <div className="flex items-center justify-between mb-4">
        <div className="mobile-skeleton h-6 w-24"></div>
        <div className="mobile-skeleton h-4 w-8"></div>
      </div>
      <div className="mobile-spacing-compact">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mobile-card-compact bg-gray-50">
            <div className="flex items-center">
              <div className="mobile-skeleton w-10 h-10 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="mobile-skeleton h-4 w-24 mb-2"></div>
                    <div className="mobile-skeleton h-3 w-32"></div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="mobile-skeleton h-3 w-16 mb-2"></div>
                    <div className="mobile-skeleton h-5 w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="mobile-skeleton h-12 w-full rounded-lg"></div>
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