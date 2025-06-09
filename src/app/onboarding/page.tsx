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

  // Check authentication status and redirect if necessary
  useEffect(() => {
    if (isLoaded) {
      // If not signed in, redirect to sign-up
      if (!isSignedIn) {
        router.push('/sign-up')
        return
      }

      // If user already has a role, redirect to appropriate dashboard
      if (user?.publicMetadata?.role) {
        const userRole = user.publicMetadata.role as UserRole
        if (userRole === 'trainer') {
          router.push('/trainer/dashboard')
        } else {
          router.push('/member/dashboard')
        }
        return
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !isSignedIn) return

    setIsLoading(true)
    
    try {
      performanceLogger.startTimer('role-update-total')
      
      // Update user metadata using API route
      const updateDuration = await performanceLogger.measureAsync('clerk-metadata-update', async () => {
        const response = await fetch('/api/user/role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: selectedRole }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update role')
        }

        return await response.json()
      })
      
      performanceLogger.logRoleUpdate(selectedRole, updateDuration || undefined)
      performanceLogger.endTimer('role-update-total')
      
      // Navigate to appropriate dashboard after successful update
      const targetUrl = selectedRole === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
      performanceLogger.logNavigation('/onboarding', targetUrl)
      
      // Force page reload to refresh user data from Clerk
      window.location.href = targetUrl
      
    } catch (error) {
      console.error('Failed to update user role:', error)
      performanceLogger.endTimer('role-update-total')
      
      setIsLoading(false)
      
      // Show error message to user
      alert('역할 설정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  // If user already has a role, show loading state (will redirect via useEffect)
  if (user?.publicMetadata?.role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    )
  }

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
