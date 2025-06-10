import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'
import MemberScheduleManager from '@/components/schedule/MemberScheduleManager'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

// 서버 컴포넌트로 인증 체크
async function MemberScheduleContent() {
  await requireRole('member')
  
  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">내 운동 일정 📅</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">트레이너가 등록한 운동 일정을 확인하고 수정을 요청하세요.</p>
      </div>

      {/* 스케줄 관리 컴포넌트 */}
      <MemberScheduleManager />
    </>
  )
}

export default function MemberSchedulePage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <MemberScheduleContent />
      </Suspense>
    </DashboardLayout>
  )
}
