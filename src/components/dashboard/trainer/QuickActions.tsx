'use client'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  iconColor: string
  onClick: () => void
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: 'new-member',
      label: '새 회원 등록',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      iconColor: 'text-blue-500',
      onClick: () => console.log('새 회원 등록 클릭')
    },
    {
      id: 'workout-plan',
      label: '운동 계획 작성',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconColor: 'text-green-500',
      onClick: () => console.log('운동 계획 작성 클릭')
    },
    {
      id: 'progress-report',
      label: '진행 리포트 보기',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconColor: 'text-purple-500',
      onClick: () => console.log('진행 리포트 보기 클릭')
    },
    {
      id: 'member-messages',
      label: '회원 메시지',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      iconColor: 'text-orange-500',
      onClick: () => console.log('회원 메시지 클릭')
    }
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg sm:text-xl font-medium text-gray-900">빠른 작업</h3>
      </div>
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="w-full text-left p-4 sm:p-5 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[56px] sm:min-h-[64px] touch-manipulation"
          >
            <div className="flex items-center">
              <div className={`${action.iconColor} mr-3 sm:mr-4`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6">
                  {action.icon}
                </div>
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-900">{action.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}