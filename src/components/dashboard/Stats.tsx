'use client'

import React, { memo } from 'react'
import { SkeletonDashboardStats } from '@/components/shared/SkeletonUI'

interface StatsData {
  ptSessions: number
  weeklyWorkouts: number
  currentWeight: number
  weightLoss: number
  consecutiveDays: number
}

interface DashboardStatsProps {
  data?: StatsData
  isLoading?: boolean
}

const DashboardStats = memo(function DashboardStats({ data, isLoading = false }: DashboardStatsProps) {
  if (isLoading || !data) {
    return <SkeletonDashboardStats />
  }

  const stats = [
    {
      name: '남은 PT 세션',
      value: `${data.ptSessions}회`,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      description: '이번 달 구매한 세션',
      descriptionColor: 'text-blue-600'
    },
    {
      name: '이번 주 운동',
      value: `${data.weeklyWorkouts}회`,
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      description: '목표 달성! (목표: 3회)',
      descriptionColor: 'text-green-600'
    },
    {
      name: '현재 체중',
      value: `${data.currentWeight}kg`,
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      description: `-${data.weightLoss}kg 시작 대비`,
      descriptionColor: 'text-green-600'
    },
    {
      name: '연속 운동일',
      value: `${data.consecutiveDays}일`,
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      bgColor: 'bg-orange-100',
      description: '최고 기록!',
      descriptionColor: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-md flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <span className={`${stat.descriptionColor} font-medium`}>
                {stat.description.split(' ')[0]}
              </span>
              <span className="text-gray-500"> {stat.description.split(' ').slice(1).join(' ')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

export default DashboardStats
