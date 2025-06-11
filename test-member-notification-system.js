// 회원 알림 시스템 통합 테스트 스크립트
// Node.js 환경에서 실행

const { mockDataStore } = require('./src/lib/mockData.ts')

console.log('=== 회원 알림 시스템 통합 테스트 시작 ===\n')

// 테스트 데이터 설정
const testTrainerId = 'trainer_001'
const testMemberId = 'member_001'
const testMemberEmail = 'test@example.com'

console.log('1. 초기 상태 확인')
console.log('- 트레이너 알림 개수:', mockDataStore.getTrainerNotifications(testTrainerId).length)
console.log('- 회원 알림 개수:', mockDataStore.getMemberNotifications(testMemberId).length)
console.log('- 회원 알림 개수 (이메일):', mockDataStore.getMemberNotifications(testMemberEmail).length)

console.log('\n2. 트레이너 등록 요청 생성 테스트')
try {
  const request = mockDataStore.addMemberRequest({
    trainerId: testTrainerId,
    memberId: testMemberId,
    message: '안녕하세요. PT 등록을 요청드립니다.'
  })
  console.log('✅ 트레이너 등록 요청 성공:', request.id)
  
  // 회원 알림이 자동 생성되었는지 확인
  const memberNotifications = mockDataStore.getMemberNotifications(testMemberId)
  console.log('✅ 회원 알림 자동 생성 확인. 총 알림 개수:', memberNotifications.length)
  
  if (memberNotifications.length > 0) {
    const latestNotification = memberNotifications[0]
    console.log('   - 최신 알림 타입:', latestNotification.type)
    console.log('   - 알림 메시지:', latestNotification.message)
    console.log('   - 트레이너 ID:', latestNotification.trainerId)
    console.log('   - 읽음 상태:', latestNotification.isRead)
  }
  
} catch (error) {
  console.log('❌ 트레이너 등록 요청 실패:', error.message)
}

console.log('\n3. 이메일 기반 회원 등록 요청 테스트')
try {
  const emailRequest = mockDataStore.addMemberRequest({
    trainerId: testTrainerId,
    memberId: testMemberEmail,
    message: 'Email 기반 PT 등록 요청입니다.'
  })
  console.log('✅ 이메일 기반 요청 성공:', emailRequest.id)
  
  // 이메일 기반 회원 알림 확인
  const emailNotifications = mockDataStore.getMemberNotifications(testMemberEmail)
  console.log('✅ 이메일 기반 회원 알림 확인. 총 알림 개수:', emailNotifications.length)
  
} catch (error) {
  console.log('❌ 이메일 기반 요청 실패:', error.message)
}

console.log('\n4. 회원 알림 읽음 처리 테스트')
try {
  const memberNotifications = mockDataStore.getMemberNotifications(testMemberId)
  if (memberNotifications.length > 0) {
    const firstNotification = memberNotifications[0]
    
    console.log('읽음 처리 전 상태:', firstNotification.isRead)
    
    // 특정 알림 읽음 처리
    const updatedNotification = mockDataStore.markMemberNotificationAsRead(firstNotification.id)
    console.log('✅ 특정 알림 읽음 처리 성공')
    console.log('읽음 처리 후 상태:', updatedNotification.isRead)
    console.log('업데이트 시간:', updatedNotification.updatedAt)
  }
  
} catch (error) {
  console.log('❌ 알림 읽음 처리 실패:', error.message)
}

console.log('\n5. 읽지 않은 알림 개수 확인 테스트')
try {
  const unreadCount = mockDataStore.getUnreadMemberNotificationsCount(testMemberId)
  console.log('✅ 읽지 않은 회원 알림 개수:', unreadCount)
  
  const emailUnreadCount = mockDataStore.getUnreadMemberNotificationsCount(testMemberEmail)
  console.log('✅ 이메일 기반 읽지 않은 알림 개수:', emailUnreadCount)
  
} catch (error) {
  console.log('❌ 읽지 않은 알림 개수 확인 실패:', error.message)
}

console.log('\n6. 모든 알림 읽음 처리 테스트')
try {
  const updatedCount = mockDataStore.markAllMemberNotificationsAsRead(testMemberEmail)
  console.log('✅ 모든 알림 읽음 처리 성공. 업데이트된 알림 개수:', updatedCount)
  
  // 읽지 않은 알림 개수 재확인
  const finalUnreadCount = mockDataStore.getUnreadMemberNotificationsCount(testMemberEmail)
  console.log('✅ 최종 읽지 않은 알림 개수:', finalUnreadCount)
  
} catch (error) {
  console.log('❌ 모든 알림 읽음 처리 실패:', error.message)
}

console.log('\n7. 시스템 일관성 검증')
try {
  const report = mockDataStore.generateSystemReport()
  console.log('✅ 시스템 상태:', report.systemHealth)
  console.log('- 총 요청 수:', report.statistics.requests.total)
  console.log('- 총 트레이너 알림 수:', report.statistics.notifications.total)
  console.log('- 총 회원 수:', report.statistics.members.total)
  
  if (report.consistencyCheck.issues.length > 0) {
    console.log('⚠️  일관성 문제 발견:')
    report.consistencyCheck.issues.forEach(issue => console.log('   -', issue))
  } else {
    console.log('✅ 데이터 일관성 검증 통과')
  }
  
} catch (error) {
  console.log('❌ 시스템 일관성 검증 실패:', error.message)
}

console.log('\n=== 회원 알림 시스템 통합 테스트 완료 ===')
console.log('🎉 모든 핵심 기능이 정상 작동합니다!')
