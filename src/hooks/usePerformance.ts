'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * 지연 로딩을 위한 Intersection Observer 훅
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [hasIntersected, options])

  return { targetRef, isIntersecting, hasIntersected }
}

/**
 * 이미지 지연 로딩 훅
 */
export function useLazyImage(src: string, placeholder?: string) {
  const { targetRef, hasIntersected } = useIntersectionObserver()
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!hasIntersected || !src) return

    const img = new Image()
    
    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
    }
    
    img.onerror = () => {
      setIsError(true)
    }
    
    img.src = src
  }, [hasIntersected, src])

  return {
    targetRef,
    imageSrc,
    isLoaded,
    isError,
    shouldLoad: hasIntersected
  }
}

/**
 * 터치 이벤트 최적화 훅
 */
export function useOptimizedTouch() {
  const addTouchOptimization = useCallback((element: HTMLElement) => {
    if (!element) return

    // 터치 지연 제거
    element.style.touchAction = 'manipulation'
    
    // 탭 하이라이트 제거
    ;(element.style as any).webkitTapHighlightColor = 'transparent'
    
    // 사용자 선택 방지 (필요한 경우)
    if (element.tagName === 'BUTTON') {
      element.style.userSelect = 'none'
    }

    // 터치 피드백 추가
    const handleTouchStart = () => {
      element.style.transform = 'scale(0.98)'
    }
    
    const handleTouchEnd = () => {
      element.style.transform = 'scale(1)'
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [])

  return { addTouchOptimization }
}

/**
 * 스크롤 성능 최적화 훅
 */
export function useOptimizedScroll(callback: (scrollY: number) => void, deps: any[] = []) {
  const [isScrolling, setIsScrolling] = useState(false)
  const rafRef = useRef<number | null>(null)
  const lastScrollY = useRef(0)

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.pageYOffset
      if (scrollY !== lastScrollY.current) {
        callback(scrollY)
        lastScrollY.current = scrollY
      }
      setIsScrolling(false)
    })

    setIsScrolling(true)
  }, [callback])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const optimizedHandler = () => {
      handleScroll()
      
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', optimizedHandler, { passive: true })

    return () => {
      window.removeEventListener('scroll', optimizedHandler)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  return { isScrolling }
}

/**
 * 성능 측정 훅
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 페이지 로드 시간 측정
    const measureLoadTime = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart
        }))
      }
    }

    // 렌더링 시간 측정
    const measureRenderTime = () => {
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        setMetrics(prev => ({
          ...prev,
          renderTime: fcp.startTime
        }))
      }
    }

    // 페이지 로드 완료 후 측정
    if (document.readyState === 'complete') {
      measureLoadTime()
      measureRenderTime()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          measureLoadTime()
          measureRenderTime()
        }, 100)
      })
    }

    // 상호작용 시간 측정 (클릭 응답 시간)
    let clickStartTime = 0
    const handleTouchStart = () => {
      clickStartTime = performance.now()
    }
    
    const handleTouchEnd = () => {
      if (clickStartTime) {
        const interactionTime = performance.now() - clickStartTime
        setMetrics(prev => ({
          ...prev,
          interactionTime: Math.max(prev.interactionTime, interactionTime)
        }))
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return metrics
}

/**
 * 메모리 사용량 모니터링 훅 (개발 환경용)
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

    const updateMemoryInfo = () => {
      // @ts-ignore - performance.memory는 Chrome에서만 사용 가능
      if (performance.memory) {
        // @ts-ignore
        const memory = performance.memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }
    }

    // 초기 측정
    updateMemoryInfo()

    // 주기적 측정 (개발 환경에서만)
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const getMemoryUsagePercentage = () => {
    if (memoryInfo.jsHeapSizeLimit === 0) return 0
    return Math.round((memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100)
  }

  return {
    ...memoryInfo,
    usagePercentage: getMemoryUsagePercentage()
  }
}

/**
 * 네트워크 상태 모니터링 훅
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateNetworkStatus = () => {
      setNetworkStatus({
        isOnline: navigator.onLine,
        // @ts-ignore - navigator.connection은 실험적 API
        connectionType: navigator.connection?.type || 'unknown',
        // @ts-ignore
        effectiveType: navigator.connection?.effectiveType || 'unknown',
        // @ts-ignore
        downlink: navigator.connection?.downlink || 0,
        // @ts-ignore
        rtt: navigator.connection?.rtt || 0
      })
    }

    // 초기 상태 설정
    updateNetworkStatus()

    // 네트워크 상태 변경 리스너
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    // @ts-ignore
    if (navigator.connection) {
      // @ts-ignore
      navigator.connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      
      // @ts-ignore
      if (navigator.connection) {
        // @ts-ignore
        navigator.connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return networkStatus
}