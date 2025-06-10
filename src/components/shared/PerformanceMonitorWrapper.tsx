'use client'

import dynamic from 'next/dynamic'

// 클라이언트에서만 PerformanceMonitor 로드
const PerformanceMonitor = dynamic(
  () => import('./PerformanceMonitor'),
  { 
    ssr: false,
    loading: () => null
  }
)

export default function PerformanceMonitorWrapper() {
  // 개발 환경에서만 렌더링
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return <PerformanceMonitor />
}
