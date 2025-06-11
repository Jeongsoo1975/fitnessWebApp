'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import MemberRequestModal from './MemberRequestModal'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  isRegistered?: boolean
}

interface MemberSearchComponentProps {
  onRequestSent?: (memberId: string) => void
}

export default function MemberSearchComponent({ onRequestSent }: MemberSearchComponentProps) {
  const { getToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Member[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 회원 검색
  const searchMembers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      setError(null)

      const response = await fetch(`/api/trainer/member-search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('검색에 실패했습니다.')
      }

      const data = await response.json() as any
      setSearchResults(data.members || [])
    } catch (error) {
      console.error('Error searching members:', error)
      setError('회원 검색에 실패했습니다.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 등록 요청 모달 열기
  const handleRequestClick = (member: Member) => {
    setSelectedMember(member)
    setIsModalOpen(true)
  }

  // 등록 요청 성공 처리
  const handleRequestSuccess = (memberId: string) => {
    // 검색 결과에서 해당 회원 제거
    setSearchResults(prev => prev.filter(member => member.id !== memberId))
    setIsModalOpen(false)
    setSelectedMember(null)
    
    // 부모 컴포넌트에 알림
    if (onRequestSent) {
      onRequestSent(memberId)
    }
  }

  // 검색어 변경 시 자동 검색 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMembers()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <>
      <div className="space-y-4">
        {/* 검색 입력 필드 */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 이메일로 회원을 검색하세요..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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

        {/* 검색 결과 */}
        <div className="space-y-3">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                {searchQuery ? '검색 결과가 없습니다' : '검색어를 입력하세요'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? '다른 검색어로 시도해보세요.' : '이름 또는 이메일로 회원을 검색할 수 있습니다.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                검색 결과 {searchResults.length}명
              </p>
              {searchResults.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* 회원 아바타 */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {member.firstName[0]}
                          </span>
                        </div>
                      </div>
                      
                      {/* 회원 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    {/* 등록 요청 버튼 */}
                    <button
                      onClick={() => handleRequestClick(member)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <UserPlusIcon className="h-4 w-4 mr-1" />
                      등록 요청
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 등록 요청 모달 */}
      <MemberRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMember(null)
        }}
        member={selectedMember}
        onSuccess={handleRequestSuccess}
      />
    </>
  )
}
