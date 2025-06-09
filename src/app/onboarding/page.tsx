'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { performanceLogger } from '@/lib/performance'

export const dynamic = 'force-dynamic'

type UserRole = 'trainer' | 'member'

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStoredRole, setCurrentStoredRole] = useState<string | null>(null)

  // URL parameter로 강제 onboarding 모드 확인
  const forceOnboarding = searchParams.get('force') === 'true'

  // localStorage 상태를 실시간으로 추적
  useEffect(() => {
    const updateStoredRole = () => {
      if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole')
        setCurrentStoredRole(role)
        console.log('[ONBOARDING] Current localStorage userRole:', role)
      }
    }

    updateStoredRole()
    
    // localStorage 변경 감지
    window.addEventListener('storage', updateStoredRole)
    
    // 주기적으로 확인 (같은 탭에서 변경 감지)
    const interval = setInterval(updateStoredRole, 1000)

    return () => {
      window.removeEventListener('storage', updateStoredRole)
      clearInterval(interval)
    }
  }, [])

  console.log('[ONBOARDING] Component rendered')
  console.log('[ONBOARDING] isLoaded:', isLoaded)
  console.log('[ONBOARDING] isSignedIn:', isSignedIn)
  console.log('[ONBOARDING] user role:', user?.publicMetadata?.role)
  console.log('[ONBOARDING] forceOnboarding:', forceOnboarding)
  console.log('[ONBOARDING] currentStoredRole:', currentStoredRole)

  // 개발용 localStorage 초기화 함수
  const resetLocalStorage = () => {
    console.log('[ONBOARDING] Before reset - localStorage userRole:', localStorage.getItem('userRole'))
    localStorage.removeItem('userRole')
    localStorage.clear() // 모든 localStorage 데이터 삭제
    console.log('[ONBOARDING] After reset - localStorage userRole:', localStorage.getItem('userRole'))
    setCurrentStoredRole(null)
    // force=true parameter로 onboarding 페이지에 머무르도록 함
    setTimeout(() => {
      window.location.href = '/onboarding?force=true'
    }, 100)
  }

  // Check authentication status and redirect if necessary
  useEffect(() => {
    console.log('[ONBOARDING] useEffect triggered')
    console.log('[ONBOARDING] isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'forceOnboarding:', forceOnboarding)
    
    if (isLoaded) {
      // If not signed in, redirect to sign-up
      if (!isSignedIn) {
        console.log('[ONBOARDING] Not signed in, redirecting to sign-up')
        router.push('/sign-up')
        return
      }

      // forceOnboarding이 true면 기존 역할 무시하고 onboarding 진행
      if (forceOnboarding) {
        console.log('[ONBOARDING] Force onboarding mode - staying on onboarding page')
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
  }, [isLoaded, isSignedIn, user, router, forceOnboarding])

  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !isSignedIn) return

    console.log('[ONBOARDING] Role selection started:', selectedRole)
    console.log('[ONBOARDING] Before setting - localStorage userRole:', localStorage.getItem('userRole'))
    
    setIsLoading(true)
    
    try {
      performanceLogger.startTimer('role-update-total')
      
      // localStorage에 역할 저장 (즉시 사용 가능)
      localStorage.setItem('userRole', selectedRole)
      console.log('[ONBOARDING] Role saved to localStorage:', selectedRole)
      console.log('[ONBOARDING] After setting - localStorage userRole:', localStorage.getItem('userRole'))
      
      // 상태 업데이트
      setCurrentStoredRole(selectedRole)
      
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
          let errorData = { message: `API request failed with status ${response.status}` };
          try {
            // 서버가 JSON 에러를 보냈을 경우를 대비해 파싱 시도
            errorData = await response.json();
          } catch (e) {
            // 파싱에 실패하면 서버가 HTML 등 다른 형식으로 응답한 것
            console.error("Failed to parse API error response as JSON.", e);
          }
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
      
      // 짧은 지연 후 이동 (localStorage 확실히 저장되도록)
      setTimeout(() => {
        const finalStoredRole = localStorage.getItem('userRole')
        console.log('[ONBOARDING] Final check - localStorage userRole:', finalStoredRole)
        
        // 즉시 대시보드로 이동 (localStorage 기반)
        const targetUrl = selectedRole === 'trainer' 
          ? '/trainer/dashboard' 
          : '/member/dashboard'
        
        console.log('[ONBOARDING] Navigating to:', targetUrl)
        router.push(targetUrl)
      }, 500)
      
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

  // Check localStorage for existing role (단, forceOnboarding이 아닐 때만)
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') as UserRole | null : null
  const userRole = user?.publicMetadata?.role as UserRole || storedRole

  // If user already has a role and not forcing onboarding, show loading state (will redirect via useEffect)
  if (userRole && !forceOnboarding) {
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
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 p-4 sm:p-8">
        {/* 개발용 리셋 버튼 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-center space-y-2">
            <button
              onClick={resetLocalStorage}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              [개발용] localStorage 초기화
            </button>
            <div className="text-xs text-gray-500">
              <p>현재 저장된 역할: {currentStoredRole || 'null'}</p>
              <p>선택된 역할: {selectedRole || 'null'}</p>
              <p>Force 모드: {forceOnboarding ? 'true' : 'false'}</p>
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            역할을 선택해주세요
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            FitnessWebApp을 시작하기 위해 역할을 선택하세요
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Trainer Option */}
          <div 
            className={`cursor-pointer p-6 sm:p-8 border-2 rounded-lg transition-all min-h-[140px] sm:min-h-[160px] touch-manipulation ${
              selectedRole === 'trainer' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
            }`}
            onClick={() => setSelectedRole('trainer')}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900">트레이너</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  회원들의 운동과 식단을 관리하고 PT 세션을 진행합니다
                </p>
              </div>
            </div>
          </div>

          {/* Member Option */}
          <div 
            className={`cursor-pointer p-6 sm:p-8 border-2 rounded-lg transition-all min-h-[140px] sm:min-h-[160px] touch-manipulation ${
              selectedRole === 'member' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300 active:border-gray-400'
            }`}
            onClick={() => setSelectedRole('member')}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900">회원</h3>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  개인 운동 계획을 따르고 건강한 라이프스타일을 관리합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || isLoading}
          className={`w-full py-4 sm:py-5 px-4 rounded-md font-medium text-base sm:text-lg transition-all min-h-[48px] sm:min-h-[52px] touch-manipulation ${
            selectedRole && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? '설정 중...' : '시작하기'}
        </button>
      </div>
    </div>
  )
}
