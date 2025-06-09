'use client'

import { Suspense } from 'react'
import StatCard from '../StatCard'
import { StatCardSkeleton } from '@/components/ui/skeleton'

// 서버에서 데이터를 가져오는 함수 (실제로는 API 호출)
async function getTrainerStats() {
  // 실제 API 호출로 대체될 부분
  return {
    totalMembers: { current: 12, change: '+2명', changeColor: 'text-green-600', description: '지난주 대비' },
    todaySessions: { current: 8, completed: 6, scheduled: 2 },
    monthlyRevenue: { current: '₩2,850,000', change: '+12%', changeColor: 'text-green-600', description: '지난달 대비' },
    avgSessionTime: { current: '52분', target: '60분' }
  }
}

function TrainerStatsGrid() {
  // 실제로는 useState나 SWR/React Query 등으로 데이터 관리
  const stats = {
    totalMembers: { current: 12, change: '+2명', changeColor: 'text-green-600', description: '지난주 대비' },
    todaySessions: { current: 8, completed: 6, scheduled: 2 },
    monthlyRevenue: { current: '₩2,850,000', change: '+12%', changeColor: 'text-green-600', description: '지난달 대비' },
    avgSessionTime: { current: '52분', target: '60분' }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="등록 회원"
        value={`${stats.totalMembers.current}명`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        }
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        change={{
          value: stats.totalMembers.change,
          color: stats.totalMembers.changeColor,
          description: stats.totalMembers.description
        }}
      />

      <StatCard
        title="오늘 세션"
        value={`${stats.todaySessions.current}건`}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        change={{
          value: `${stats.todaySessions.completed}건 완료`,
          color: 'text-blue-600',
          description: `/ ${stats.todaySessions.scheduled}건 예정`
        }}
      />

      <StatCard
        title="이번 달 수익"
        value={stats.monthlyRevenue.current}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        change={{
          value: stats.monthlyRevenue.change,
          color: stats.monthlyRevenue.changeColor,
          description: stats.monthlyRevenue.description
        }}
      />

      <StatCard
        title="평균 세션 시간"
        value={stats.avgSessionTime.current}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconBgColor="bg-orange-100"
        iconColor="text-orange-600"
        change={{
          value: `목표: ${stats.avgSessionTime.target}`,
          color: 'text-gray-600'
        }}
      />
    </div>
  )
}

export default function TrainerStats() {
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
      <TrainerStatsGrid />
    </Suspense>
  )
}