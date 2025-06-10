import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'
import TrainerMemberManager from '@/components/member/TrainerMemberManager'

export default async function TrainerMembersPage() {
  // 트레이너 권한 체크
  await requireRole('trainer')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            등록된 회원을 관리하고 새로운 회원을 검색하여 등록 요청을 보낼 수 있습니다.
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <TrainerMemberManager />
      </div>
    </DashboardLayout>
  )
}
