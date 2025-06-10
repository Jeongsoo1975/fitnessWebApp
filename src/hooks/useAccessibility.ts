'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * 키보드 네비게이션 지원 훅
 */
export function useKeyboardNavigation(
  elements: string[] = ['button', 'a', 'input', 'select', 'textarea'],
  containerRef?: React.RefObject<HTMLElement>
) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const focusableElements = useRef<HTMLElement[]>([])

  const updateFocusableElements = useCallback(() => {
    const container = containerRef?.current || document
    const selector = elements.map(el => 
      `${el}:not([disabled]):not([tabindex="-1"])`
    ).join(', ')
    
    focusableElements.current = Array.from(
      container.querySelectorAll(selector)
    ) as HTMLElement[]
  }, [elements, containerRef])

  const focusElement = useCallback((index: number) => {
    if (index >= 0 && index < focusableElements.current.length) {
      focusableElements.current[index]?.focus()
      setCurrentIndex(index)
    }
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    updateFocusableElements()
    
    switch (event.key) {
      case 'Tab':
        if (!event.shiftKey) {
          // Tab - 다음 요소로
          event.preventDefault()
          const nextIndex = (currentIndex + 1) % focusableElements.current.length
          focusElement(nextIndex)
        } else {
          // Shift+Tab - 이전 요소로
          event.preventDefault()
          const prevIndex = currentIndex <= 0 
            ? focusableElements.current.length - 1 
            : currentIndex - 1
          focusElement(prevIndex)
        }
        break
      
      case 'ArrowDown':
        event.preventDefault()
        const downIndex = Math.min(currentIndex + 1, focusableElements.current.length - 1)
        focusElement(downIndex)
        break
      
      case 'ArrowUp':
        event.preventDefault()
        const upIndex = Math.max(currentIndex - 1, 0)
        focusElement(upIndex)
        break
      
      case 'Home':
        event.preventDefault()
        focusElement(0)
        break
      
      case 'End':
        event.preventDefault()
        focusElement(focusableElements.current.length - 1)
        break
    }
  }, [currentIndex, focusElement, updateFocusableElements])

  useEffect(() => {
    const container = containerRef?.current || document
    container.addEventListener('keydown', handleKeyDown)
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, containerRef])

  return {
    focusElement,
    currentIndex,
    totalElements: focusableElements.current.length
  }
}

/**
 * 스크린 리더 접근성 지원 훅
 */
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof window === 'undefined') return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.setAttribute('role', 'status')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'

    document.body.appendChild(announcement)
    announcement.textContent = message

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const announceNavigation = useCallback((pageName: string) => {
    announce(`${pageName} 페이지로 이동했습니다`, 'polite')
  }, [announce])

  const announceAction = useCallback((action: string) => {
    announce(`${action} 완료`, 'polite')
  }, [announce])

  const announceError = useCallback((error: string) => {
    announce(`오류: ${error}`, 'assertive')
  }, [announce])

  return {
    announce,
    announceNavigation,
    announceAction,
    announceError
  }
}

/**
 * 포커스 트래핑 훅 (모달, 메뉴 등에서 사용)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[]
  }, [])

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (!isActive || event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }, [isActive, getFocusableElements])

  const initializeFocus = useCallback(() => {
    if (!isActive || !containerRef.current) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      // 첫 번째 포커스 가능한 요소에 포커스
      focusableElements[0].focus()
    }
  }, [isActive, getFocusableElements])

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', trapFocus)
      // 조금 지연시켜서 DOM이 완전히 렌더링된 후 포커스
      setTimeout(initializeFocus, 100)
    }

    return () => {
      document.removeEventListener('keydown', trapFocus)
    }
  }, [isActive, trapFocus, initializeFocus])

  return { containerRef }
}

/**
 * ARIA 상태 관리 훅
 */
export function useAriaState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = useState(initialState)

  const updateAriaState = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const getAriaProps = useCallback(() => {
    const ariaProps: Record<string, any> = {}
    
    Object.entries(state).forEach(([key, value]) => {
      if (key.startsWith('aria-') || key === 'role') {
        ariaProps[key] = value
      } else {
        ariaProps[`aria-${key}`] = value
      }
    })
    
    return ariaProps
  }, [state])

  return {
    ariaState: state,
    updateAriaState,
    getAriaProps
  }
}

/**
 * 색상 대비 검증 훅
 */
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string) => {
    // RGB 값을 추출하는 헬퍼 함수
    const getRGB = (color: string) => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
      return { r, g, b }
    }

    // 상대 휘도 계산
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const { r, g, b } = rgb
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    try {
      const fgRGB = getRGB(foreground)
      const bgRGB = getRGB(background)
      
      const fgLuminance = getLuminance(fgRGB)
      const bgLuminance = getLuminance(bgRGB)
      
      const lighter = Math.max(fgLuminance, bgLuminance)
      const darker = Math.min(fgLuminance, bgLuminance)
      
      const ratio = (lighter + 0.05) / (darker + 0.05)
      
      return {
        ratio,
        AA: ratio >= 4.5,      // WCAG AA 기준
        AAA: ratio >= 7,       // WCAG AAA 기준
        AALarge: ratio >= 3    // WCAG AA Large 기준 (18pt+ 또는 14pt+ bold)
      }
    } catch (error) {
      console.warn('색상 대비 검사 실패:', error)
      return { ratio: 0, AA: false, AAA: false, AALarge: false }
    }
  }, [])

  return { checkContrast }
}

/**
 * 키보드 단축키 지원 훅
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = [
        event.ctrlKey && 'ctrl',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.metaKey && 'meta',
        event.key.toLowerCase()
      ].filter(Boolean).join('+')

      if (shortcuts[key]) {
        event.preventDefault()
        shortcuts[key]()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enabled])
}