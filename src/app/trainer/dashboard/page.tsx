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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">환영합니다! 👋</h1>
        <p className="text-gray-600 mt-1">오늘도 회원들의 건강한 변화를 도와주세요.</p>
      </div>

      {/* Quick Stats - Suspense로 감싸서 개별 로딩 */}
      <div className="mb-8">
        <TrainerStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <TodaySchedule />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
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