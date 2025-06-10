'use client'

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface Schedule {
  id: string
  date: string
  title: string
  description?: string
  bodyParts: string[]
  exercises: any[]
  status: 'scheduled' | 'completed' | 'cancelled'
  memberName?: string
  memberId?: string
  createdAt: string
}

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
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTodaySchedules()
  }, [])

  const loadTodaySchedules = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD 형태
      const response = await fetch(`/api/trainer/schedules?date=${today}`)
      
      if (!response.ok) {
        throw new Error('Failed to load today schedules')
      }
      
      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Error loading today schedules:', error)
      setError('오늘 일정을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 스케줄 데이터를 ScheduleItem 형태로 변환
  const formatScheduleItems = (schedules: Schedule[]): ScheduleItem[] => {
    return schedules.map((schedule) => {
      const memberInitial = schedule.memberName 
        ? schedule.memberName.charAt(0) 
        : '?'
      
      // 상태에 따른 색상 설정
      let bgColor = 'bg-gray-50'
      let textColor = 'text-gray-600'
      let statusColor = 'text-gray-800'
      let statusBg = 'bg-gray-100'
      
      switch (schedule.status) {
        case 'completed':
          bgColor = 'bg-green-50'
          textColor = 'text-green-600'
          statusColor = 'text-green-800'
          statusBg = 'bg-green-100'
          break
        case 'scheduled':
          bgColor = 'bg-blue-50'
          textColor = 'text-blue-600'
          statusColor = 'text-blue-800'
          statusBg = 'bg-blue-100'
          break
        case 'cancelled':
          bgColor = 'bg-red-50'
          textColor = 'text-red-600'
          statusColor = 'text-red-800'
          statusBg = 'bg-red-100'
          break
      }

      return {
        id: schedule.id,
        memberName: schedule.memberName || '그룹 세션',
        memberInitial,
        sessionType: schedule.title,
        time: '시간 미정', // 추후 시간 정보 추가 시 사용
        status: schedule.status === 'cancelled' ? 'scheduled' : schedule.status,
        bgColor,
        textColor,
        statusColor,
        statusBg
      }
    })
  }

  const getStatusLabel = (status: ScheduleItem['status']) => {
    switch (status) {
      case 'completed': return '완료'
      case 'in-progress': return '진행중'
      case 'scheduled': return '예정'
      default: return '알 수 없음'
    }
  }

  if (loading) {
    return <TodayScheduleSkeleton />
  }

  if (error) {
    return (
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="mobile-subheading">오늘 일정</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadTodaySchedules}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const scheduleItems = formatScheduleItems(schedules)

  return (
    <div className="mobile-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="mobile-subheading">오늘 일정</h3>
        <span className="mobile-caption text-gray-500">
          {scheduleItems.length}개
        </span>
      </div>
      
      {scheduleItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📅</div>
          <p className="text-gray-500 text-sm">오늘 예정된 일정이 없습니다.</p>
        </div>
      ) : (
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
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link 
          href="/trainer/schedule"
          className="mobile-button w-full bg-blue-600 text-white text-center flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          전체 일정 보기
          <span>→</span>
        </Link>
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