'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
  onAddSchedule: (schedule: any) => void
}

export default function AddScheduleModal({ 
  isOpen, 
  onClose, 
  selectedDate = new Date(),
  onAddSchedule 
}: AddScheduleModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'pt' as 'pt' | 'group' | 'personal' | 'break',
    memberName: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newSchedule = {
      id: Date.now().toString(),
      ...formData,
      date: selectedDate.toISOString().split('T')[0],
      status: 'scheduled' as const,
      color: formData.type === 'pt' ? 'blue' : 
             formData.type === 'group' ? 'green' : 
             formData.type === 'personal' ? 'purple' : 'gray'
    }
    
    onAddSchedule(newSchedule)
    onClose()
    
    // 폼 초기화
    setFormData({
      title: '',
      type: 'pt',
      memberName: '',
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    })
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeString)
      }
    }
    return options
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
        <div className="relative w-full max-w-lg transform bg-white transition-all sm:rounded-lg">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <h3 className="mobile-subheading">새 일정 추가</h3>
            <button
              onClick={onClose}
              className="touch-target p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* 모달 컨텐츠 */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            {/* 날짜 표시 */}
            <div className="mobile-card-compact bg-blue-50">
              <p className="mobile-body text-blue-800">
                📅 {selectedDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>

            {/* 일정 유형 */}
            <div className="mobile-form-group">
              <label className="mobile-form-label">일정 유형</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { value: 'pt', label: 'PT 세션', color: 'blue' },
                  { value: 'group', label: '그룹 수업', color: 'green' },
                  { value: 'personal', label: '개인 운동', color: 'purple' },
                  { value: 'break', label: '휴식/점심', color: 'gray' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`touch-target p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div className="mobile-form-group">
              <label className="mobile-form-label">제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mobile-input w-full"
                placeholder="일정 제목을 입력하세요"
                required
              />
            </div>

            {/* 회원명 (PT, 개인 운동인 경우) */}
            {(formData.type === 'pt' || formData.type === 'personal') && (
              <div className="mobile-form-group">
                <label className="mobile-form-label">
                  {formData.type === 'pt' ? '회원명' : '참여자'}
                </label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  className="mobile-input w-full"
                  placeholder="이름을 입력하세요"
                />
              </div>
            )}

            {/* 시간 선택 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mobile-form-group">
                <label className="mobile-form-label">시작 시간 *</label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="mobile-input w-full"
                  required
                >
                  <option value="">선택하세요</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              
              <div className="mobile-form-group">
                <label className="mobile-form-label">종료 시간 *</label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="mobile-input w-full"
                  required
                >
                  <option value="">선택하세요</option>
                  {generateTimeOptions().map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 장소 */}
            <div className="mobile-form-group">
              <label className="mobile-form-label">장소</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mobile-input w-full"
                placeholder="운동실 A, 그룹 운동실 등"
              />
            </div>

            {/* 메모 */}
            <div className="mobile-form-group">
              <label className="mobile-form-label">메모</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mobile-input w-full resize-none"
                rows={3}
                placeholder="추가 정보나 특이사항을 입력하세요"
              />
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="mobile-button flex-1 bg-gray-200 text-gray-800"
              >
                취소
              </button>
              <button
                type="submit"
                className="mobile-button flex-1 bg-blue-600 text-white"
              >
                일정 추가
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}