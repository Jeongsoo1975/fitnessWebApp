'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { performanceLogger } from '@/lib/performance'

export const dynamic = 'force-dynamic'

type UserRole = 'trainer' | 'member'

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  console.log('[ONBOARDING] Component rendered')
  console.log('[ONBOARDING] isLoaded:', isLoaded)
  console.log('[ONBOARDING] isSignedIn:', isSignedIn)
  console.log('[ONBOARDING] user role:', user?.publicMetadata?.role)

  // Check authentication status and redirect if necessary
  useEffect(() => {
    console.log('[ONBOARDING] useEffect triggered')
    console.log('[ONBOARDING] isLoaded:', isLoaded, 'isSignedIn:', isSignedIn)
    
    if (isLoaded) {
      // If not signed in, redirect to sign-up
      if (!isSignedIn) {
        console.log('[ONBOARDING] Not signed in, redirecting to sign-up')
        router.push('/sign-up')
        return
      }

      // localStorage에서 역할 확인 (임시 해결책)
      const storedRole = localStorage.getItem('userRole') as UserRole | null
      console.log('[ONBOARDING] Stored role from localStorage:', storedRole)

      // If user already has a role in localStorage or publicMetadata, redirect to appropriate dashboard
      const userRole = user?.publicMetadata?.role as UserRole || storedRole
      if (userRole) {
        console.log('[ONBOARDING] User has role:', userRole, 'redirecting to dashboard')
        if (userRole === 'trainer') {
          router.push('/trainer/dashboard')
        } else {
          router.push('/member/dashboard')
        }
        return
      }
      
      console.log('[ONBOARDING] User is signed in but has no role, staying on onboarding')
    }
  }, [isLoaded, isSignedIn, user, router])

  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !isSignedIn) return

    console.log('[ONBOARDING] Role selection started:', selectedRole)
    setIsLoading(true)
    
    try {
      performanceLogger.startTimer('role-update-total')
      
      // localStorage에 역할 저장 (즉시 사용 가능)
      localStorage.setItem('userRole', selectedRole)
      console.log('[ONBOARDING] Role saved to localStorage:', selectedRole)
      
      // Update user metadata using API route (백그라운드에서 실행)
      const updateDuration = await performanceLogger.measureAsync('clerk-metadata-update', async () => {
        console.log('[ONBOARDING] Sending API request to update role')
        const response = await fetch('/api/user/role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: selectedRole }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('[ONBOARDING] API error:', errorData)
          // API 실패해도 localStorage는 유지
          console.log('[ONBOARDING] API failed but localStorage role is preserved')
          return null
        }

        const result = await response.json()
        console.log('[ONBOARDING] API success:', result)
        return result
      })
      
      performanceLogger.logRoleUpdate(selectedRole, updateDuration || undefined)
      performanceLogger.endTimer('role-update-total')
      
      console.log('[ONBOARDING] Role update process completed')
      
      // 즉시 대시보드로 이동 (localStorage 기반)
      const targetUrl = selectedRole === 'trainer' 
        ? '/trainer/dashboard' 
        : '/member/dashboard'
      
      console.log('[ONBOARDING] Navigating to:', targetUrl)
      router.push(targetUrl)
      
    } catch (error) {
      console.error('[ONBOARDING] Failed to update user role:', error)
      performanceLogger.endTimer('role-update-total')
      
      // localStorage는 유지하고 계속 진행
      console.log('[ONBOARDING] Error occurred but localStorage role is preserved')
      const targetUrl = selectedRole === 'trainer' 
        ? '/trainer/dashboard' 
        : '/member/dashboard'
      
      router.push(targetUrl)
    }
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    console.log('[ONBOARDING] Showing loading state - Clerk not loaded')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // If not signed in, show loading state (will redirect via useEffect)
  if (!isSignedIn) {
    console.log('[ONBOARDING] Showing loading state - Not signed in')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // Check localStorage for existing role
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') as UserRole | null : null
  const userRole = user?.publicMetadata?.role as UserRole || storedRole

  // If user already has a role, show loading state (will redirect via useEffect)
  if (userRole) {
    console.log('[ONBOARDING] Showing loading state - User has role, should redirect')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

  console.log('[ONBOARDING] Showing role selection form')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
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
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">트레이너</h3>
                <p className="text-sm text-gray-500">
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
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">회원</h3>
                <p className="text-sm text-gray-500">
                  개인 운동 계획을 따르고 건강한 라이프스타일을 관리합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
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
