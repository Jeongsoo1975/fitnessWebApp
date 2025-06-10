'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

type UserRole = 'trainer' | 'member'

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // URL parameter로 강제 onboarding 모드 확인
  const forceOnboarding = searchParams.get('force') === 'true'

  // Check authentication status and redirect if necessary
  useEffect(() => {
    if (!isLoaded) return // Clerk가 로딩 중이면 대기
    
    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }

    // forceOnboarding이 true면 기존 역할 무시하고 onboarding 진행
    if (forceOnboarding) return

    // localStorage에서 역할 확인
    const storedRole = localStorage.getItem('userRole') as UserRole | null
    const userRole = user?.publicMetadata?.role as UserRole || storedRole
    
    if (userRole) {
      const targetUrl = userRole === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
      router.push(targetUrl)
    }
  }, [isLoaded, isSignedIn, user, router, forceOnboarding])

  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !isSignedIn) return
    
    setIsLoading(true)
    
    try {
      // localStorage에 역할 저장 (즉시 사용 가능)
      localStorage.setItem('userRole', selectedRole)
      
      // Update user metadata using API route (백그라운드에서 실행)
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      // API 실패해도 localStorage는 유지하고 계속 진행
      if (!response.ok) {
        console.warn('API 요청 실패, localStorage로 계속 진행')
      }
      
      // 즉시 대시보드로 이동
      const targetUrl = selectedRole === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
      router.push(targetUrl)
      
    } catch (error) {
      console.error('역할 업데이트 실패:', error)
      // 에러가 발생해도 localStorage 기반으로 계속 진행
      const targetUrl = selectedRole === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
      router.push(targetUrl)
    }
  }

  // 개발용 localStorage 초기화 함수
  const resetLocalStorage = () => {
    localStorage.clear()
    window.location.href = '/onboarding?force=true'
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // If not signed in, show loading state (will redirect via useEffect)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // Check localStorage for existing role (단, forceOnboarding이 아닐 때만)
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') as UserRole | null : null
  const userRole = user?.publicMetadata?.role as UserRole || storedRole

  // If user already has a role and not forcing onboarding, show loading state (will redirect via useEffect)
  if (userRole && !forceOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* 개발용 리셋 버튼 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center">
            <button
              onClick={resetLocalStorage}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              [개발용] 역할 재선택
            </button>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            역할을 선택해주세요
          </h2>
          <p className="mt-2 text-gray-600">
            FitnessWebApp을 시작하기 위해 역할을 선택하세요
          </p>
        </div>

        <div className="space-y-4">
          {/* Trainer Option */}
          <div 
            className={`cursor-pointer p-6 border-2 rounded-lg transition-all ${
              selectedRole === 'trainer' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRole('trainer')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">트레이너</h3>
                <p className="text-gray-500">
                  회원들의 운동과 식단을 관리하고 PT 세션을 진행합니다
                </p>
              </div>
            </div>
          </div>

          {/* Member Option */}
          <div 
            className={`cursor-pointer p-6 border-2 rounded-lg transition-all ${
              selectedRole === 'member' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRole('member')}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">회원</h3>
                <p className="text-gray-500">
                  개인 운동 계획을 따르고 건강한 라이프스타일을 관리합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || isLoading}
          className={`w-full py-4 px-4 rounded-md font-medium text-lg transition-all ${
            selectedRole && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? '설정 중...' : '시작하기'}
        </button>
      </div>
    </div>
  )
}
