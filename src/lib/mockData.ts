// 개발 환경용 임시 데이터 저장소
// 실제 데이터베이스가 없을 때 사용

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

let mockTrainerMemberRequests: MockTrainerMemberRequest[] = [
  // 실제 요청만 남겨두고 샘플 데이터는 제거
  // 트레이너가 실제로 요청을 보내면 여기에 추가됩니다
]

let mockTrainerNotifications: MockTrainerNotification[] = [
  // 실제 알림만 남겨두고 샘플 데이터는 제거
  // 회원이 승인하면 여기에 알림이 자동으로 추가됩니다
]

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

  // 새로운 회원 추가 함수
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

  // 회원 매칭 시스템
  searchMembers: (query: string) => {
    const lowerQuery = query.toLowerCase()
    return mockMembers.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const email = member.email.toLowerCase()
      return fullName.includes(lowerQuery) || email.includes(lowerQuery)
    })
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
    
    // 디버깅: 추가된 요청 로깅
    console.log('🔥 [addMemberRequest] NEW REQUEST ADDED:')
    console.log('- Request ID:', newRequest.id)
    console.log('- Trainer ID:', newRequest.trainerId)
    console.log('- Member ID:', newRequest.memberId)
    console.log('- Status:', newRequest.status)
    console.log('- Message:', newRequest.message)
    console.log('- Total requests in system:', mockTrainerMemberRequests.length)
    console.log('- All requests:', mockTrainerMemberRequests.map(r => ({ id: r.id, trainerId: r.trainerId, memberId: r.memberId, status: r.status })))
    
    return newRequest
  },

  getMemberRequests: (memberId: string) => {
    console.log('[getMemberRequests] Searching for memberId:', memberId)
    const directMatches = mockTrainerMemberRequests.filter(request => request.memberId === memberId)
    console.log('[getMemberRequests] Direct matches found:', directMatches.length)
    return directMatches
  },

  // 이메일로도 요청 검색 가능 - 향상된 매칭 로직
  getMemberRequestsByEmail: (email: string) => {
    console.log('[getMemberRequestsByEmail] Searching for email:', email)
    
    // 정확한 이메일 매칭
    const exactMatches = mockTrainerMemberRequests.filter(request => 
      request.memberId === email
    )
    console.log('[getMemberRequestsByEmail] Exact email matches:', exactMatches.length)
    
    if (exactMatches.length > 0) {
      return exactMatches
    }
    
    // 이메일 사용자명 부분으로 매칭 (예: teamqc0508@gmail.com과 teamqc0508@google.com)
    const emailUsername = email.split('@')[0]
    const usernameMatches = mockTrainerMemberRequests.filter(request => {
      if (request.memberId.includes('@')) {
        const requestUsername = request.memberId.split('@')[0]
        return requestUsername === emailUsername
      }
      return false
    })
    console.log('[getMemberRequestsByEmail] Username matches:', usernameMatches.length, 'for username:', emailUsername)
    
    if (usernameMatches.length > 0) {
      console.log('[getMemberRequestsByEmail] Found matches by username:', usernameMatches)
      return usernameMatches
    }
    
    // 부분 문자열 매칭 (폴백)
    const partialMatches = mockTrainerMemberRequests.filter(request => 
      request.memberId.includes(email) || email.includes(request.memberId)
    )
    console.log('[getMemberRequestsByEmail] Partial matches:', partialMatches.length)
    
    return partialMatches
  },

  // 디버깅용: 모든 요청 조회
  getAllRequests: () => {
    console.log('🔥 [getAllRequests] Current system state:')
    console.log('- Total requests:', mockTrainerMemberRequests.length)
    console.log('- Requests details:', mockTrainerMemberRequests.map(r => ({
      id: r.id,
      trainerId: r.trainerId,
      memberId: r.memberId,
      status: r.status,
      message: r.message?.substring(0, 50) + '...',
      createdAt: r.createdAt
    })))
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
          // 이메일인 경우 사용자명을 추출하여 이름 생성
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
        console.log('[updateRequestStatus] Created trainer notification:', notification)
      }
      
      return mockTrainerMemberRequests[index]
    }
    return null
  },

  getTrainerMembers: (trainerId: string) => {
    console.log('[getTrainerMembers] Searching for trainerId:', trainerId)
    
    const approvedRequests = mockTrainerMemberRequests.filter(
      request => request.trainerId === trainerId && request.status === 'approved'
    )
    
    console.log('[getTrainerMembers] Found approved requests:', approvedRequests.length)
    console.log('[getTrainerMembers] Approved requests details:', approvedRequests)
    
    if (approvedRequests.length === 0) {
      console.log('[getTrainerMembers] No approved requests found for trainerId:', trainerId)
      console.log('[getTrainerMembers] Available trainer IDs in system:', 
        [...new Set(mockTrainerMemberRequests.map(r => r.trainerId))]
      )
    }
    
    const members = approvedRequests.map(request => {
      // memberId가 이메일인 경우 해당 이메일을 기반으로 회원 정보 생성
      if (request.memberId.includes('@')) {
        const emailParts = request.memberId.split('@')
        const username = emailParts[0]
        
        const memberInfo = {
          id: request.memberId,
          firstName: username.charAt(0).toUpperCase() + username.slice(1),
          lastName: '회원',
          email: request.memberId,
          requestId: request.id,
          isRegistered: true
        }
        
        console.log('[getTrainerMembers] Generated member info from email:', memberInfo)
        return memberInfo
      } else {
        // 기존 mock 회원 데이터에서 찾기
        const member = mockMembers.find(m => m.id === request.memberId)
        if (member) {
          const memberInfo = { ...member, requestId: request.id }
          console.log('[getTrainerMembers] Found member in mock data:', memberInfo)
          return memberInfo
        } else {
          console.log('[getTrainerMembers] Member not found in mock data for ID:', request.memberId)
          return null
        }
      }
    }).filter(Boolean)
    
    console.log('[getTrainerMembers] Final members list:', members)
    return members
  },

  // 트레이너 알림 관련 메소드들
  addTrainerNotification: (notification: Omit<MockTrainerNotification, 'id' | 'createdAt'>) => {
    const newNotification: MockTrainerNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    mockTrainerNotifications.push(newNotification)
    console.log('[addTrainerNotification] Added notification:', newNotification)
    return newNotification
  },

  getTrainerNotifications: (trainerId: string) => {
    console.log('[getTrainerNotifications] Searching for trainerId:', trainerId)
    const notifications = mockTrainerNotifications.filter(notification => 
      notification.trainerId === trainerId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log('[getTrainerNotifications] Found notifications:', notifications.length)
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
      console.log('[markTrainerNotificationAsRead] Marked as read:', id)
      return mockTrainerNotifications[index]
    }
    return null
  },

  // 트레이너의 읽지 않은 알림 개수 조회
  getUnreadTrainerNotificationsCount: (trainerId: string) => {
    const unreadCount = mockTrainerNotifications.filter(notification => 
      notification.trainerId === trainerId && !notification.isRead
    ).length
    console.log('[getUnreadTrainerNotificationsCount] Unread count for trainer:', trainerId, unreadCount)
    return unreadCount
  },

  // 트레이너의 모든 알림을 읽음 처리
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
    console.log('[markAllTrainerNotificationsAsRead] Marked', updatedCount, 'notifications as read')
    return updatedCount
  }
}
