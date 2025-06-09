import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'
import TrainerStats from '@/components/dashboard/trainer/TrainerStats'
import TodaySchedule from '@/components/dashboard/trainer/TodaySchedule'
import QuickActions from '@/components/dashboard/trainer/QuickActions'
import RecentActivity from '@/components/dashboard/trainer/RecentActivity'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

// 서버 컴포넌트로 인증 체크
async function TrainerDashboardContent() {
  await requireRole('trainer')
  
  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">환영합니다! 👋</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">오늘도 회원들의 건강한 변화를 도와주세요.</p>
      </div>

      {/* Quick Stats - 모바일 우선 반응형 그리드 */}
      <div className="mb-6 sm:mb-8">
        <TrainerStats />
      </div>

      {/* Main Content - 모바일에서 세로 스택, 데스크탑에서 그리드 */}
      <div className="space-y-6 sm:space-y-8 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <TodaySchedule />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6 sm:space-y-8">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </>
  )
}

export default function TrainerDashboard() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <TrainerDashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}