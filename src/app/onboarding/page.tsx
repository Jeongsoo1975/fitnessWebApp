'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

type UserRole = 'trainer' | 'member'
type OnboardingStep = 'role-selection' | 'profile-completion' | 'completed'

interface ProfileData {
  specialties: string[]
  experience: number
  goals: string[]
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null
}

// Search params를 사용하는 컴포넌트를 별도로 분리
function OnboardingContent() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Core state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role-selection')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Profile completion state
  const [profileData, setProfileData] = useState<ProfileData>({
    specialties: [],
    experience: 0,
    goals: [],
    fitnessLevel: null
  })

  // URL parameter로 강제 onboarding 모드 확인
  const forceOnboarding = searchParams.get('force') === 'true'

  // Check user profile status from API
  const checkUserProfileStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/user/role', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const userData = await response.json() as any
        
        if (userData.data?.role) {
          // User has a role, check profile completeness
          const profileResponse = await fetch('/api/user/profile', {
            method: 'POST', // POST for completeness check
            headers: { 'Content-Type': 'application/json' }
          })

          if (profileResponse.ok) {
            const profileData = await profileResponse.json() as any
            
            if (profileData.data?.isComplete) {
              // Profile is complete, redirect to dashboard
              const targetUrl = userData.data.role === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
              router.push(targetUrl)
              return
            } else if (profileData.data?.completeness > 50) {
              // Profile partially complete, may skip to dashboard
              const targetUrl = userData.data.role === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
              router.push(targetUrl)
              return
            }
          }
        }
      }
    } catch {
      console.log('Profile status check failed, proceeding with onboarding')
    }
  }, [router])

  // Check authentication status and redirect if necessary
  useEffect(() => {
    if (!isLoaded) return // Clerk가 로딩 중이면 대기
    
    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }

    // forceOnboarding이 true면 기존 역할 무시하고 onboarding 진행
    if (forceOnboarding) return

    // Check if user already has complete profile
    checkUserProfileStatus()
  }, [isLoaded, isSignedIn, user, router, forceOnboarding, checkUserProfileStatus])

  // Prevent browser back button during onboarding
  useEffect(() => {
    const preventBackButton = (e: PopStateEvent) => {
      e.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }

    if (currentStep !== 'role-selection') {
      window.history.pushState(null, '', window.location.href)
      window.addEventListener('popstate', preventBackButton)
    }

    return () => {
      window.removeEventListener('popstate', preventBackButton)
    }
  }, [currentStep])

  // Handle role selection
  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !isSignedIn) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Step 1: Save role to database via API
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(errorData.message || 'Role assignment failed')
      }

      const result = await response.json() as any
      console.log('Role assigned successfully:', result)

      // Step 2: Move to profile completion
      setCurrentStep('profile-completion')
      
    } catch (error) {
      console.error('역할 설정 실패:', error)
      setError(error instanceof Error ? error.message : '역할 설정 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle profile completion
  const handleProfileCompletion = async () => {
    if (!selectedRole) return

    setIsLoading(true)
    setError(null)

    try {
      const updateData: any = {}

      if (selectedRole === 'trainer') {
        if (profileData.specialties.length === 0) {
          throw new Error('전문분야를 최소 1개 이상 선택해주세요')
        }
        updateData.specialties = profileData.specialties
        updateData.experience = profileData.experience
      } else if (selectedRole === 'member') {
        if (profileData.goals.length === 0) {
          throw new Error('운동 목표를 최소 1개 이상 선택해주세요')
        }
        if (!profileData.fitnessLevel) {
          throw new Error('운동 수준을 선택해주세요')
        }
        updateData.goals = profileData.goals
        updateData.fitnessLevel = profileData.fitnessLevel
      }

      // Update profile via API
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(errorData.message || 'Profile update failed')
      }

      const result = await response.json() as any
      console.log('Profile updated successfully:', result)

      // Step 3: Mark as completed and redirect
      setCurrentStep('completed')
      
      // Small delay for UX, then redirect
      setTimeout(() => {
        const targetUrl = selectedRole === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
        router.push(targetUrl)
      }, 1500)

    } catch (error) {
      console.error('프로필 완성 실패:', error)
      setError(error instanceof Error ? error.message : '프로필 완성 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset onboarding (dev only)
  const resetOnboarding = () => {
    setCurrentStep('role-selection')
    setSelectedRole(null)
    setProfileData({
      specialties: [],
      experience: 0,
      goals: [],
      fitnessLevel: null
    })
    setError(null)
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

  // Progress bar component
  const ProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: currentStep === 'role-selection' ? '33%' : 
                 currentStep === 'profile-completion' ? '66%' : '100%' 
        }}
      ></div>
    </div>
  )

  // Step 1: Role Selection
  if (currentStep === 'role-selection') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          {/* Dev reset button */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-center">
              <button
                onClick={resetOnboarding}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                [개발용] 온보딩 재시작
              </button>
            </div>
          )}

          <ProgressBar />

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              역할을 선택해주세요
            </h2>
            <p className="mt-2 text-gray-600">
              FitnessWebApp을 시작하기 위해 역할을 선택하세요
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

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
            {isLoading ? '설정 중...' : '다음 단계'}
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Profile Completion
  if (currentStep === 'profile-completion') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <ProgressBar />

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              프로필을 완성해주세요
            </h2>
            <p className="mt-2 text-gray-600">
              {selectedRole === 'trainer' 
                ? '트레이너 정보를 입력하여 프로필을 완성하세요'
                : '회원 정보를 입력하여 프로필을 완성하세요'
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {selectedRole === 'trainer' && (
              <>
                {/* Trainer Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전문분야 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['웨이트 트레이닝', '요가', '필라테스', '크로스핏', '재활 운동', '유산소'].map(specialty => (
                      <label key={specialty} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profileData.specialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfileData(prev => ({
                                ...prev,
                                specialties: [...prev.specialties, specialty]
                              }))
                            } else {
                              setProfileData(prev => ({
                                ...prev,
                                specialties: prev.specialties.filter(s => s !== specialty)
                              }))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Trainer Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    경력 (년) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={profileData.experience}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      experience: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 3"
                  />
                </div>
              </>
            )}

            {selectedRole === 'member' && (
              <>
                {/* Member Goals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운동 목표 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {['체중 감량', '근육 증가', '체력 향상', '건강 관리', '스트레스 해소', '재활'].map(goal => (
                      <label key={goal} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={profileData.goals.includes(goal)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfileData(prev => ({
                                ...prev,
                                goals: [...prev.goals, goal]
                              }))
                            } else {
                              setProfileData(prev => ({
                                ...prev,
                                goals: prev.goals.filter(g => g !== goal)
                              }))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Member Fitness Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운동 수준 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'beginner', label: '초급자', desc: '운동 경험이 거의 없음' },
                      { value: 'intermediate', label: '중급자', desc: '규칙적으로 운동하고 있음' },
                      { value: 'advanced', label: '고급자', desc: '오랜 운동 경험과 높은 수준' }
                    ].map(level => (
                      <label key={level.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="fitnessLevel"
                          value={level.value}
                          checked={profileData.fitnessLevel === level.value}
                          onChange={(e) => setProfileData(prev => ({
                            ...prev,
                            fitnessLevel: e.target.value as any
                          }))}
                          className="focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{level.label}</div>
                          <div className="text-sm text-gray-500">{level.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleProfileCompletion}
            disabled={isLoading}
            className={`w-full py-4 px-4 rounded-md font-medium text-lg transition-all ${
              !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? '완성 중...' : '프로필 완성'}
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Completion
  if (currentStep === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <ProgressBar />

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              환영합니다!
            </h2>
            <p className="mt-2 text-gray-600">
              프로필 설정이 완료되었습니다. 잠시 후 대시보드로 이동합니다.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">대시보드로 이동 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// Loading fallback component
function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}

// Main export with Suspense boundary
export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingContent />
    </Suspense>
  )
}
