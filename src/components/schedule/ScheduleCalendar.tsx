'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import { ClockIcon, UserIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { useUser } from '@clerk/nextjs'
import { useUserRole } from '@/hooks/useAuth'

interface ScheduleItem {
  id: string
  title: string
  memberName?: string
  trainerName?: string
  memberId?: string
  trainerId?: string
  memberAvatar?: string
  startTime: string
  endTime: string
  date: string
  type: 'pt' | 'group' | 'personal' | 'break'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  location?: string
  notes?: string
  color: string
  hasChangeRequest?: boolean // 변경 요청 여부
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface CalendarDay {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  schedules: ScheduleItem[]
}

interface ScheduleCalendarProps {
  onAddSchedule?: () => void
}

const SCHEDULE_TYPES = {
  pt: { label: 'PT 세션', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
  group: { label: '그룹 수업', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
  personal: { label: '개인 운동', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
  break: { label: '휴식/점심', color: 'bg-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' }
}

const STATUS_TYPES = {
  scheduled: { label: '예정', color: 'bg-blue-100 text-blue-800' },
  'in-progress': { label: '진행중', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '완료', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-800' }
}

export default function ScheduleCalendar({ onAddSchedule }: ScheduleCalendarProps = {}) {
  const { user } = useUser()
  const { role } = useUserRole()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  // members와 loading 변수는 향후 사용을 위해 유지하되 사용하지 않는 경고 해결
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [members, setMembers] = useState<Member[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars  
  const [loading, setLoading] = useState(true)

  // API 호출 함수들
  const fetchWorkouts = useCallback(async () => {
    // 조건부 검사를 함수 시작 부분에서 수행
    if (!user?.id || !role) return
    
    try {
      const response = await fetch('/api/workouts', {
        headers: {
          'x-clerk-user-id': user.id,
          'x-user-role': role
        }
      })
      if (response.ok) {
        const data = await response.json() as any
        // API 데이터를 ScheduleItem 형식으로 변환
        const transformedSchedules = data.workouts.map((workout: any) => ({
          id: workout.id,
          title: workout.title,
          memberName: workout.member_name,
          trainerId: workout.trainer_id,
          memberId: workout.member_id,
          startTime: '09:00', // 임시값 - 추후 workout 테이블에 시간 필드 추가 필요
          endTime: '10:00',
          date: workout.date,
          type: 'pt',
          status: workout.status,
          location: workout.location,
          notes: workout.description,
          color: 'blue',
          hasChangeRequest: false // 추후 변경 요청 확인 로직 추가
        }))
        setSchedules(transformedSchedules)
      }
    } catch (error) {
      console.error('Failed to fetch workouts:', error)
    }
  }, [user?.id, role])

  const fetchMembers = useCallback(async () => {
    // 조건부 검사를 함수 시작 부분에서 수행
    if (role !== 'trainer') return
    
    try {
      // 임시 회원 데이터 - 추후 실제 API로 대체
      const mockMembers = [
        { id: '1', firstName: '김', lastName: '민수', email: 'kim@example.com' },
        { id: '2', firstName: '이', lastName: '지은', email: 'lee@example.com' },
        { id: '3', firstName: '박', lastName: '준형', email: 'park@example.com' }
      ]
      setMembers(mockMembers)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }, [role])

  useEffect(() => {
    // primitive 값 의존성만 사용하여 불필요한 재실행 방지
    if (!user?.id || !role) return

    const loadData = async () => {
      setLoading(true)
      
      // API 호출 함수들을 직접 호출
      const promises = []
      
      // fetchWorkouts 로직
      try {
        const workoutResponse = await fetch('/api/workouts', {
          headers: {
            'x-clerk-user-id': user.id,
            'x-user-role': role
          }
        })
        if (workoutResponse.ok) {
          const workoutData = await workoutResponse.json() as any
          const transformedSchedules = workoutData.workouts.map((workout: any) => ({
            id: workout.id,
            title: workout.title,
            memberName: workout.member_name,
            trainerId: workout.trainer_id,
            memberId: workout.member_id,
            startTime: '09:00',
            endTime: '10:00',
            date: workout.date,
            type: 'pt',
            status: workout.status,
            location: workout.location,
            notes: workout.description,
            color: 'blue',
            hasChangeRequest: false
          }))
          setSchedules(transformedSchedules)
        }
      } catch (error) {
        console.error('Failed to fetch workouts:', error)
      }

      // fetchMembers 로직 (trainer인 경우에만)
      if (role === 'trainer') {
        try {
          const mockMembers = [
            { id: '1', firstName: '김', lastName: '민수', email: 'kim@example.com' },
            { id: '2', firstName: '이', lastName: '지은', email: 'lee@example.com' },
            { id: '3', firstName: '박', lastName: '준형', email: 'park@example.com' }
          ]
          setMembers(mockMembers)
        } catch (error) {
          console.error('Failed to fetch members:', error)
        }
      }
      
      setLoading(false)
    }

    loadData()
  }, [user?.id, role])

  // 기존 샘플 데이터 로직은 제거하고 위의 API 호출로 대체

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateString = date.toISOString().split('T')[0]
      const daySchedules = schedules.filter(schedule => schedule.date === dateString)
      
      days.push({
        date: dateString,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        schedules: daySchedules
      })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const getSelectedDateSchedules = () => {
    const dateString = selectedDate.toISOString().split('T')[0]
    return schedules.filter(schedule => schedule.date === dateString)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <div className="mobile-container-full">
      <div className="mobile-card">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="mobile-heading">일정 관리</h2>
            <p className="mobile-caption mt-1">
              {selectedDate.toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          
          {/* 뷰 모드 토글 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all touch-target ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              캘린더
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all touch-target ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              목록
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <>
            {/* 캘린더 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="touch-target p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              <h3 className="mobile-subheading">{formatDate(currentDate)}</h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="touch-target p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className="p-2 text-center">
                  <span className={`mobile-caption font-medium ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, index) => (
                <button
                  key={`${day.date}-${index}`}
                  onClick={() => setSelectedDate(new Date(day.date))}
                  className={`touch-target-large p-2 rounded-lg transition-all ${
                    !day.isCurrentMonth
                      ? 'text-gray-300'
                      : day.isToday
                      ? 'bg-blue-600 text-white'
                      : selectedDate.toISOString().split('T')[0] === day.date
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {new Date(day.date).getDate()}
                  </div>
                  {day.schedules.length > 0 && (
                    <div className="flex justify-center mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        day.schedules.some(s => s.type === 'pt') ? 'bg-blue-500' :
                        day.schedules.some(s => s.type === 'group') ? 'bg-green-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          /* 리스트 뷰 */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="mobile-subheading">일정 목록</h3>
              <select 
                className="mobile-input text-sm"
                onChange={(e) => {
                  const date = new Date()
                  date.setDate(date.getDate() + parseInt(e.target.value))
                  setSelectedDate(date)
                }}
              >
                <option value="0">오늘</option>
                <option value="1">내일</option>
                <option value="7">일주일 후</option>
                <option value="30">한달 후</option>
              </select>
            </div>
          </div>
        )}

        {/* 선택된 날짜의 일정 목록 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="mobile-subheading">
              {selectedDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 일정
            </h4>
            <button 
              onClick={onAddSchedule}
              className="mobile-button-small bg-blue-600 text-white flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              추가
            </button>
          </div>

          <div className="mobile-spacing-compact">
            {getSelectedDateSchedules().length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="mobile-body text-gray-500">예정된 일정이 없습니다</p>
                <button 
                  onClick={onAddSchedule}
                  className="mobile-button bg-blue-600 text-white mt-4"
                >
                  새 일정 추가
                </button>
              </div>
            ) : (
              getSelectedDateSchedules().map((schedule) => (
                <div key={schedule.id} className={`mobile-card-compact border-l-4 border-${schedule.color}-500 ${schedule.hasChangeRequest ? 'bg-yellow-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          SCHEDULE_TYPES[schedule.type].bgColor
                        } ${SCHEDULE_TYPES[schedule.type].textColor}`}>
                          {SCHEDULE_TYPES[schedule.type].label}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_TYPES[schedule.status].color
                        }`}>
                          {STATUS_TYPES[schedule.status].label}
                        </span>
                        {schedule.hasChangeRequest && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                            변경요청
                          </span>
                        )}
                      </div>
                      
                      <h5 className="mobile-body font-medium text-gray-900 mb-1">
                        {schedule.title}
                      </h5>
                      
                      <div className="flex items-center gap-4 mobile-caption text-gray-500">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        {schedule.memberName && (
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {schedule.memberName}
                          </div>
                        )}
                      </div>
                      
                      {schedule.location && (
                        <p className="mobile-caption text-gray-500 mt-1">
                          📍 {schedule.location}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {schedule.status === 'scheduled' && (
                        <button className="touch-target p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button className="touch-target p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                        ⋯
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center">
            <button 
              onClick={onAddSchedule}
              className="mobile-button bg-blue-600 text-white"
            >
              새 PT 예약
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}