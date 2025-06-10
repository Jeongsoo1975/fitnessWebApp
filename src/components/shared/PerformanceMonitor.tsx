'use client'

import { useState, useEffect } from 'react'
import { usePerformanceMonitor, useMemoryMonitor, useNetworkStatus } from '@/hooks/usePerformance'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface PerformanceMonitorProps {
  enabled?: boolean
  showInProduction?: boolean
}

export default function PerformanceMonitor({ 
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false 
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const performanceMetrics = usePerformanceMonitor()
  const memoryInfo = useMemoryMonitor()
  const networkStatus = useNetworkStatus()
  const isMobile = useIsMobile()

  // 프로덕션에서는 showInProduction이 true일 때만 표시
  const shouldShow = enabled && (process.env.NODE_ENV === 'development' || showInProduction)

  useEffect(() => {
    if (!shouldShow) return

    // 개발 환경에서만 자동 표시, 프로덕션에서는 수동 토글
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }

    // 콘솔에 키보드 단축키 안내
    console.log('🔍 성능 모니터 키보드 단축키:')
    console.log('  Ctrl+Shift+P: 성능 모니터 토글')
    console.log('  Ctrl+Shift+M: 메모리 정보 로그')

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case 'P':
            event.preventDefault()
            setIsVisible(prev => !prev)
            break
          case 'M':
            event.preventDefault()
            console.log('📊 메모리 정보:', memoryInfo)
            console.log('🌐 네트워크 상태:', networkStatus)
            console.log('⚡ 성능 지표:', performanceMetrics)
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shouldShow, memoryInfo, networkStatus, performanceMetrics])

  if (!shouldShow || !isVisible) {
    return null
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const getPerformanceStatus = () => {
    if (performanceMetrics.loadTime > 3000) return { label: '느림', color: 'text-red-600 bg-red-50' }
    if (performanceMetrics.loadTime > 1500) return { label: '보통', color: 'text-yellow-600 bg-yellow-50' }
    return { label: '빠름', color: 'text-green-600 bg-green-50' }
  }

  const getMemoryStatus = () => {
    if (memoryInfo.usagePercentage > 80) return { label: '높음', color: 'text-red-600 bg-red-50' }
    if (memoryInfo.usagePercentage > 60) return { label: '보통', color: 'text-yellow-600 bg-yellow-50' }
    return { label: '낮음', color: 'text-green-600 bg-green-50' }
  }

  const getNetworkStatus = () => {
    if (!networkStatus.isOnline) return { label: '오프라인', color: 'text-red-600 bg-red-50' }
    if (networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g') {
      return { label: '느린 연결', color: 'text-red-600 bg-red-50' }
    }
    if (networkStatus.effectiveType === '3g') {
      return { label: '보통 연결', color: 'text-yellow-600 bg-yellow-50' }
    }
    return { label: '빠른 연결', color: 'text-green-600 bg-green-50' }
  }

  return (
    <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-4 right-4'} z-50`}>
      {/* 축소된 상태 */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors touch-target"
          aria-label="성능 모니터 열기"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* 확장된 상태 */}
      {isExpanded && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">성능 모니터</h3>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                aria-label="페이지 새로고침"
              >
                새로고침
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="성능 모니터 닫기"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* 성능 지표 */}
          <div className="space-y-3">
            {/* 로딩 성능 */}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">로딩 성능</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getPerformanceStatus().color}`}>
                  {getPerformanceStatus().label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">로드 시간:</span>
                  <span className="ml-1 font-mono">{formatTime(performanceMetrics.loadTime)}</span>
                </div>
                <div>
                  <span className="text-gray-500">렌더 시간:</span>
                  <span className="ml-1 font-mono">{formatTime(performanceMetrics.renderTime)}</span>
                </div>
              </div>
            </div>

            {/* 메모리 사용량 */}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">메모리</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getMemoryStatus().color}`}>
                  {getMemoryStatus().label}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">사용중:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">할당됨:</span>
                  <span className="font-mono">{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      memoryInfo.usagePercentage > 80 ? 'bg-red-500' :
                      memoryInfo.usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${memoryInfo.usagePercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {memoryInfo.usagePercentage}% 사용
                </div>
              </div>
            </div>

            {/* 네트워크 상태 */}
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">네트워크</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getNetworkStatus().color}`}>
                  {getNetworkStatus().label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">연결:</span>
                  <span className="ml-1 font-mono">{networkStatus.effectiveType || 'unknown'}</span>
                </div>
                <div>
                  <span className="text-gray-500">속도:</span>
                  <span className="ml-1 font-mono">
                    {networkStatus.downlink ? `${networkStatus.downlink}Mbps` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* 디바이스 정보 */}
            <div>
              <span className="text-xs font-medium text-gray-600 block mb-2">디바이스</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">화면:</span>
                  <span className="ml-1 font-mono">
                    {window.innerWidth}×{window.innerHeight}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">DPR:</span>
                  <span className="ml-1 font-mono">{window.devicePixelRatio || 1}</span>
                </div>
                <div>
                  <span className="text-gray-500">모바일:</span>
                  <span className="ml-1">{isMobile ? '예' : '아니오'}</span>
                </div>
                <div>
                  <span className="text-gray-500">터치:</span>
                  <span className="ml-1">{'ontouchstart' in window ? '예' : '아니오'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 키보드 단축키 */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <div>Ctrl+Shift+P: 토글</div>
              <div>Ctrl+Shift+M: 콘솔 로그</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}