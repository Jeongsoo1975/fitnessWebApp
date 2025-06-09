'use client'

import React, { memo } from 'react'
import { SkeletonTrainerInfo } from '@/components/shared/SkeletonUI'

interface TrainerData {
  name: string
  experience: string
  specialty: string
  avatar?: string
}

interface TrainerInfoProps {
  trainer?: TrainerData
  isLoading?: boolean
  onSendMessage?: () => void
  onScheduleSession?: () => void
}

const TrainerInfo = memo(function TrainerInfo({ 
  trainer, 
  isLoading = false, 
  onSendMessage, 
  onScheduleSession 
}: TrainerInfoProps) {
  if (isLoading || !trainer) {
    return <SkeletonTrainerInfo />
  }

  const getInitials = (name: string) => {
    return name.charAt(0)
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">담당 트레이너</h3>
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {trainer.avatar ? (
              <img 
                src={trainer.avatar} 
                alt={trainer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-medium text-lg">
                {getInitials(trainer.name)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{trainer.name}</p>
            <p className="text-sm text-gray-500">{trainer.experience} • {trainer.specialty}</p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <button 
            onClick={onSendMessage}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">메시지 보내기</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
          
          <button 
            onClick={onScheduleSession}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">일정 예약하기</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
})

export default TrainerInfo
