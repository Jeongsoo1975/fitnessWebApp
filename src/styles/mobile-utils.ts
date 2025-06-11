import { 
  MOBILE_BREAKPOINTS, 
  TOUCH_TARGET_SIZES, 
  type Breakpoint, 
  type TouchTargetSize,
  type ButtonSize,
  type ResponsiveValue
} from './mobile-types'

/**
 * Simple class name utility function
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Mobile Detection Utilities
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const getViewportWidth = (): number => {
  if (typeof window === 'undefined') return 0
  return window.innerWidth
}

export const getCurrentBreakpoint = (): Breakpoint => {
  const width = getViewportWidth()
  
  if (width >= MOBILE_BREAKPOINTS['2xl']) return '2xl'
  if (width >= MOBILE_BREAKPOINTS.xl) return 'xl'
  if (width >= MOBILE_BREAKPOINTS.lg) return 'lg'
  if (width >= MOBILE_BREAKPOINTS.md) return 'md'
  if (width >= MOBILE_BREAKPOINTS.sm) return 'sm'
  if (width >= MOBILE_BREAKPOINTS.xs) return 'xs'
  return 'xs'
}

/**
 * Touch Target Utilities
 */
export const getTouchTargetClasses = (size: TouchTargetSize = 'default'): string => {
  const baseClasses = 'touch-manipulation'
  
  switch (size) {
    case 'large':
      return cn(baseClasses, 'touch-target-large')
    case 'xl':
      return cn(baseClasses, 'min-h-touch-xl min-w-touch-xl')
    default:
      return cn(baseClasses, 'touch-target')
  }
}

export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  const minSize = TOUCH_TARGET_SIZES.default
  
  return rect.width >= minSize && rect.height >= minSize
}

/**
 * Mobile Button Utilities
 */
export const getMobileButtonClasses = (
  size: ButtonSize = 'default',
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary'
): string => {
  const baseClasses = 'font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Size classes
  const sizeClasses = {
    small: 'mobile-button-small',
    default: 'mobile-button',
    large: 'mobile-button-large'
  }
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-900 focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500'
  }
  
  return cn(baseClasses, sizeClasses[size], variantClasses[variant])
}

/**
 * Responsive Value Utilities
 */
export const getResponsiveValue = <T>(
  values: ResponsiveValue<T>,
  currentBreakpoint: Breakpoint
): T | undefined => {
  // Check from largest to smallest breakpoint
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return values.default
}

/**
 * Safe Area Utilities
 */
export const getSafeAreaClasses = (
  areas: ('top' | 'bottom' | 'left' | 'right' | 'all')[] = ['all']
): string => {
  if (areas.includes('all')) {
    return 'safe-area-inset'
  }
  
  const classes = areas.map(area => `safe-area-${area}`)
  return cn(...classes)
}

export const hasSafeAreaSupport = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return CSS.supports('padding-top: env(safe-area-inset-top)')
}

/**
 * Performance Utilities
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Animation Utilities
 */
export const getAnimationClasses = (
  type: 'touch-feedback' | 'slide-up' | 'fade-in' | 'none' = 'none'
): string => {
  switch (type) {
    case 'touch-feedback':
      return 'animate-touch-feedback'
    case 'slide-up':
      return 'animate-slide-up'
    case 'fade-in':
      return 'animate-fade-in'
    default:
      return ''
  }
}

export const addTouchFeedback = (element: HTMLElement): void => {
  const handleTouchStart = () => {
    element.style.transform = 'scale(0.95)'
  }
  
  const handleTouchEnd = () => {
    element.style.transform = 'scale(1)'
  }
  
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })
  element.addEventListener('touchcancel', handleTouchEnd, { passive: true })
}

/**
 * Accessibility Utilities
 */
export const announceToScreenReader = (message: string): void => {
  if (typeof window === 'undefined') return
  
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
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
}

export const trapFocus = (element: HTMLElement): (() => void) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }
  
  element.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Validation Utilities
 */
export const validateMobileOptimization = (element: HTMLElement): {
  isValid: boolean
  issues: string[]
} => {
  const issues: string[] = []
  const rect = element.getBoundingClientRect()
  
  // Check touch target size
  if (rect.width < TOUCH_TARGET_SIZES.default || rect.height < TOUCH_TARGET_SIZES.default) {
    issues.push(`Touch target too small: ${rect.width}x${rect.height}px (minimum: ${TOUCH_TARGET_SIZES.default}x${TOUCH_TARGET_SIZES.default}px)`)
  }
  
  // Check for touch-action property
  const touchAction = getComputedStyle(element).touchAction
  if (!touchAction || touchAction === 'auto') {
    issues.push('Missing touch-action optimization')
  }
  
  // Check for tap highlight removal on interactive elements
  const tagName = element.tagName.toLowerCase()
  if (['button', 'a', 'input'].includes(tagName)) {
    const computedStyle = getComputedStyle(element) as any
    const tapHighlight = computedStyle.webkitTapHighlightColor
    if (tapHighlight !== 'rgba(0, 0, 0, 0)' && tapHighlight !== 'transparent') {
      issues.push('Tap highlight not removed for better touch experience')
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Constants Export
 */
export { MOBILE_BREAKPOINTS, TOUCH_TARGET_SIZES }
