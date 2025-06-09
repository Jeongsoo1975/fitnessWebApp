'use client'

import { useState } from 'react'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'
import AddScheduleModal from '@/components/schedule/AddScheduleModal'

export default function SchedulePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleAddSchedule = (schedule: any) => {
    // 실제로는 API 호출을 통해 일정을 저장
    console.log('새 일정 추가:', schedule)
    // TODO: API 연동
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="mobile-container-full bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between py-4">
          <h1 className="mobile-heading">일정 관리</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mobile-button bg-blue-600 text-white"
          >
            + 새 일정
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="py-6">
        <ScheduleCalendar />
      </div>

      {/* 일정 추가 모달 */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedDate={selectedDate}
        onAddSchedule={handleAddSchedule}
      />
    </div>
  )
}