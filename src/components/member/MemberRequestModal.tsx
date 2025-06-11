'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { XMarkIcon, UserIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { showToast } from '@/components/ui/Toast'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  isRegistered?: boolean
}

interface MemberRequestModalProps {
  isOpen: boolean
  onClose: () => void
  member: Member | null
  onSuccess: (memberId: string) => void
}

export default function MemberRequestModal({ 
  isOpen, 
  onClose, 
  member,
  onSuccess 
}: MemberRequestModalProps) {
  const { getToken } = useAuth()
  const [message, setMessage] = useState('안녕하세요! 함께 운동하게 되어 기쁩니다. 건강한 운동 습관을 만들어보아요!')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 등록 요청 전송
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!member) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/trainer/member-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 임시로 Authorization 헤더 제거하여 테스트
          // 'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          memberId: member.id,
          memberEmail: member.email, // 이메일 정보 추가
          memberFirstName: member.firstName, // 이름 정보 추가
          memberLastName: member.lastName, // 성 정보 추가
          message: message.trim() || '함께 운동하게 되어 기쁩니다!'
        })
      })

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(errorData.error || '요청 전송에 실패했습니다.')
      }

      // 성공 처리
      onSuccess(member.id)
      
      // 성공 토스트 알림
      showToast({
        type: 'success',
        title: '등록 요청 전송 완료',
        message: `${member.firstName} ${member.lastName}님에게 등록 요청을 보냈습니다.`
      })
      
      // 폼 초기화
      setMessage('안녕하세요! 함께 운동하게 되어 기쁩니다. 건강한 운동 습관을 만들어보아요!')
      
    } catch (error) {
      console.error('Error sending member request:', error)
      setError(error instanceof Error ? error.message : '요청 전송에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 모달 닫기 처리
  const handleClose = () => {
    setError(null)
    setMessage('안녕하세요! 함께 운동하게 되어 기쁩니다. 건강한 운동 습관을 만들어보아요!')
    onClose()
  }

  if (!isOpen || !member) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <div className="relative w-full max-w-lg transform bg-white transition-all sm:rounded-lg">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">회원 등록 요청</h3>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* 모달 컨텐츠 */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            {/* 회원 정보 표시 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">등록 요청할 회원</h4>
              <div className="flex items-center space-x-3">
                {/* 회원 아바타 */}
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                {/* 회원 상세 정보 */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      {member.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 요청 메시지 입력 */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                요청 메시지
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="회원에게 보낼 인사말을 입력하세요..."
                disabled={isSubmitting}
              />
              <p className="mt-2 text-xs text-gray-500">
                이 메시지는 회원이 등록 요청을 확인할 때 함께 표시됩니다.
              </p>
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

            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    전송 중...
                  </span>
                ) : (
                  '등록 요청 보내기'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
