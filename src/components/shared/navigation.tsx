'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useUserRole } from '@/hooks/useAuth'
import MobileNavigation from './MobileNavigation'

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  current?: boolean
}

const trainerNavigation: NavigationItem[] = [
  {
    name: '대시보드',
    href: '/trainer/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    name: '회원 관리',
    href: '/trainer/members',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'PT 세션',
    href: '/trainer/sessions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: '일정 관리',
    href: '/trainer/schedule',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: '진행 리포트',
    href: '/trainer/reports',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const memberNavigation: NavigationItem[] = [
  {
    name: '대시보드',
    href: '/member/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    name: '운동 일정',
    href: '/member/schedule',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'PT 세션',
    href: '/member/sessions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: '식단 관리',
    href: '/member/diet',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
  },
  {
    name: '진행 현황',
    href: '/member/progress',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

interface NavigationProps {
  children: React.ReactNode
}

export default function Navigation({ children }: NavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { role, isLoading } = useUserRole()

  // 개발용 역할 전환 함수
  const switchRole = () => {
    const newRole = role === 'trainer' ? 'member' : 'trainer'
    localStorage.setItem('userRole', newRole)
    
    // 새로운 역할에 맞는 대시보드로 이동
    const targetUrl = newRole === 'trainer' ? '/trainer/dashboard' : '/member/dashboard'
    window.location.href = targetUrl
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const navigation = role === 'trainer' ? trainerNavigation : memberNavigation
  const roleTitle = role === 'trainer' ? '트레이너' : '회원'
  const roleColor = role === 'trainer' ? 'blue' : 'green'

  // Mark current navigation item
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: pathname === item.href
  }))

  return (
    <>
      {/* 모바일 네비게이션 */}
      <MobileNavigation>
        {children}
      </MobileNavigation>
      
      {/* 데스크탑 네비게이션 */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-lg bg-${roleColor}-600 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">FitnessApp</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <div className="space-y-1">
              {updatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? `bg-${roleColor}-50 border-${roleColor}-500 text-${roleColor}-700`
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={`${item.current ? `text-${roleColor}-500` : 'text-gray-400 group-hover:text-gray-500'} mr-3`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className={`h-8 w-8 rounded-lg bg-${roleColor}-600 flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">FitnessApp</span>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {updatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? `bg-${roleColor}-50 border-${roleColor}-500 text-${roleColor}-700`
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-3 py-2 text-sm font-medium border-l-4 rounded-r-md`}
                >
                  <span className={`${item.current ? `text-${roleColor}-500` : 'text-gray-400 group-hover:text-gray-500'} mr-3`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation - 데스크탑에서만 표시 */}
        <div className="hidden lg:flex sticky top-0 z-40 h-16 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {roleTitle} 대시보드
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {/* 개발용 역할 전환 버튼 */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={switchRole}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md border transition-colors"
                  title={`현재: ${role === 'trainer' ? '트레이너' : '회원'} | 클릭하여 ${role === 'trainer' ? '회원' : '트레이너'}으로 전환`}
                >
                  현재: {role === 'trainer' ? '트레이너' : '회원'} → {role === 'trainer' ? '회원' : '트레이너'}
                </button>
              )}
              
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </>
  )
}