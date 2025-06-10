import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'
import TrainerScheduleManager from '@/components/schedule/TrainerScheduleManager'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

// 서버 컴포넌트로 인증 체크
async function TrainerScheduleContent() {
  await requireRole('trainer')
  
  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">스케줄 관리 📅</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">회원들의 운동 일정을 관리하고 새로운 스케줄을 추가하세요.</p>
      </div>

      {/* 스케줄 관리 컴포넌트 */}
      <TrainerScheduleManager />
    </>
  )
}

export default function TrainerSchedulePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <TrainerScheduleContent />
      </Suspense>
    </DashboardLayout>
  )
}