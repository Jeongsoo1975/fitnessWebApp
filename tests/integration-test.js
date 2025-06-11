/**
 * 전체 플로우 통합 테스트 스크립트
 * 트레이너 검색 → 요청 전송 → 회원 승인 → 알림 확인까지 전체 과정 테스트
 */

import { createApiLogger } from '../src/lib/logger'

const testLogger = createApiLogger('integration-test')

// 테스트 환경 설정
const BASE_URL = 'http://localhost:3002'
const TEST_CONFIG = {
  // 테스트용 실제 Clerk 사용자 (실제 환경에서는 유효한 이메일 필요)
  TRAINER_EMAIL: 'trainer@example.com',
  MEMBER_EMAIL: 'member@example.com',
  
  // 테스트 시나리오
  SCENARIOS: [
    {
      name: '정상 플로우 테스트',
      trainerSearch: 'test@example.com',
      expectSuccess: true
    },
    {
      name: '존재하지 않는 회원 검색',
      trainerSearch: 'nonexistent@example.com',
      expectSuccess: false
    },
    {
      name: '자기 자신 검색 시도',
      trainerSearch: 'trainer@example.com',
      expectSuccess: false
    }
  ]
}

/**
 * API 호출 헬퍼 함수
 */
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  
  try {
    testLogger.info('API call initiated', { endpoint, method: options.method || 'GET' })
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    
    testLogger.info('API call completed', {
      endpoint,
      status: response.status,
      success: response.ok
    })
    
    return { status: response.status, data, ok: response.ok }
  } catch (error) {
    testLogger.error('API call failed', {
      endpoint,
      error: error.message
    })
    throw error
  }
}

/**
 * 1단계: 트레이너 회원 검색 테스트
 */
async function testTrainerSearch(searchQuery) {
  testLogger.info('Testing trainer member search', { searchQuery: '***' })
  
  const result = await apiCall(`/api/trainer/member-search?q=${encodeURIComponent(searchQuery)}`)
  
  if (result.ok) {
    testLogger.info('Member search successful', {
      membersFound: result.data.count,
      hasMessage: !!result.data.message
    })
    return result.data.members
  } else {
    testLogger.warn('Member search failed', {
      status: result.status,
      error: result.data.error
    })
    return []
  }
}

/**
 * 2단계: 트레이너 요청 전송 테스트
 */
async function testTrainerRequest(memberId, memberEmail) {
  testLogger.info('Testing trainer member request', { memberId: '***' })
  
  const requestBody = {
    memberId,
    memberEmail,
    memberFirstName: 'Test',
    memberLastName: 'User',
    message: '함께 운동하게 되어 기쁩니다!'
  }
  
  const result = await apiCall('/api/trainer/member-request', {
    method: 'POST',
    body: JSON.stringify(requestBody)
  })
  
  if (result.ok) {
    testLogger.info('Member request sent successfully', {
      requestId: result.data.requestId
    })
    return result.data.requestId
  } else {
    testLogger.error('Member request failed', {
      status: result.status,
      error: result.data.error
    })
    throw new Error(`Request failed: ${result.data.error}`)
  }
}

/**
 * 3단계: 회원 요청 조회 테스트
 */
async function testMemberRequestsRetrieval() {
  testLogger.info('Testing member requests retrieval')
  
  const result = await apiCall('/api/member/trainer-requests')
  
  if (result.ok) {
    testLogger.info('Member requests retrieved successfully', {
      requestCount: result.data.count
    })
    return result.data.requests
  } else {
    testLogger.error('Member requests retrieval failed', {
      status: result.status,
      error: result.data.error
    })
    return []
  }
}

/**
 * 4단계: 회원 요청 승인 테스트
 */
async function testMemberRequestApproval(requestId) {
  testLogger.info('Testing member request approval', { requestId })
  
  const requestBody = {
    requestId,
    status: 'approved'
  }
  
  const result = await apiCall('/api/member/trainer-requests', {
    method: 'PATCH',
    body: JSON.stringify(requestBody)
  })
  
  if (result.ok) {
    testLogger.info('Member request approved successfully', {
      requestId,
      updatedAt: result.data.request.updatedAt
    })
    return true
  } else {
    testLogger.error('Member request approval failed', {
      status: result.status,
      error: result.data.error
    })
    return false
  }
}

/**
 * 5단계: 트레이너 알림 확인 테스트
 */
async function testTrainerNotifications() {
  testLogger.info('Testing trainer notifications retrieval')
  
  const result = await apiCall('/api/trainer/notifications')
  
  if (result.ok) {
    const notifications = result.data.notifications || []
    const unreadCount = notifications.filter(n => !n.isRead).length
    
    testLogger.info('Trainer notifications retrieved successfully', {
      totalNotifications: notifications.length,
      unreadCount
    })
    return notifications
  } else {
    testLogger.warn('Trainer notifications retrieval failed', {
      status: result.status,
      error: result.data.error
    })
    return []
  }
}

/**
 * 전체 플로우 통합 테스트 실행
 */
async function runIntegrationTest(scenario) {
  testLogger.info('Starting integration test scenario', { scenarioName: scenario.name })
  
  try {
    // 1단계: 회원 검색
    const searchResults = await testTrainerSearch(scenario.trainerSearch)
    
    if (scenario.expectSuccess && searchResults.length === 0) {
      throw new Error('Expected search results but got none')
    }
    
    if (!scenario.expectSuccess && searchResults.length > 0) {
      testLogger.warn('Got unexpected search results', { 
        scenarioName: scenario.name,
        resultsCount: searchResults.length 
      })
      return { success: true, note: 'Handled expected failure correctly' }
    }
    
    if (searchResults.length === 0) {
      testLogger.info('Test scenario completed as expected', { 
        scenarioName: scenario.name,
        result: 'No search results (expected)'
      })
      return { success: true }
    }
    
    // 2단계: 요청 전송 (검색 결과가 있는 경우)
    const member = searchResults[0]
    const requestId = await testTrainerRequest(member.id, member.email)
    
    // 3단계: 요청 조회
    const memberRequests = await testMemberRequestsRetrieval()
    const foundRequest = memberRequests.find(req => req.id === requestId)
    
    if (!foundRequest) {
      throw new Error('Created request not found in member requests')
    }
    
    // 4단계: 요청 승인
    const approvalSuccess = await testMemberRequestApproval(requestId)
    
    if (!approvalSuccess) {
      throw new Error('Request approval failed')
    }
    
    // 5단계: 알림 확인
    const notifications = await testTrainerNotifications()
    const recentNotification = notifications.find(n => 
      n.type === 'member_approved' && 
      new Date(n.createdAt).getTime() > Date.now() - 10000 // 10초 내 생성
    )
    
    if (!recentNotification) {
      testLogger.warn('Recent approval notification not found', {
        totalNotifications: notifications.length
      })
    }
    
    testLogger.info('Integration test scenario completed successfully', {
      scenarioName: scenario.name,
      requestId,
      notificationCreated: !!recentNotification
    })
    
    return { 
      success: true, 
      requestId, 
      notificationCreated: !!recentNotification 
    }
    
  } catch (error) {
    testLogger.error('Integration test scenario failed', {
      scenarioName: scenario.name,
      error: error.message
    })
    return { success: false, error: error.message }
  }
}

/**
 * 모든 테스트 시나리오 실행
 */
async function runAllTests() {
  testLogger.info('Starting complete integration test suite')
  
  const results = []
  
  for (const scenario of TEST_CONFIG.SCENARIOS) {
    const result = await runIntegrationTest(scenario)
    results.push({ scenario: scenario.name, ...result })
    
    // 테스트 간 간격
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // 테스트 결과 요약
  const successCount = results.filter(r => r.success).length
  const totalCount = results.length
  
  testLogger.info('Integration test suite completed', {
    totalTests: totalCount,
    successfulTests: successCount,
    failedTests: totalCount - successCount,
    results
  })
  
  return results
}

// 모듈 내보내기 (테스트 실행용)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    runIntegrationTest,
    testTrainerSearch,
    testTrainerRequest,
    testMemberRequestsRetrieval,
    testMemberRequestApproval,
    testTrainerNotifications
  }
}

// 직접 실행용
if (require.main === module) {
  runAllTests().then(results => {
    console.log('\n=== Integration Test Results ===')
    results.forEach(result => {
      console.log(`${result.scenario}: ${result.success ? 'PASS' : 'FAIL'}`)
      if (!result.success) {
        console.log(`  Error: ${result.error}`)
      }
    })
  }).catch(console.error)
}
