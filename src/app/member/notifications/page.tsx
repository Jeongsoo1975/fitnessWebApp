import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'
import MemberNotificationManager from '@/components/member/MemberNotificationManager'

export default async function MemberNotificationsPage() {
  // 회원 권한 체크
  await requireRole('member')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          <p className="mt-2 text-sm text-gray-600">
            트레이너로부터 받은 등록 요청을 확인하고 승인 또는 거절할 수 있습니다.
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <MemberNotificationManager />
      </div>
    </DashboardLayout>
  )
}
