'use client'

import { useState, useEffect } from 'react'
import MemberScheduleCalendar from './MemberScheduleCalendar'
import { CalendarIcon, ListBulletIcon, ClockIcon } from '@heroicons/react/24/outline'

interface Schedule {
  id: string
  date: string
  title: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  memberName?: string
  memberId?: string
  createdAt: string
  updatedAt?: string
}

export default function MemberScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 스케줄 목록 로드
  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      // 회원은 트레이너의 스케줄 API를 사용 (같은 데이터)
      const response = await fetch('/api/trainer/schedules')
      if (!response.ok) {
        throw new Error('Failed to load schedules')
      }
      const data = await response.json()
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Error loading schedules:', error)
      setError('스케줄을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleClick = (schedule: Schedule) => {
    // 스케줄 수정 요청 모달 열기 (나중에 구현)
    alert(`"${schedule.title}" 스케줄에 대한 수정 요청 기능은 곧 구현됩니다!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setError(null)
                  loadSchedules()
                }}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 상단 액션 바 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* 뷰 모드 토글 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            달력 보기
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListBulletIcon className="w-4 h-4 mr-2" />
            목록 보기
          </button>
        </div>

        {/* 정보 표시 */}
        <div className="flex items-center text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
          <ClockIcon className="w-4 h-4 mr-2 text-green-600" />
          총 {schedules.length}개의 일정
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="mobile-card">
        {viewMode === 'calendar' ? (
          <MemberScheduleCalendar
            schedules={schedules}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onScheduleClick={handleScheduleClick}
          />
        ) : (
          <MemberScheduleList
            schedules={schedules}
            onScheduleClick={handleScheduleClick}
          />
        )}
      </div>
    </div>
  )
}

// 목록 보기 컴포넌트
function MemberScheduleList({ 
  schedules, 
  onScheduleClick 
}: { 
  schedules: Schedule[]
  onScheduleClick: (schedule: Schedule) => void 
}) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">등록된 일정이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">트레이너가 일정을 등록하면 여기에 표시됩니다.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      scheduled: '예정',
      completed: '완료',
      cancelled: '취소'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status] || badges.scheduled}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">내 운동 일정 ({schedules.length}개)</h3>
      
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div 
            key={schedule.id} 
            className="mobile-card-compact bg-white border border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
            onClick={() => onScheduleClick(schedule)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{schedule.title}</h4>
                  {getStatusBadge(schedule.status)}
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 {new Date(schedule.date).toLocaleDateString('ko-KR')}</span>
                  <span>👨‍💼 트레이너</span>
                </div>
                
                {schedule.notes && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{schedule.notes}</p>
                )}
              </div>
              
              <div className="ml-4 text-green-600 hover:text-green-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
