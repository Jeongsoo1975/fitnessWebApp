import { NextResponse } from 'next/server'
import { createApiLogger } from './logger'

const errorLogger = createApiLogger('error-handler')

export interface ApiError {
  code: string
  message: string
  details?: any
  status: number
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 공통 에러 처리 함수
export function handleApiError(error: unknown, context?: string): NextResponse {
  errorLogger.error('API error occurred', {
    context,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    type: error instanceof AppError ? 'AppError' : 'Unknown'
  })

  // AppError 처리
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
        details: error.details
      },
      { status: error.status }
    )
  }

  // Clerk 인증 에러 처리
  if (error instanceof Error) {
    if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message: '인증이 필요합니다. 다시 로그인해주세요.',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      )
    }

    if (error.message.includes('role') || error.message.includes('Role')) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: '권한이 부족합니다.',
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      )
    }

    if (error.message.includes('not found') || error.message.includes('Not found')) {
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: '요청하신 리소스를 찾을 수 없습니다.',
          code: 'RESOURCE_NOT_FOUND'
        },
        { status: 404 }
      )
    }
  }

  // 기본 에러 처리
  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  )
}

// 입력 검증 에러
export function createValidationError(field: string, message: string): AppError {
  return new AppError(
    'VALIDATION_ERROR',
    `${field}: ${message}`,
    400,
    { field }
  )
}

// 비즈니스 로직 에러
export function createBusinessError(code: string, message: string, status: number = 409): AppError {
  return new AppError(code, message, status)
}

// 성공 응답 헬퍼
export function createSuccessResponse(data: any, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  })
}

// 입력 검증 헬퍼
export function validateRequiredFields(body: any, fields: string[]): void {
  for (const field of fields) {
    if (!body[field]) {
      throw createValidationError(field, '필수 입력 항목입니다')
    }
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createValidationError('email', '올바른 이메일 형식이 아닙니다')
  }
}

export function validateStatus(status: string, allowedStatuses: string[]): void {
  if (!allowedStatuses.includes(status)) {
    throw createValidationError(
      'status', 
      `허용되지 않는 상태입니다. 가능한 값: ${allowedStatuses.join(', ')}`
    )
  }
}

// 사용자 친화적 메시지 매핑
export const USER_MESSAGES = {
  // 일반 메시지
  SUCCESS: '작업이 성공적으로 완료되었습니다.',
  CREATED: '성공적으로 생성되었습니다.',
  UPDATED: '성공적으로 업데이트되었습니다.',
  DELETED: '성공적으로 삭제되었습니다.',
  
  // 검색 관련
  SEARCH_NO_RESULTS: '검색 결과를 찾을 수 없습니다.',
  SEARCH_SUCCESS: '검색이 완료되었습니다.',
  
  // 요청 관련
  REQUEST_SENT: '요청이 성공적으로 전송되었습니다.',
  REQUEST_APPROVED: '요청이 승인되었습니다.',
  REQUEST_REJECTED: '요청이 거절되었습니다.',
  REQUEST_ALREADY_PROCESSED: '이미 처리된 요청입니다.',
  REQUEST_DUPLICATE: '동일한 요청이 이미 존재합니다.',
  
  // 인증 관련
  AUTH_REQUIRED: '로그인이 필요합니다.',
  AUTH_INVALID: '인증 정보가 올바르지 않습니다.',
  PERMISSION_DENIED: '권한이 부족합니다.',
  
  // 사용자 관련
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  EMAIL_INVALID: '올바른 이메일 주소를 입력해주세요.',
  SELF_REQUEST_DENIED: '자기 자신에게는 요청할 수 없습니다.',
  
  // 시스템 관련
  SYSTEM_ERROR: '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  MAINTENANCE: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.'
} as const
