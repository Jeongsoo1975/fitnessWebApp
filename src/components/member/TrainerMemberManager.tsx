'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import MemberSearchComponent from './MemberSearchComponent'

interface TrainerMember {
  id: string
  firstName: string
  lastName: string
  email: string
  requestId?: string
}

export default function TrainerMemberManager() {
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState<'my-members' | 'search'>('my-members')
  const [myMembers, setMyMembers] = useState<TrainerMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 내 회원 목록 로드
  const loadMyMembers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: API 엔드포인트가 구현되면 실제 데이터 로드
      // 현재는 mockDataStore를 직접 호출할 수 없으므로 더미 데이터 사용
      const dummyMembers: TrainerMember[] = [
        {
          id: '1',
          firstName: '김',
          lastName: '회원',
          email: 'member1@example.com',
          requestId: '1'
        },
        {
          id: '5',
          firstName: '정',
          lastName: '회원',
          email: 'member5@example.com',
          requestId: '2'
        }
      ]
      
      setMyMembers(dummyMembers)
    } catch (error) {
      console.error('Error loading my members:', error)
      setError('회원 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 등록 요청 성공 처리
  const handleRequestSent = (memberId: string) => {
    // 알림 표시
    setError(null)
    // 내 회원 목록 새로고침 (새로운 등록 요청이 승인되면 표시될 수 있도록)
    if (activeTab === 'my-members') {
      loadMyMembers()
    }
  }

  // 컴포넌트 마운트 시 내 회원 목록 로드
  useEffect(() => {
    if (activeTab === 'my-members') {
      loadMyMembers()
    }
  }, [activeTab])

  return (
    <div className="bg-white shadow rounded-lg">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('my-members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            내 회원 ({myMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            회원 검색
          </button>
        </nav>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 탭 컨텐츠 */}
      <div className="p-6">
        {activeTab === 'my-members' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">등록된 회원</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myMembers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">등록된 회원이 없습니다</h3>
                <p className="mt-2 text-sm text-gray-500">회원 검색 탭에서 새로운 회원을 찾아보세요.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myMembers.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {member.firstName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        등록됨
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">회원 검색</h3>
            <MemberSearchComponent onRequestSent={handleRequestSent} />
          </div>
        )}
      </div>
    </div>
  )
}
