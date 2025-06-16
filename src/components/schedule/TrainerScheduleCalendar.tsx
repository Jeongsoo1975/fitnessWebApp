'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Schedule {
  id: string
  date: string
  title: string
  notes?: string // description -> notes로 변경  
  status: 'scheduled' | 'completed' | 'cancelled'
  memberName?: string
  memberId?: string
  createdAt: string
  updatedAt?: string
}

interface TrainerScheduleCalendarProps {
  schedules: Schedule[]
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onScheduleClick: (clickedSchedule: Schedule) => void
  onDeleteSchedule: (scheduleIdToDelete: string) => void
}

export default function TrainerScheduleCalendar({
  schedules,
  selectedDate,
  onDateSelect,
  onScheduleClick,
  onDeleteSchedule
}: TrainerScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // 달력 네비게이션
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 현재 월의 달력 데이터 생성
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay()) // 일요일부터 시작

  const days = []
  const current = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // 특정 날짜의 스케줄 가져오기
  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.filter(schedule => schedule.date === dateStr)
  }

  // 날짜가 현재 월에 속하는지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // 선택된 날짜인지 확인
  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  return (
    <div className="space-y-4">
      {/* 달력 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {year}년 {monthNames[month]}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50"
          >
            오늘
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 달력 그리드 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-3 text-center text-sm font-medium ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-900'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const daySchedules = getSchedulesForDate(day)
            const isCurrentMonthDay = isCurrentMonth(day)
            const isTodayDay = isToday(day)

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`min-h-[100px] p-2 border-r border-b border-gray-200 cursor-pointer transition-colors ${
                  !isCurrentMonthDay ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-blue-50'
                } ${index % 7 === 6 ? 'border-r-0' : ''} ${
                  isSelectedDate(day) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {/* 날짜 숫자 */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      !isCurrentMonthDay
                        ? 'text-gray-400'
                        : isTodayDay
                        ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                        : index % 7 === 0
                        ? 'text-red-600'
                        : index % 7 === 6
                        ? 'text-blue-600'
                        : 'text-gray-900'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* 스케줄 목록 */}
                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`group relative p-1 rounded text-xs cursor-pointer transition-colors ${
                        schedule.status === 'completed'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : schedule.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => onScheduleClick(schedule)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1 font-medium">
                          {schedule.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteSchedule(schedule.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 ml-1 text-red-600 hover:text-red-800 transition-opacity"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                      {schedule.memberName && (
                        <div className="text-xs opacity-75 truncate">
                          {schedule.memberName}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* 더 많은 스케줄이 있는 경우 */}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{daySchedules.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span className="text-gray-600">예정</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span className="text-gray-600">완료</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span className="text-gray-600">취소</span>
        </div>
      </div>
    </div>
  )
}