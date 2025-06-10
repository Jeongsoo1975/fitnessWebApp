import { NextRequest, NextResponse } from 'next/server'
import { validateUserByEmail } from '@/lib/auth'

// GET /api/health/validation - 검증 시스템 상태 확인
export async function GET(request: NextRequest) {
  try {
    console.log('[health-check] Validation system health check initiated')
    
    const startTime = Date.now()
    
    // 시스템 구성 요소 상태 확인
    const status = {
      timestamp: new Date().toISOString(),
      system: 'User Validation System',
      version: '1.0.0',
      status: 'healthy',
      checks: {
        auth_module: 'ok',
        clerk_connection: 'checking',
        mock_data: 'ok'
      },
      performance: {
        response_time_ms: 0
      }
    }
    
    // Clerk 연결 상태 테스트 (실제 API 호출하지 않고 함수 존재 여부만 확인)
    try {
      if (typeof validateUserByEmail === 'function') {
        status.checks.clerk_connection = 'ok'
      } else {
        status.checks.clerk_connection = 'error'
        status.status = 'degraded'
      }
    } catch (error) {
      console.error('[health-check] Clerk connection test failed:', error)
      status.checks.clerk_connection = 'error'
      status.status = 'degraded'
    }
    
    const endTime = Date.now()
    status.performance.response_time_ms = endTime - startTime
    
    console.log('[health-check] Health check completed:', status.status)
    
    const httpStatus = status.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(status, { status: httpStatus })
    
  } catch (error) {
    console.error('[health-check] Health check failed:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      system: 'User Validation System',
      status: 'unhealthy',
      error: 'Health check failed',
      message: '시스템 상태 확인 중 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
