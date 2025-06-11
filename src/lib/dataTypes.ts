// Mock 데이터 인터페이스 정의 (기존 mockData.ts와 동일)
export interface MockSchedule {
  id: string
  title: string
  notes?: string
  date: string
  status: 'scheduled' | 'completed' | 'cancelled'
  memberId?: string
  memberName?: string
  createdAt: string
  updatedAt: string
}

export interface MockMember {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface MockMemberProfile extends MockMember {
  isRegistered?: boolean
}

export interface MockTrainerMemberRequest {
  id: string
  trainerId: string
  memberId: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  createdAt: string
  updatedAt: string
}

export interface MockTrainerNotification {
  id: string
  trainerId: string
  type: 'member_approved' | 'member_rejected' | 'new_member_request' | 'session_scheduled' | 'other'
  message: string
  memberId?: string
  memberName?: string
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

export interface MockMemberNotification {
  id: string
  memberId: string
  type: 'trainer_request' | 'request_approved' | 'request_rejected' | 'session_scheduled' | 'other'
  message: string
  trainerId?: string
  trainerName?: string
  isRead: boolean
  createdAt: string
  updatedAt?: string
}

// 통합 Mock 데이터 타입
export interface MockData {
  schedules: MockSchedule[]
  members: MockMemberProfile[]
  trainerMemberRequests: MockTrainerMemberRequest[]
  trainerNotifications: MockTrainerNotification[]
  memberNotifications: MockMemberNotification[]
  version: string
  lastUpdated: string | null
}

// 데이터 검증 결과 타입
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  migrationNeeded: boolean
  targetVersion?: string
}

// JSON 직렬화/역직렬화 유틸리티
export const dataSerializer = {
  /**
   * MockData 객체를 JSON 문자열로 직렬화
   */
  serializeData(data: MockData): string {
    try {
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error('Failed to serialize data:', error)
      throw new Error('데이터 직렬화 실패')
    }
  },

  /**
   * JSON 문자열을 MockData 객체로 역직렬화
   */
  deserializeData(jsonString: string): MockData {
    try {
      const parsed = JSON.parse(jsonString)
      
      // 기본 구조 검증
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid data structure')
      }

      // 필수 필드 확인 및 기본값 설정
      const data: MockData = {
        schedules: Array.isArray(parsed.schedules) ? parsed.schedules : [],
        members: Array.isArray(parsed.members) ? parsed.members : [],
        trainerMemberRequests: Array.isArray(parsed.trainerMemberRequests) ? parsed.trainerMemberRequests : [],
        trainerNotifications: Array.isArray(parsed.trainerNotifications) ? parsed.trainerNotifications : [],
        memberNotifications: Array.isArray(parsed.memberNotifications) ? parsed.memberNotifications : [],
        version: parsed.version || '1.0.0',
        lastUpdated: parsed.lastUpdated || null
      }

      return data
    } catch (error) {
      console.error('Failed to deserialize data:', error)
      throw new Error('데이터 역직렬화 실패')
    }
  },

  /**
   * 데이터 무결성 검증
   */
  validateDataIntegrity(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      migrationNeeded: false
    }

    // 기본 타입 검증
    if (!data || typeof data !== 'object') {
      result.isValid = false
      result.errors.push('데이터가 객체가 아닙니다')
      return result
    }

    // 필수 배열 필드 검증
    const requiredArrayFields = [
      'schedules', 'members', 'trainerMemberRequests', 
      'trainerNotifications', 'memberNotifications'
    ]

    for (const field of requiredArrayFields) {
      if (!Array.isArray(data[field])) {
        result.errors.push(`${field}가 배열이 아닙니다`)
        result.isValid = false
      }
    }

    // 버전 검증
    if (!data.version || typeof data.version !== 'string') {
      result.warnings.push('버전 정보가 없습니다')
      result.migrationNeeded = true
      result.targetVersion = '1.0.0'
    }

    // ID 중복 검증
    const allIds = new Set<string>()
    const checkDuplicateIds = (items: any[], arrayName: string) => {
      items.forEach((item, index) => {
        if (!item.id || typeof item.id !== 'string') {
          result.errors.push(`${arrayName}[${index}]에 유효한 ID가 없습니다`)
          result.isValid = false
        } else if (allIds.has(item.id)) {
          result.errors.push(`중복된 ID 발견: ${item.id} (${arrayName})`)
          result.isValid = false
        } else {
          allIds.add(item.id)
        }
      })
    }

    if (Array.isArray(data.schedules)) checkDuplicateIds(data.schedules, 'schedules')
    if (Array.isArray(data.members)) checkDuplicateIds(data.members, 'members')
    if (Array.isArray(data.trainerMemberRequests)) checkDuplicateIds(data.trainerMemberRequests, 'trainerMemberRequests')
    if (Array.isArray(data.trainerNotifications)) checkDuplicateIds(data.trainerNotifications, 'trainerNotifications')
    if (Array.isArray(data.memberNotifications)) checkDuplicateIds(data.memberNotifications, 'memberNotifications')

    // 날짜 형식 검증
    const validateDateFields = (items: any[], arrayName: string, dateFields: string[]) => {
      items.forEach((item, index) => {
        dateFields.forEach(field => {
          if (item[field] && typeof item[field] === 'string') {
            const date = new Date(item[field])
            if (isNaN(date.getTime())) {
              result.warnings.push(`${arrayName}[${index}].${field}의 날짜 형식이 잘못되었습니다`)
            }
          }
        })
      })
    }

    if (Array.isArray(data.schedules)) {
      validateDateFields(data.schedules, 'schedules', ['createdAt', 'updatedAt'])
    }
    if (Array.isArray(data.trainerMemberRequests)) {
      validateDateFields(data.trainerMemberRequests, 'trainerMemberRequests', ['createdAt', 'updatedAt'])
    }
    if (Array.isArray(data.trainerNotifications)) {
      validateDateFields(data.trainerNotifications, 'trainerNotifications', ['createdAt', 'updatedAt'])
    }
    if (Array.isArray(data.memberNotifications)) {
      validateDateFields(data.memberNotifications, 'memberNotifications', ['createdAt', 'updatedAt'])
    }

    return result
  },

  /**
   * 빈 초기 데이터 생성
   */
  createEmptyData(): MockData {
    return {
      schedules: [],
      members: [],
      trainerMemberRequests: [],
      trainerNotifications: [],
      memberNotifications: [],
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
  },

  /**
   * 데이터 마이그레이션 수행
   */
  migrateData(data: any, targetVersion: string = '1.0.0'): MockData {
    const migrated = { ...data }

    // 버전별 마이그레이션 로직
    if (!migrated.version || migrated.version < '1.0.0') {
      // 1.0.0으로 마이그레이션
      migrated.version = '1.0.0'
      migrated.lastUpdated = new Date().toISOString()

      // 기본 배열 필드 초기화
      if (!Array.isArray(migrated.schedules)) migrated.schedules = []
      if (!Array.isArray(migrated.members)) migrated.members = []
      if (!Array.isArray(migrated.trainerMemberRequests)) migrated.trainerMemberRequests = []
      if (!Array.isArray(migrated.trainerNotifications)) migrated.trainerNotifications = []
      if (!Array.isArray(migrated.memberNotifications)) migrated.memberNotifications = []
    }

    return migrated as MockData
  }
}
