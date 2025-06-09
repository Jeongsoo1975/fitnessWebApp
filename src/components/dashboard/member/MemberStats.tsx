'use client'

import { Suspense } from 'react'
import StatCard from '../StatCard'
import { StatCardSkeleton } from '@/components/ui/skeleton'

function MemberStatsGrid() {
  // 실제로는 API에서 데이터를 가져올 부분
  const stats = {
    remainingSessions: { current: 8, description: '이번 달 구매한 세션' },
    weeklyWorkouts: { current: 4, target: 3, status: 'completed' },
    currentWeight: { current: '68.5kg', change: '-2.5kg', description: '시작 대비' },
    streakDays: { current: 12, isRecord: true }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="남은 PT 세션"
        value={`${stats.remainingSessions.current}회`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        change={{
          value: '이번 달',
          color: 'text-blue-600',
          description: stats.remainingSessions.description
        }}
      />

      <StatCard
        title="이번 주 운동"
        value={`${stats.weeklyWorkouts.current}회`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        change={{
          value: '목표 달성!',
          color: 'text-green-600',
          description: `(목표: ${stats.weeklyWorkouts.target}회)`
        }}
      />

      <StatCard
        title="현재 체중"
        value={stats.currentWeight.current}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        change={{
          value: stats.currentWeight.change,
          color: 'text-green-600',
          description: stats.currentWeight.description
        }}
      />

      <StatCard
        title="연속 운동일"
        value={`${stats.streakDays.current}일`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        }
        iconBgColor="bg-orange-100"
        iconColor="text-orange-600"
        change={{
          value: '최고 기록!',
          color: 'text-orange-600'
        }}
      />
    </div>
  )
}

export default function MemberStats() {
  return (
    <Suspense 
      fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <MemberStatsGrid />
    </Suspense>
  )
}