'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useKeyboardNavigation, useScreenReader, useAriaState } from '@/hooks/useAccessibility'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { 
  HomeIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/react/24/solid'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  iconSolid: React.ComponentType<{ className?: string }>
  badge?: number
  disabled?: boolean
  ariaLabel?: string
}

interface AccessibleNavigationProps {
  userRole: 'trainer' | 'member'
  onNavigate?: (path: string) => void
}

export default function AccessibleNavigation({ userRole, onNavigate }: AccessibleNavigationProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { announceNavigation } = useScreenReader()
  
  // ARIA 상태 관리
  const { ariaState, updateAriaState, getAriaProps } = useAriaState({
    'aria-label': `${userRole} 메인 네비게이션`,
    role: 'navigation'
  })

  // 키보드 네비게이션 설정
  const { focusElement } = useKeyboardNavigation(['a', 'button'])

  // 역할별 네비게이션 메뉴
  const navigationItems: NavigationItem[] = userRole === 'trainer' ? [
    {
      id: 'dashboard',
      label: '대시보드',
      href: '/trainer/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      ariaLabel: '트레이너 대시보드로 이동'
    },
    {
      id: 'schedule',
      label: '일정 관리',
      href: '/schedule',
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
      badge: 3,
      ariaLabel: '일정 관리 페이지로 이동, 3개의 새로운 일정'
    },
    {
      id: 'members',
      label: '회원 관리',
      href: '/trainer/members',
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
      ariaLabel: '회원 관리 페이지로 이동'
    },
    {
      id: 'analytics',
      label: '분석',
      href: '/trainer/analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      ariaLabel: '분석 페이지로 이동'
    },
    {
      id: 'settings',
      label: '설정',
      href: '/trainer/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
      ariaLabel: '설정 페이지로 이동'
    }
  ] : [
    {
      id: 'dashboard',
      label: '대시보드',
      href: '/member/dashboard',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      ariaLabel: '회원 대시보드로 이동'
    },
    {
      id: 'workout',
      label: '운동하기',
      href: '/workout',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      ariaLabel: '운동 추적 페이지로 이동'
    },
    {
      id: 'schedule',
      label: '일정',
      href: '/schedule',
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
      ariaLabel: '내 일정 보기'
    },
    {
      id: 'profile',
      label: '프로필',
      href: '/member/profile',
      icon: UserCircleIcon,
      iconSolid: UserCircleIconSolid,
      ariaLabel: '내 프로필 보기'
    },
    {
      id: 'settings',
      label: '설정',
      href: '/member/settings',
      icon: Cog6ToothIcon,
      iconSolid: Cog6ToothIconSolid,
      ariaLabel: '설정 페이지로 이동'
    }
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleNavigation = (item: NavigationItem) => {
    announceNavigation(item.label)
    onNavigate?.(item.href)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    updateAriaState({ 'aria-expanded': !isMobileMenuOpen })
  }

  // 키보드 단축키 설정
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + 숫자키로 메뉴 바로가기
      if (event.altKey && event.key >= '1' && event.key <= '5') {
        event.preventDefault()
        const index = parseInt(event.key) - 1
        if (navigationItems[index]) {
          const item = navigationItems[index]
          if (!item.disabled) {
            window.location.href = item.href
            announceNavigation(item.label)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigationItems, announceNavigation])

  if (isMobile) {
    return (
      <>
        {/* 모바일 햄버거 메뉴 버튼 */}
        <button
          onClick={toggleMobileMenu}
          className="mobile-button-small bg-gray-100 text-gray-700 fixed top-4 left-4 z-50"
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <Bars3Icon className="w-5 h-5" />
          )}
        </button>

        {/* 모바일 네비게이션 오버레이 */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* 모바일 네비게이션 사이드바 */}
        <nav
          id="mobile-navigation"
          className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 safe-area-inset ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          {...getAriaProps()}
        >
          <div className="p-4 border-b border-gray-200">
            <h2 className="mobile-subheading">{userRole === 'trainer' ? '트레이너' : '회원'} 메뉴</h2>
          </div>
          
          <ul className="p-4 space-y-2" role="list">
            {navigationItems.map((item, index) => {
              const Icon = isActive(item.href) ? item.iconSolid : item.icon
              
              return (
                <li key={item.id} role="listitem">
                  <Link
                    href={item.href}
                    onClick={() => handleNavigation(item)}
                    className={`mobile-nav-item w-full text-left transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 text-gray-700'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={item.ariaLabel || item.label}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    aria-disabled={item.disabled}
                    tabIndex={item.disabled ? -1 : 0}
                  >
                    <Icon className="mobile-nav-icon" aria-hidden="true" />
                    <span className="mobile-nav-label">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span 
                        className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                        aria-label={`${item.badge}개의 알림`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* 키보드 단축키 안내 */}
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-50 rounded-lg">
            <p className="mobile-caption text-gray-600 mb-2">키보드 단축키</p>
            <ul className="mobile-caption text-gray-500 space-y-1">
              <li>Alt + 1~5: 메뉴 바로가기</li>
              <li>Tab: 다음 요소</li>
              <li>Shift + Tab: 이전 요소</li>
            </ul>
          </div>
        </nav>

        {/* 하단 고정 네비게이션 바 (주요 메뉴만) */}
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-30"
          aria-label="주요 네비게이션"
        >
          <div className="grid grid-cols-4 gap-1 p-2">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = isActive(item.href) ? item.iconSolid : item.icon
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavigation(item)}
                  className={`mobile-nav-item relative ${
                    isActive(item.href)
                      ? 'text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className="mobile-nav-icon" aria-hidden="true" />
                  <span className="mobile-nav-label">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span 
                      className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none"
                      aria-label={`${item.badge}개의 알림`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </>
    )
  }

  // 데스크톱 네비게이션
  return (
    <nav 
      className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-30"
      {...getAriaProps()}
    >
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          {userRole === 'trainer' ? '트레이너' : '회원'} 대시보드
        </h1>
      </div>

      <ul className="p-4 space-y-2" role="list">
        {navigationItems.map((item, index) => {
          const Icon = isActive(item.href) ? item.iconSolid : item.icon
          
          return (
            <li key={item.id} role="listitem">
              <Link
                href={item.href}
                onClick={() => handleNavigation(item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all touch-target ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 text-gray-700'
                } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={item.ariaLabel || item.label}
                aria-current={isActive(item.href) ? 'page' : undefined}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : 0}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span 
                    className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
                    aria-label={`${item.badge}개의 알림`}
                  >
                    {item.badge}
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  Alt+{index + 1}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {/* 접근성 정보 */}
      <div className="absolute bottom-4 left-4 right-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">접근성 기능</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Alt + 숫자: 메뉴 바로가기</li>
          <li>• Tab/Shift+Tab: 네비게이션</li>
          <li>• Enter/Space: 선택</li>
          <li>• 스크린 리더 지원</li>
        </ul>
      </div>
    </nav>
  )
}