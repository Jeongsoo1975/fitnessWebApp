'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/shared/layout'
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar'
import AddScheduleModal from '@/components/schedule/AddScheduleModal'
import { DashboardSkeleton } from '@/components/ui/skeleton'
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
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    )
  }
  
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">운동 일정 📅</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">나의 운동 일정을 확인하고 관리하세요.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 mt-2">
            현재 역할: {role}
          </p>
        )}
      </div>

      {/* Schedule Calendar */}
      <div className="mb-6 sm:mb-8">
        <ScheduleCalendar />
      </div>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedDate={selectedDate}
        onAddSchedule={handleAddSchedule}
      />
    </DashboardLayout>
  )
}
