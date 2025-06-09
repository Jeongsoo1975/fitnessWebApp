'use client'

import React, { memo } from 'react'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

interface QuickActionsProps {
  actions?: QuickAction[]
  isLoading?: boolean
}

const QuickActions = memo(function QuickActions({ actions, isLoading = false }: QuickActionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const defaultActions: QuickAction[] = [
    {
      id: 'workout-check',
      label: '운동 완료 체크',
      icon: (
        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => console.log('Workout check clicked')
    },
    {
      id: 'diet-record',
      label: '식단 기록하기',
      icon: (
        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      onClick: () => console.log('Diet record clicked')
    },
    {
      id: 'progress-report',
      label: '진행 리포트 보기',
      icon: (
        <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => console.log('Progress report clicked')
    },
    {
      id: 'weight-record',
      label: '체중 기록하기',
      icon: (
        <svg className="w-5 h-5 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => console.log('Weight record clicked')
    }
  ]

  const actionList = actions || defaultActions

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">빠른 작업</h3>
      </div>
      <div className="p-6 space-y-3">
        {actionList.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              {action.icon}
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
})

export default QuickActions
