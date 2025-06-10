'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'
import AddScheduleModal from '@/components/schedule/AddScheduleModal'
import { useUserRole } from '@/hooks/useAuth'

export const dynamic = 'force-dynamic'

export default function MemberSchedulePage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { role, isLoading: roleLoading } = useUserRole()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (isLoaded && !roleLoading) {
      if (!isSignedIn) {
        router.push('/sign-in')
        return
      }

      if (!role) {
        router.push('/onboarding')
        return
      }

      if (role !== 'member') {
        router.push('/trainer/dashboard')
        return
      }

      setIsAuthorized(true)
    }
  }, [isLoaded, isSignedIn, role, roleLoading, router])

  const handleAddSchedule = (schedule: any) => {
    // 실제로는 API 호출을 통해 일정을 저장
    console.log('새 일정 추가:', schedule)
    // TODO: API 연동
    setIsAddModalOpen(false)
  }

  if (!isLoaded || roleLoading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="mobile-container-full bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="mobile-heading">운동 일정 📅</h1>
            <p className="mobile-caption text-gray-600 mt-1">나의 운동 일정을 확인하고 관리하세요</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400 mt-1">
                현재 역할: {role}
              </p>
            )}
          </div>
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
        <ScheduleCalendar onAddSchedule={() => setIsAddModalOpen(true)} />
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
