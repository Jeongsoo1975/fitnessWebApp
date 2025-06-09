'use client'

import React, { memo } from 'react'
import { SkeletonWorkoutPlan } from '@/components/shared/SkeletonUI'

interface WorkoutItem {
  id: string
  name: string
  description: string
  status: 'completed' | 'in-progress' | 'pending'
  icon: React.ReactNode
}

interface WorkoutPlanProps {
  workouts?: WorkoutItem[]
  isLoading?: boolean
  onStartWorkout?: () => void
}

const WorkoutPlan = memo(function WorkoutPlan({ 
  workouts, 
  isLoading = false, 
  onStartWorkout 
}: WorkoutPlanProps) {
  if (isLoading || !workouts) {
    return <SkeletonWorkoutPlan />
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'in-progress':
        return '진행중'
      case 'pending':
        return '대기중'
      default:
        return '대기중'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">오늘의 운동 계획</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div 
              key={workout.id}
              className={`flex items-center p-4 rounded-lg ${
                workout.status === 'completed' ? 'bg-blue-50' :
                workout.status === 'in-progress' ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  workout.status === 'completed' ? 'bg-blue-100' :
                  workout.status === 'in-progress' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {workout.icon}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{workout.name}</p>
                    <p className="text-sm text-gray-500">{workout.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(workout.status)}`}>
                      {getStatusLabel(workout.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button 
            onClick={onStartWorkout}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            운동 시작하기
          </button>
        </div>
      </div>
    </div>
  )
})

export default WorkoutPlan
