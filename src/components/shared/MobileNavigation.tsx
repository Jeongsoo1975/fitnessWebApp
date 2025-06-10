'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useUserRole } from '@/hooks/useAuth'

interface MobileNavItem {
  name: string
  href: string
  icon: React.ReactNode
  current?: boolean
}

// 트레이너용 모바일 네비게이션 (주요 5개 메뉴)
const trainerMobileNavigation: MobileNavItem[] = [
  {
    name: '홈',
    href: '/trainer/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    name: '회원',
    href: '/trainer/members',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    name: 'PT',
    href: '/trainer/sessions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: '일정',
    href: '/trainer/schedule',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: '리포트',
    href: '/trainer/reports',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

// 회원용 모바일 네비게이션 (주요 5개 메뉴)
const memberMobileNavigation: MobileNavItem[] = [
  {
    name: '홈',
    href: '/member/dashboard',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    name: '일정',
    href: '/member/schedule',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'PT',
    href: '/member/sessions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: '식단',
    href: '/member/diet',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
      </svg>
    ),
  },
  {
    name: '진행',
    href: '/member/progress',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

interface MobileNavigationProps {
  children?: React.ReactNode
}

export default function MobileNavigation({ children }: MobileNavigationProps) {
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
    return null
  }

  const navigation = role === 'trainer' ? trainerMobileNavigation : memberMobileNavigation
  const roleColor = role === 'trainer' ? 'blue' : 'green'

  // Mark current navigation item
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: pathname === item.href
  }))

  return (
    <div className="lg:hidden">
      {/* 상단 헤더 - 고정 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* 로고 */}
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-lg bg-${roleColor}-600 flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">FitnessApp</span>
          </div>
          
          {/* 사용자 프로필 및 개발 도구 */}
          <div className="flex items-center space-x-2">
            {/* 개발용 역할 전환 버튼 */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={switchRole}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-center transition-colors"
                title="개발용: 역할 전환"
              >
                {role === 'trainer' ? '회원' : '트레이너'}
              </button>
            )}
            
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* 하단 탭바 - 고정 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {updatedNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-1 py-2
                transition-colors duration-200 touch-manipulation
                ${item.current 
                  ? `text-${roleColor}-600 bg-${roleColor}-50` 
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
                }
              `}
            >
              <div className={`
                mb-1 transition-colors duration-200
                ${item.current ? `text-${roleColor}-600` : 'text-gray-400'}
              `}>
                {item.icon}
              </div>
              <span className={`
                text-xs font-medium leading-tight
                ${item.current ? `text-${roleColor}-600` : 'text-gray-500'}
              `}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 컨텐츠 영역 - 상단 헤더 + 하단 탭바 공간 확보 */}
      <div className="pt-16 pb-16 min-h-screen">
        {children}
      </div>
    </div>
  )
}