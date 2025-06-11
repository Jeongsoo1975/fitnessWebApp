import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'
import TrainerNotificationManager from '@/components/trainer/TrainerNotificationManager'

export default async function TrainerNotificationsPage() {
  // 트레이너 권한 체크
  await requireRole('trainer')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          <p className="mt-2 text-sm text-gray-600">
            회원들로부터 받은 알림을 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <TrainerNotificationManager />
      </div>
    </DashboardLayout>
  )
}
