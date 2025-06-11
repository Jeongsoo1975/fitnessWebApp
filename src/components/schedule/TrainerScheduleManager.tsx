'use client'

import { useState, useEffect } from 'react'
import AddScheduleModal from './AddScheduleModal'
import TrainerScheduleCalendar from './TrainerScheduleCalendar'
import { PlusIcon, CalendarIcon, ListBulletIcon } from '@heroicons/react/24/outline'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
}

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

export default function TrainerScheduleManager() {
  const [members, setMembers] = useState<Member[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 회원 목록 로드
  useEffect(() => {
    loadMembers()
  }, [])

  // 스케줄 목록 로드
  useEffect(() => {
    loadSchedules()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/trainer/members')
      if (!response.ok) {
        throw new Error('Failed to load members')
      }
      const data = await response.json() as any
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error loading members:', error)
      setError('회원 목록을 불러오는데 실패했습니다.')
    }
  }

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trainer/schedules')
      if (!response.ok) {
        throw new Error('Failed to load schedules')
      }
      const data = await response.json() as any
      setSchedules(data.schedules || [])
    } catch (error) {
      console.error('Error loading schedules:', error)
      setError('스케줄을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSchedule = async (scheduleData: any) => {
    try {
      const response = await fetch('/api/trainer/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: scheduleData.date,
          title: scheduleData.title,
          type: scheduleData.type,
          memberId: scheduleData.memberId,
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          location: scheduleData.location,
          notes: scheduleData.notes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create schedule')
      }

      const result = await response.json() as any
      console.log('Schedule created:', result)

      // 모달 닫기
      setIsModalOpen(false)
      
      // 성공 메시지
      alert('스케줄이 성공적으로 추가되었습니다!')
      
      // 약간의 지연 후 스케줄 목록 새로고침 (개발 환경에서 mock 데이터 업데이트 반영)
      setTimeout(async () => {
        await loadSchedules()
      }, 100)

    } catch (error) {
      console.error('Error creating schedule:', error)
      alert('스케줄 추가에 실패했습니다.')
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('정말로 이 스케줄을 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/trainer/schedules?id=${scheduleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete schedule')
      }

      // 스케줄 목록 새로고침
      await loadSchedules()
      alert('스케줄이 삭제되었습니다.')

    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('스케줄 삭제에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                  loadMembers()
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
                ? 'bg-white text-blue-600 shadow-sm'
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
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListBulletIcon className="w-4 h-4 mr-2" />
            목록 보기
          </button>
        </div>

        {/* 새 스케줄 추가 버튼 */}
        <div className="flex flex-col items-end space-y-2">
          {/* 선택된 날짜 표시 */}
          <div className="text-sm text-gray-600">
            선택된 날짜: {selectedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="mobile-button bg-blue-600 text-white flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            새 스케줄 추가
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="mobile-card">
        {viewMode === 'calendar' ? (
          <TrainerScheduleCalendar
            schedules={schedules}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onScheduleClick={(schedule) => {
              // 스케줄 클릭 시 상세 보기 또는 편집 모달
              console.log('Schedule clicked:', schedule)
            }}
            onDeleteSchedule={handleDeleteSchedule}
          />
        ) : (
          <TrainerScheduleList
            schedules={schedules}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}
      </div>

      {/* 스케줄 추가 모달 */}
      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onAddSchedule={handleAddSchedule}
        userRole="trainer"
        members={members}
      />
    </div>
  )
}

// 목록 보기 컴포넌트
function TrainerScheduleList({ 
  schedules, 
  onDeleteSchedule 
}: { 
  schedules: Schedule[]
  onDeleteSchedule: (id: string) => void 
}) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">스케줄이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">새로운 스케줄을 추가해보세요.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels: { [key: string]: string } = {
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
      <h3 className="text-lg font-medium text-gray-900">전체 스케줄 ({schedules.length}개)</h3>
      
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="mobile-card-compact bg-white border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{schedule.title}</h4>
                  {getStatusBadge(schedule.status)}
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 {new Date(schedule.date).toLocaleDateString('ko-KR')}</span>
                  {schedule.memberName && (
                    <span>👤 {schedule.memberName}</span>
                  )}
                </div>
                
                {schedule.notes && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{schedule.notes}</p>
                )}
              </div>
              
              <button
                onClick={() => onDeleteSchedule(schedule.id)}
                className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}