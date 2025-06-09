'use client'

import { Suspense } from 'react'

interface WorkoutSchedule {
  id: string
  title: string
  time: string
  type: 'pt' | 'group' | 'personal'
  trainer?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  location: string
}

function MemberScheduleContent() {
  // 실제로는 API에서 데이터를 가져올 부분
  const todayWorkouts: WorkoutSchedule[] = [
    {
      id: '1',
      title: '개인 PT 세션',
      time: '10:00 - 11:00',
      type: 'pt',
      trainer: '김트레이너',
      status: 'scheduled',
      location: '운동실 A'
    },
    {
      id: '2',
      title: '상체 집중 그룹 클래스',
      time: '19:00 - 20:00',
      type: 'group',
      trainer: '박트레이너',
      status: 'scheduled',
      location: '그룹 운동실'
    }
  ]

  const getTypeLabel = (type: WorkoutSchedule['type']) => {
    switch (type) {
      case 'pt': return 'PT'
      case 'group': return '그룹'
      case 'personal': return '개인'
    }
  }

  const getTypeColor = (type: WorkoutSchedule['type']) => {
    switch (type) {
      case 'pt': return 'bg-blue-100 text-blue-800'
      case 'group': return 'bg-green-100 text-green-800'
      case 'personal': return 'bg-purple-100 text-purple-800'
    }
  }

  const getStatusColor = (status: WorkoutSchedule['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
    }
  }

  const getStatusLabel = (status: WorkoutSchedule['status']) => {
    switch (status) {
      case 'scheduled': return '예정'
      case 'completed': return '완료'
      case 'cancelled': return '취소'
    }
  }

  return (
    <div className="mobile-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="mobile-subheading">오늘의 운동</h3>
        <span className="mobile-caption text-gray-500">
          {todayWorkouts.length}개
        </span>
      </div>

      {todayWorkouts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💪</span>
          </div>
          <p className="mobile-body text-gray-500 mb-4">
            오늘 예정된 운동이 없습니다
          </p>
          <button className="mobile-button bg-blue-600 text-white">
            운동 예약하기
          </button>
        </div>
      ) : (
        <div className="mobile-spacing-compact">
          {todayWorkouts.map((workout) => (
            <div key={workout.id} className="mobile-card-compact bg-gray-50 border-l-4 border-blue-500 touch-target-large transition-all active:scale-95">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(workout.type)}`}>
                      {getTypeLabel(workout.type)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workout.status)}`}>
                      {getStatusLabel(workout.status)}
                    </span>
                  </div>
                  
                  <h4 className="mobile-body font-medium text-gray-900 mb-1">
                    {workout.title}
                  </h4>
                  
                  <div className="mobile-caption text-gray-500 space-y-1">
                    <p>⏰ {workout.time}</p>
                    {workout.trainer && <p>👨‍💼 {workout.trainer}</p>}
                    <p>📍 {workout.location}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {workout.status === 'scheduled' && (
                    <>
                      <button className="mobile-button-small bg-green-600 text-white">
                        체크인
                      </button>
                      <button className="mobile-button-small bg-gray-200 text-gray-800">
                        취소
                      </button>
                    </>
                  )}
                  {workout.status === 'completed' && (
                    <button className="mobile-button-small bg-blue-600 text-white">
                      기록 보기
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <a 
            href="/schedule"
            className="mobile-button bg-blue-600 text-white text-center"
          >
            전체 일정
          </a>
          <button className="mobile-button bg-green-600 text-white">
            운동 예약
          </button>
        </div>
      </div>
    </div>
  )
}

function MemberScheduleSkeleton() {
  return (
    <div className="mobile-card">
      <div className="flex items-center justify-between mb-4">
        <div className="mobile-skeleton h-6 w-28"></div>
        <div className="mobile-skeleton h-4 w-8"></div>
      </div>
      <div className="mobile-spacing-compact">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="mobile-card-compact bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  <div className="mobile-skeleton h-5 w-8 rounded-full"></div>
                  <div className="mobile-skeleton h-5 w-10 rounded-full"></div>
                </div>
                <div className="mobile-skeleton h-4 w-32 mb-2"></div>
                <div className="space-y-1">
                  <div className="mobile-skeleton h-3 w-24"></div>
                  <div className="mobile-skeleton h-3 w-20"></div>
                  <div className="mobile-skeleton h-3 w-16"></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <div className="mobile-skeleton h-8 w-16"></div>
                <div className="mobile-skeleton h-8 w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <div className="mobile-skeleton h-12 rounded-lg"></div>
          <div className="mobile-skeleton h-12 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

export default function MemberTodaySchedule() {
  return (
    <Suspense fallback={<MemberScheduleSkeleton />}>
      <MemberScheduleContent />
    </Suspense>
  )
}