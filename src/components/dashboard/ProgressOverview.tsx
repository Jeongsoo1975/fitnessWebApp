'use client'

import React, { memo } from 'react'

interface ProgressData {
  weeklyGoal: { current: number; target: number }
  weightLoss: { current: number; target: number }
  attendance: { current: number; target: number }
}

interface ProgressOverviewProps {
  progress?: ProgressData
  isLoading?: boolean
  onViewReport?: () => void
}

const ProgressOverview = memo(function ProgressOverview({ 
  progress, 
  isLoading = false, 
  onViewReport 
}: ProgressOverviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse">
                  <div className="bg-gray-300 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const defaultProgress: ProgressData = {
    weeklyGoal: { current: 4, target: 3 },
    weightLoss: { current: 2.5, target: 5 },
    attendance: { current: 12, target: 15 }
  }

  const progressData = progress || defaultProgress

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return 'bg-green-600'
    if (percentage >= 80) return 'bg-blue-600'
    if (percentage >= 60) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const progressItems = [
    {
      label: '주간 운동 목표',
      current: progressData.weeklyGoal.current,
      target: progressData.weeklyGoal.target,
      unit: '회'
    },
    {
      label: '체중 감량 목표',
      current: progressData.weightLoss.current,
      target: progressData.weightLoss.target,
      unit: 'kg'
    },
    {
      label: '이번 달 출석',
      current: progressData.attendance.current,
      target: progressData.attendance.target,
      unit: '일'
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">진행 상황</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {progressItems.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{item.label}</span>
                <span className="text-sm text-gray-500">
                  {item.current}/{item.target}{item.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.current, item.target)}`}
                  style={{width: `${getProgressPercentage(item.current, item.target)}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button 
            onClick={onViewReport}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            상세 리포트 보기 →
          </button>
        </div>
      </div>
    </div>
  )
})

export default ProgressOverview
