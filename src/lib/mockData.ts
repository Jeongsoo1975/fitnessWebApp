// 개발 환경용 임시 데이터 저장소
// 실제 데이터베이스가 없을 때 사용

import { createApiLogger } from './logger'

// API별 로거 생성
const dataLogger = createApiLogger('mockDataStore')

interface MockSchedule {
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

interface MockMember {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface MockMemberProfile extends MockMember {
  isRegistered?: boolean
}

interface MockTrainerMemberRequest {
  id: string
  trainerId: string
  memberId: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  createdAt: string
  updatedAt: string
}

interface MockTrainerNotification {
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

// 전역 변수로 메모리에 저장 (개발 환경에서만 사용)
let mockSchedules: MockSchedule[] = [
  {
    id: '1',
    title: 'PT 세션 - 김회원',
    notes: '상체 운동 중심',
    date: '2025-06-10',
    status: 'scheduled',
    memberId: '1',
    memberName: '김 회원',
    createdAt: '2025-06-10T09:00:00Z',
    updatedAt: '2025-06-10T09:00:00Z'
  }
]

let mockMembers: MockMemberProfile[] = [
  {
    id: '1',
    firstName: '김',
    lastName: '회원',
    email: 'member1@example.com',
    isRegistered: true
  },
  {
    id: '2', 
    firstName: '이',
    lastName: '회원',
    email: 'member2@example.com',
    isRegistered: false
  },
  {
    id: '3',
    firstName: '박',
    lastName: '회원',
    email: 'member3@example.com',
    isRegistered: false
  },
  {
    id: '4',
    firstName: '최',
    lastName: '회원',
    email: 'member4@example.com',
    isRegistered: false
  },
  {
    id: '5',
    firstName: '정',
    lastName: '회원',
    email: 'member5@example.com',
    isRegistered: true
  },
  {
    id: '6',
    firstName: '강',
    lastName: '회원',
    email: 'member6@example.com',
    isRegistered: false
  },
  {
    id: '7',
    firstName: '윤',
    lastName: '회원',
    email: 'member7@example.com',
    isRegistered: false
  },
  {
    id: '8',
    firstName: '장',
    lastName: '회원',
    email: 'member8@example.com',
    isRegistered: false
  }
]

let mockTrainerMemberRequests: MockTrainerMemberRequest[] = []
let mockTrainerNotifications: MockTrainerNotification[] = []

export const mockDataStore = {
  // 스케줄 관련
  getSchedules: (date?: string) => {
    if (date) {
      return mockSchedules.filter(schedule => schedule.date === date)
    }
    return [...mockSchedules]
  },
  
  addSchedule: (schedule: Omit<MockSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSchedule: MockSchedule = {
      ...schedule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockSchedules.push(newSchedule)
    return newSchedule
  },
  
  deleteSchedule: (id: string) => {
    const index = mockSchedules.findIndex(schedule => schedule.id === id)
    if (index !== -1) {
      mockSchedules.splice(index, 1)
      return true
    }
    return false
  },
  
  updateSchedule: (id: string, updates: Partial<MockSchedule>) => {
    const index = mockSchedules.findIndex(schedule => schedule.id === id)
    if (index !== -1) {
      mockSchedules[index] = {
        ...mockSchedules[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      return mockSchedules[index]
    }
    return null
  },
  
  // 회원 관련
  getMembers: () => {
    return [...mockMembers]
  },
  
  getMemberById: (id: string) => {
    return mockMembers.find(member => member.id === id)
  },

  addMember: (member: { email: string; firstName?: string; lastName?: string }) => {
    const newMember: MockMemberProfile = {
      id: Date.now().toString(),
      firstName: member.firstName || '신규',
      lastName: member.lastName || '회원',
      email: member.email,
      isRegistered: false
    }
    mockMembers.push(newMember)
    return newMember
  },

  searchMembers: (query: string) => {
    const lowerQuery = query.toLowerCase()
    return mockMembers.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const email = member.email.toLowerCase()
      return fullName.includes(lowerQuery) || email.includes(lowerQuery)
    })
  },

  // === 정규화된 사용자 매칭 시스템 ===
  findMemberRequests: (searchCriteria: { clerkId?: string; email?: string }) => {
    const { clerkId, email } = searchCriteria
    
    dataLogger.debug('Starting normalized member request search', { 
      clerkId, 
      email,
      totalRequests: mockTrainerMemberRequests.length
    })
    
    let matchedRequests: MockTrainerMemberRequest[] = []
    let matchMethod = 'none'
    
    // 1단계: Clerk ID 정확 매칭 (최우선)
    if (clerkId) {
      matchedRequests = mockTrainerMemberRequests.filter(request => 
        request.memberId === clerkId
      )
      if (matchedRequests.length > 0) {
        matchMethod = 'clerk-id-exact'
        dataLogger.info('Found requests by Clerk ID exact match', {
          clerkId,
          matchCount: matchedRequests.length
        })
        return { requests: matchedRequests, method: matchMethod }
      }
    }
    
    // 2단계: 이메일 정확 매칭
    if (email) {
      matchedRequests = mockTrainerMemberRequests.filter(request => 
        request.memberId === email
      )
      if (matchedRequests.length > 0) {
        matchMethod = 'email-exact'
        dataLogger.info('Found requests by email exact match', {
          email,
          matchCount: matchedRequests.length
        })
        return { requests: matchedRequests, method: matchMethod }
      }
    }
    
    // 3단계: 이메일 사용자명 매칭
    if (email && email.includes('@')) {
      const emailUsername = email.split('@')[0]
      matchedRequests = mockTrainerMemberRequests.filter(request => {
        if (request.memberId.includes('@')) {
          const requestUsername = request.memberId.split('@')[0]
          return requestUsername === emailUsername
        }
        return false
      })
      if (matchedRequests.length > 0) {
        matchMethod = 'email-username'
        dataLogger.info('Found requests by email username match', {
          email,
          emailUsername,
          matchCount: matchedRequests.length
        })
        return { requests: matchedRequests, method: matchMethod }
      }
    }
    
    // 매칭 실패
    dataLogger.warn('No matching requests found', { clerkId, email })
    return { requests: [], method: 'no-match' }
  },

  addMemberRequest: (request: Omit<MockTrainerMemberRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: MockTrainerMemberRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockTrainerMemberRequests.push(newRequest)
    
    dataLogger.info('New member request added', {
      requestId: newRequest.id,
      trainerId: newRequest.trainerId,
      memberId: newRequest.memberId,
      status: newRequest.status,
      hasMessage: !!newRequest.message,
      totalRequestsInSystem: mockTrainerMemberRequests.length
    })
    
    return newRequest
  },

  getMemberRequests: (memberId: string) => {
    dataLogger.debug('getMemberRequests called', { memberId })
    
    const isEmail = memberId.includes('@')
    const result = mockDataStore.findMemberRequests({
      clerkId: isEmail ? undefined : memberId,
      email: isEmail ? memberId : undefined
    })
    
    dataLogger.info('getMemberRequests result', {
      memberId,
      method: result.method,
      matchCount: result.requests.length
    })
    
    return result.requests
  },

  getMemberRequestsByEmail: (email: string) => {
    dataLogger.debug('getMemberRequestsByEmail called', { email })
    
    const result = mockDataStore.findMemberRequests({ email })
    
    dataLogger.info('getMemberRequestsByEmail result', {
      email,
      method: result.method,
      matchCount: result.requests.length
    })
    
    return result.requests
  },

  getAllRequests: () => {
    dataLogger.debug('getAllRequests called', {
      totalRequests: mockTrainerMemberRequests.length,
      requestsSummary: mockTrainerMemberRequests.map(r => ({
        id: r.id,
        trainerId: r.trainerId,
        memberId: r.memberId,
        status: r.status,
        createdAt: r.createdAt
      }))
    })
    
    return [...mockTrainerMemberRequests]
  },

  updateRequestStatus: (id: string, status: 'approved' | 'rejected') => {
    const index = mockTrainerMemberRequests.findIndex(request => request.id === id)
    if (index !== -1) {
      const request = mockTrainerMemberRequests[index]
      
      mockTrainerMemberRequests[index] = {
        ...request,
        status,
        updatedAt: new Date().toISOString()
      }
      
      // 승인시 회원의 isRegistered 상태 업데이트
      if (status === 'approved') {
        const memberIndex = mockMembers.findIndex(member => 
          member.id === request.memberId
        )
        if (memberIndex !== -1) {
          mockMembers[memberIndex].isRegistered = true
        }
        
        // 트레이너에게 알림 생성
        const memberInfo = mockMembers.find(m => m.id === request.memberId)
        let memberName = '회원'
        
        if (memberInfo) {
          memberName = `${memberInfo.firstName} ${memberInfo.lastName}`
        } else if (request.memberId.includes('@')) {
          const username = request.memberId.split('@')[0]
          memberName = `${username.charAt(0).toUpperCase() + username.slice(1)} 회원`
        }
        
        const notification: MockTrainerNotification = {
          id: Date.now().toString(),
          trainerId: request.trainerId,
          type: 'member_approved',
          message: `${memberName}님이 PT 요청을 승인했습니다.`,
          memberId: request.memberId,
          memberName: memberName,
          isRead: false,
          createdAt: new Date().toISOString()
        }
        
        mockTrainerNotifications.push(notification)
        dataLogger.info('Created trainer notification', { notificationId: notification.id })
      }
      
      return mockTrainerMemberRequests[index]
    }
    return null
  },

  getTrainerMembers: (trainerId: string) => {
    const approvedRequests = mockTrainerMemberRequests.filter(
      request => request.trainerId === trainerId && request.status === 'approved'
    )
    
    const members = approvedRequests.map(request => {
      if (request.memberId.includes('@')) {
        const emailParts = request.memberId.split('@')
        const username = emailParts[0]
        
        return {
          id: request.memberId,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: '회원',
          email: request.memberId,
          requestId: request.id,
          isRegistered: true
        }
      } else {
        const member = mockMembers.find(m => m.id === request.memberId)
        return member ? { ...member, requestId: request.id } : null
      }
    }).filter(Boolean)
    
    return members
  },

  // 트레이너 알림 관련
  addTrainerNotification: (notification: Omit<MockTrainerNotification, 'id' | 'createdAt'>) => {
    const newNotification: MockTrainerNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    mockTrainerNotifications.push(newNotification)
    dataLogger.info('Added trainer notification', { notificationId: newNotification.id })
    return newNotification
  },

  getTrainerNotifications: (trainerId: string) => {
    const notifications = mockTrainerNotifications.filter(notification => 
      notification.trainerId === trainerId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    dataLogger.debug('Retrieved trainer notifications', { 
      trainerId, 
      count: notifications.length 
    })
    return notifications
  },

  markTrainerNotificationAsRead: (id: string) => {
    const index = mockTrainerNotifications.findIndex(notification => notification.id === id)
    if (index !== -1) {
      mockTrainerNotifications[index] = {
        ...mockTrainerNotifications[index],
        isRead: true,
        updatedAt: new Date().toISOString()
      }
      dataLogger.info('Marked notification as read', { notificationId: id })
      return mockTrainerNotifications[index]
    }
    return null
  },

  getUnreadTrainerNotificationsCount: (trainerId: string) => {
    const unreadCount = mockTrainerNotifications.filter(notification => 
      notification.trainerId === trainerId && !notification.isRead
    ).length
    dataLogger.debug('Unread notifications count', { trainerId, unreadCount })
    return unreadCount
  },

  markAllTrainerNotificationsAsRead: (trainerId: string) => {
    let updatedCount = 0
    mockTrainerNotifications.forEach((notification, index) => {
      if (notification.trainerId === trainerId && !notification.isRead) {
        mockTrainerNotifications[index] = {
          ...notification,
          isRead: true,
          updatedAt: new Date().toISOString()
        }
        updatedCount++
      }
    })
    dataLogger.info('Marked all notifications as read', { 
      trainerId, 
      updatedCount 
    })
    return updatedCount
  },

  // === 데이터 일관성 검증 ===
  validateDataConsistency: () => {
    const validationResults = {
      totalRequests: mockTrainerMemberRequests.length,
      totalNotifications: mockTrainerNotifications.length,
      totalMembers: mockMembers.length,
      issues: [] as string[],
      summary: {} as any
    }

    dataLogger.info('Starting data consistency validation')

    // 승인된 요청과 회원 등록 상태 일치 확인
    const approvedRequests = mockTrainerMemberRequests.filter(r => r.status === 'approved')
    const registeredMembers = mockMembers.filter(m => m.isRegistered)
    
    validationResults.summary.approvedRequests = approvedRequests.length
    validationResults.summary.registeredMembers = registeredMembers.length

    // 알림과 승인된 요청 연결 확인
    const approvalNotifications = mockTrainerNotifications.filter(n => n.type === 'member_approved')
    validationResults.summary.approvalNotifications = approvalNotifications.length

    if (approvedRequests.length !== approvalNotifications.length) {
      validationResults.issues.push(
        `승인된 요청(${approvedRequests.length})과 승인 알림(${approvalNotifications.length}) 수가 일치하지 않음`
      )
    }

    // 중복 요청 확인
    const duplicateRequests = []
    for (let i = 0; i < mockTrainerMemberRequests.length; i++) {
      for (let j = i + 1; j < mockTrainerMemberRequests.length; j++) {
        const req1 = mockTrainerMemberRequests[i]
        const req2 = mockTrainerMemberRequests[j]
        if (req1.trainerId === req2.trainerId && req1.memberId === req2.memberId && 
            req1.status === 'pending' && req2.status === 'pending') {
          duplicateRequests.push({ req1: req1.id, req2: req2.id })
        }
      }
    }

    if (duplicateRequests.length > 0) {
      validationResults.issues.push(
        `중복 pending 요청 발견: ${duplicateRequests.length}쌍`
      )
    }

    // 트레이너별 요청 통계
    const trainerStats = {}
    mockTrainerMemberRequests.forEach(request => {
      if (!trainerStats[request.trainerId]) {
        trainerStats[request.trainerId] = { pending: 0, approved: 0, rejected: 0 }
      }
      trainerStats[request.trainerId][request.status]++
    })

    validationResults.summary.trainerStats = trainerStats
    validationResults.summary.uniqueTrainers = Object.keys(trainerStats).length

    if (validationResults.issues.length === 0) {
      dataLogger.info('Data consistency validation passed', validationResults.summary)
    } else {
      dataLogger.warn('Data consistency issues found', {
        issueCount: validationResults.issues.length,
        issues: validationResults.issues,
        summary: validationResults.summary
      })
    }

    return validationResults
  },

  generateSystemReport: () => {
    const consistencyCheck = mockDataStore.validateDataConsistency()
    
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: consistencyCheck.issues.length === 0 ? 'healthy' : 'issues_detected',
      statistics: {
        requests: {
          total: mockTrainerMemberRequests.length,
          pending: mockTrainerMemberRequests.filter(r => r.status === 'pending').length,
          approved: mockTrainerMemberRequests.filter(r => r.status === 'approved').length,
          rejected: mockTrainerMemberRequests.filter(r => r.status === 'rejected').length
        },
        notifications: {
          total: mockTrainerNotifications.length,
          unread: mockTrainerNotifications.filter(n => !n.isRead).length,
          byType: mockTrainerNotifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1
            return acc
          }, {})
        },
        members: {
          total: mockMembers.length,
          registered: mockMembers.filter(m => m.isRegistered).length,
          unregistered: mockMembers.filter(m => !m.isRegistered).length
        }
      },
      consistencyCheck,
      recommendations: []
    }

    // 추천 사항 생성
    if (consistencyCheck.issues.length > 0) {
      report.recommendations.push('데이터 일관성 문제를 해결하세요')
    }

    if (report.statistics.requests.pending > 10) {
      report.recommendations.push('대기 중인 요청이 많습니다. 처리를 검토하세요')
    }

    if (report.statistics.notifications.unread > 20) {
      report.recommendations.push('읽지 않은 알림이 많습니다. 정리를 권장합니다')
    }

    dataLogger.info('System report generated', {
      systemHealth: report.systemHealth,
      totalRequests: report.statistics.requests.total,
      issueCount: consistencyCheck.issues.length
    })

    return report
  }
}
