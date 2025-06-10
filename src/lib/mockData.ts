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
  {
    id: '1',
    trainerId: 'user_2yGfgge9dGRBLeuxJSMzElVzite',
    memberId: '1',
    status: 'approved',
    message: '함께 운동하게 되어 기쁩니다!',
    createdAt: '2025-06-10T09:00:00Z',
    updatedAt: '2025-06-10T10:00:00Z'
  },
  {
    id: '2',
    trainerId: 'user_2yGfgge9dGRBLeuxJSMzElVzite',
    memberId: '5',
    status: 'approved',
    message: '건강한 운동 습관을 만들어보세요.',
    createdAt: '2025-06-10T11:00:00Z',
    updatedAt: '2025-06-10T12:00:00Z'
  }
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
    return [...mockTrainerMemberRequests]
  },

  updateRequestStatus: (id: string, status: 'approved' | 'rejected') => {
    const index = mockTrainerMemberRequests.findIndex(request => request.id === id)
    if (index !== -1) {
      mockTrainerMemberRequests[index] = {
        ...mockTrainerMemberRequests[index],
        status,
        updatedAt: new Date().toISOString()
      }
      
      // 승인시 회원의 isRegistered 상태 업데이트
      if (status === 'approved') {
        const memberIndex = mockMembers.findIndex(member => 
          member.id === mockTrainerMemberRequests[index].memberId
        )
        if (memberIndex !== -1) {
          mockMembers[memberIndex].isRegistered = true
        }
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
  }
}
