'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/shared/layout'
import ProgressOverview from '@/components/dashboard/ProgressOverview'

export const dynamic = 'force-dynamic'

export default function MemberDashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    console.log('[MEMBER_DASHBOARD] Effect triggered')
    console.log('[MEMBER_DASHBOARD] isLoaded:', isLoaded, 'isSignedIn:', isSignedIn)
    
    if (isLoaded) {
      if (!isSignedIn) {
        console.log('[MEMBER_DASHBOARD] Not signed in, redirecting to sign-in')
        router.push('/sign-in')
        return
      }

      // localStorage에서 역할 확인
      const storedRole = localStorage.getItem('userRole')
      const userRole = user?.publicMetadata?.role || storedRole

      console.log('[MEMBER_DASHBOARD] User publicMetadata role:', user?.publicMetadata?.role)
      console.log('[MEMBER_DASHBOARD] Stored role from localStorage:', storedRole)
      console.log('[MEMBER_DASHBOARD] Final userRole:', userRole)

      if (!userRole) {
        console.log('[MEMBER_DASHBOARD] No role found, redirecting to onboarding')
        router.push('/onboarding')
        return
      }

      if (userRole !== 'member') {
        console.log('[MEMBER_DASHBOARD] Not a member (role:', userRole, '), redirecting to trainer dashboard')
        router.push('/trainer/dashboard')
        return
      }

      console.log('[MEMBER_DASHBOARD] Member access authorized')
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
    // 상세 리포트 페이지로 이동하는 로직
    console.log('상세 리포트 보기 클릭됨')
  }

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">대시보드 로딩 중...</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500">
              <p>localStorage userRole: {typeof window !== 'undefined' ? localStorage.getItem('userRole') : 'N/A'}</p>
              <p>isLoaded: {isLoaded.toString()}</p>
              <p>isAuthorized: {isAuthorized.toString()}</p>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">안녕하세요! 💪</h1>
        <p className="text-gray-600 mt-1">오늘도 건강한 하루를 시작해보세요.</p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-500 mt-2">
            현재 역할: {localStorage.getItem('userRole') || user?.publicMetadata?.role || 'unknown'}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">남은 PT 세션</dt>
                  <dd className="text-lg font-medium text-gray-900">8회</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-blue-600 font-medium">이번 달</span>
              <span className="text-gray-500"> 구매한 세션</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">이번 주 운동</dt>
                  <dd className="text-lg font-medium text-gray-900">4회</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">목표 달성!</span>
              <span className="text-gray-500"> (목표: 3회)</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">현재 체중</dt>
                  <dd className="text-lg font-medium text-gray-900">68.5kg</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-green-600 font-medium">-2.5kg</span>
              <span className="text-gray-500"> 시작 대비</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">연속 운동일</dt>
                  <dd className="text-lg font-medium text-gray-900">12일</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className="text-orange-600 font-medium">최고 기록!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview - 새로 만든 컴포넌트 사용 */}
      <ProgressOverview 
        progress={progressData}
        onViewReport={handleViewReport}
      />
    </DashboardLayout>
  )
}
