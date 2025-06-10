'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type UserRole = 'trainer' | 'member'

export default function ResetPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 현재 상태 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole')
      const clerkRole = user?.publicMetadata?.role as string
      setCurrentRole(storedRole || clerkRole || 'null')
    }
  }, [user])

  // localStorage 완전 초기화
  const handleCompleteReset = () => {
    if (typeof window !== 'undefined') {
      // 모든 localStorage 데이터 삭제
      localStorage.clear()
      
      // 특정 키들 명시적으로 삭제
      localStorage.removeItem('userRole')
      localStorage.removeItem('lastVisited')
      localStorage.removeItem('authState')
      
      setMessage('✅ 모든 데이터가 초기화되었습니다.')
      setCurrentRole('null')
      
      // 잠시 후 onboarding 페이지로 이동
      setTimeout(() => {
        window.location.href = '/onboarding?force=true'
      }, 1000)
    }
  }

  // 역할만 변경
  const handleRoleChange = async () => {
    if (!selectedRole) return
    
    setIsLoading(true)
    setMessage('')
    
    try {
      // localStorage 업데이트
      localStorage.setItem('userRole', selectedRole)
      
      // API로 Clerk 메타데이터 업데이트 시도
      try {
        const response = await fetch('/api/user/role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: selectedRole }),
        })
        
        if (response.ok) {
          setMessage(`✅ 역할이 ${selectedRole === 'trainer' ? '트레이너' : '회원'}로 변경되었습니다.`)
        } else {
          setMessage(`⚠️ 역할이 임시로 ${selectedRole === 'trainer' ? '트레이너' : '회원'}로 설정되었습니다. (API 오류)`)
        }
      } catch (error) {
        setMessage(`⚠️ 역할이 임시로 ${selectedRole === 'trainer' ? '트레이너' : '회원'}로 설정되었습니다. (네트워크 오류)`)
      }
      
      setCurrentRole(selectedRole)
      
      // 1초 후 해당 대시보드로 이동
      setTimeout(() => {
        const targetUrl = selectedRole === 'trainer' 
          ? '/trainer/dashboard' 
          : '/member/dashboard'
        router.push(targetUrl)
      }, 1000)
      
    } catch (error) {
      setMessage('❌ 역할 변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 강제 로그아웃
  const handleForceSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
      window.location.href = '/sign-in'
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">🔧 사용자 설정 초기화</h1>
            <p className="text-gray-600 mt-2">역할 변경 및 데이터 초기화</p>
          </div>

          {/* 현재 상태 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">현재 상태</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">로그인 상태:</span> {isSignedIn ? '✅ 로그인됨' : '❌ 미로그인'}</p>
              <p><span className="font-medium">현재 역할:</span> {currentRole || 'null'}</p>
              <p><span className="font-medium">Clerk 역할:</span> {user?.publicMetadata?.role as string || 'null'}</p>
              <p><span className="font-medium">localStorage 역할:</span> {typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'null' : 'null'}</p>
            </div>
          </div>

          {/* 메시지 */}
          {message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">{message}</p>
            </div>
          )}

          {/* 역할 변경 */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">역할 변경</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedRole('trainer')}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedRole === 'trainer' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👨‍🏫</span>
                  <div>
                    <p className="font-medium">트레이너</p>
                    <p className="text-sm text-gray-500">회원 관리 및 PT 세션</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('member')}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                  selectedRole === 'member' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💪</span>
                  <div>
                    <p className="font-medium">회원</p>
                    <p className="text-sm text-gray-500">개인 운동 및 건강 관리</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={handleRoleChange}
              disabled={!selectedRole || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedRole && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? '변경 중...' : '역할 변경하기'}
            </button>
          </div>

          {/* 완전 초기화 */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-red-600 mb-4">⚠️ 완전 초기화</h3>
            <button
              onClick={handleCompleteReset}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              모든 데이터 초기화 후 온보딩으로 이동
            </button>
          </div>

          {/* 로그아웃 */}
          <div className="border-t pt-6">
            <button
              onClick={handleForceSignOut}
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              강제 로그아웃
            </button>
          </div>

          {/* 빠른 링크 */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">빠른 이동</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/trainer/dashboard"
                className="py-2 px-3 bg-blue-100 text-blue-700 rounded-lg text-center text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                트레이너 대시보드
              </Link>
              <Link
                href="/member/dashboard"
                className="py-2 px-3 bg-green-100 text-green-700 rounded-lg text-center text-sm font-medium hover:bg-green-200 transition-colors"
              >
                회원 대시보드
              </Link>
              <Link
                href="/trainer/schedule"
                className="py-2 px-3 bg-purple-100 text-purple-700 rounded-lg text-center text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                트레이너 스케줄
              </Link>
              <Link
                href="/onboarding?force=true"
                className="py-2 px-3 bg-orange-100 text-orange-700 rounded-lg text-center text-sm font-medium hover:bg-orange-200 transition-colors"
              >
                온보딩 페이지
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}