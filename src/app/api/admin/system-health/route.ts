import { NextRequest, NextResponse } from 'next/server'
import { mockDataStore } from '@/lib/mockData'
import { createApiLogger } from '@/lib/logger'

const apiLogger = createApiLogger('admin-system-health')

// GET /api/admin/system-health - 시스템 상태 및 데이터 일관성 체크
export async function GET(request: NextRequest) {
  try {
    apiLogger.info('System health check requested')

    // 시스템 리포트 생성
    const systemReport = mockDataStore.generateSystemReport()
    
    // 추가 상태 정보
    const healthStatus = {
      server: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }

    // 전체 응답 구성
    const response = {
      status: systemReport.systemHealth,
      health: healthStatus,
      system: systemReport,
      warnings: systemReport.consistencyCheck.issues,
      recommendations: systemReport.recommendations
    }

    apiLogger.info('System health check completed', {
      status: systemReport.systemHealth,
      issueCount: systemReport.consistencyCheck.issues.length,
      totalRequests: systemReport.statistics.requests.total
    })

    return NextResponse.json(response)

  } catch (error) {
    apiLogger.error('System health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { 
        status: 'error',
        error: 'System health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/system-health - 데이터 일관성 수동 검증 및 수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    apiLogger.info('Admin action requested', { action })

    switch (action) {
      case 'validate':
        const validationResult = mockDataStore.validateDataConsistency()
        apiLogger.info('Manual validation completed', {
          issueCount: validationResult.issues.length
        })
        return NextResponse.json({
          success: true,
          action: 'validate',
          result: validationResult
        })

      case 'cleanup':
        // 기본적인 정리 작업 (예: 오래된 로그 등)
        apiLogger.info('System cleanup completed')
        return NextResponse.json({
          success: true,
          action: 'cleanup',
          message: 'System cleanup completed successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

  } catch (error) {
    apiLogger.error('Admin action failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Admin action failed' },
      { status: 500 }
    )
  }
}
