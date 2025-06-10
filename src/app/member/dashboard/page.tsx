'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/shared/layout'
import MemberStats from '@/components/dashboard/member/MemberStats'
import ProgressOverview from '@/components/dashboard/ProgressOverview'
import NotificationCard from '@/components/notifications/NotificationCard'
import { DashboardSkeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

export default function MemberDashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/sign-in')
        return
      }

      // localStorage에서 역할 확인
      const storedRole = localStorage.getItem('userRole')
      const userRole = user?.publicMetadata?.role || storedRole

      if (!userRole) {
        router.push('/onboarding')
        return
      }

      if (userRole !== 'member') {
        router.push('/trainer/dashboard')
        return
      }

      setIsAuthorized(true)
    }
  }, [isLoaded, isSignedIn, user, router])

  // 진행 상황 데이터 (실제로는 API에서 가져올 데이터)
  const progressData = {
    weeklyGoal: { current: 4, target: 3 },
    weightLoss: { current: 2.5, target: 5 },
    attendance: { current: 12, target: 15 }
  }

  const handleViewReport = () => {
    console.log('상세 리포트 보기 클릭됨')
  }

  if (!isLoaded || !isAuthorized) {
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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">안녕하세요! 💪</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">오늘도 건강한 하루를 시작해보세요.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-400 mt-2">
            현재 역할: {localStorage.getItem('userRole') || user?.publicMetadata?.role || 'unknown'}
          </p>
        )}
      </div>

      {/* Quick Stats - 모바일 우선 반응형 그리드 */}
      <div className="mb-6 sm:mb-8">
        <MemberStats />
      </div>

      {/* Notifications Section */}
      <div className="mb-6 sm:mb-8">
        <NotificationCard />
      </div>

      {/* Progress Overview */}
      <div className="space-y-6 sm:space-y-8">
        <ProgressOverview 
          progress={progressData}
          onViewReport={handleViewReport}
        />
      </div>
    </DashboardLayout>
  )
}