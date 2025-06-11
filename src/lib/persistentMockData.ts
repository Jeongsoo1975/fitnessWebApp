Notifications[index]
    }
    return null
  }

  getUnreadMemberNotificationsCount = (memberId: string) => {
    const data = this.ensureData()
    const unreadCount = data.memberNotifications.filter(notification => 
      notification.memberId === memberId && !notification.isRead
    ).length
    dataLogger.debug('Unread member notifications count', { memberId, unreadCount })
    return unreadCount
  }

  markAllMemberNotificationsAsRead = async (memberId: string) => {
    await this.ensureInitialized()
    
    const data = this.ensureData()
    let updatedCount = 0
    data.memberNotifications.forEach((notification, index) => {
      if (notification.memberId === memberId && !notification.isRead) {
        data.memberNotifications[index] = {
          ...notification,
          isRead: true,
          updatedAt: new Date().toISOString()
        }
        updatedCount++
      }
    })
    
    if (updatedCount > 0) {
      await this.saveData()
    }
    
    dataLogger.info('Marked all member notifications as read', { 
      memberId, 
      updatedCount 
    })
    return updatedCount
  }

  // === 데이터 일관성 검증 메서드 ===
  validateDataConsistency = () => {
    const data = this.ensureData()
    const validationResults = {
      totalRequests: data.trainerMemberRequests.length,
      totalNotifications: data.trainerNotifications.length,
      totalMembers: data.members.length,
      issues: [] as string[],
      summary: {} as any
    }

    dataLogger.info('Starting data consistency validation')

    // 승인된 요청과 회원 등록 상태 일치 확인
    const approvedRequests = data.trainerMemberRequests.filter(r => r.status === 'approved')
    const registeredMembers = data.members.filter(m => m.isRegistered)
    
    validationResults.summary.approvedRequests = approvedRequests.length
    validationResults.summary.registeredMembers = registeredMembers.length

    // 알림과 승인된 요청 연결 확인
    const approvalNotifications = data.trainerNotifications.filter(n => n.type === 'member_approved')
    validationResults.summary.approvalNotifications = approvalNotifications.length

    if (approvedRequests.length !== approvalNotifications.length) {
      validationResults.issues.push(
        `승인된 요청(${approvedRequests.length})과 승인 알림(${approvalNotifications.length}) 수가 일치하지 않음`
      )
    }

    // 중복 요청 확인
    const duplicateRequests = []
    for (let i = 0; i < data.trainerMemberRequests.length; i++) {
      for (let j = i + 1; j < data.trainerMemberRequests.length; j++) {
        const req1 = data.trainerMemberRequests[i]
        const req2 = data.trainerMemberRequests[j]
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
    data.trainerMemberRequests.forEach(request => {
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
  }

  generateSystemReport = () => {
    const consistencyCheck = this.validateDataConsistency()
    const data = this.ensureData()
    
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: consistencyCheck.issues.length === 0 ? 'healthy' : 'issues_detected',
      statistics: {
        requests: {
          total: data.trainerMemberRequests.length,
          pending: data.trainerMemberRequests.filter(r => r.status === 'pending').length,
          approved: data.trainerMemberRequests.filter(r => r.status === 'approved').length,
          rejected: data.trainerMemberRequests.filter(r => r.status === 'rejected').length
        },
        notifications: {
          total: data.trainerNotifications.length,
          unread: data.trainerNotifications.filter(n => !n.isRead).length,
          byType: data.trainerNotifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1
            return acc
          }, {})
        },
        members: {
          total: data.members.length,
          registered: data.members.filter(m => m.isRegistered).length,
          unregistered: data.members.filter(m => !m.isRegistered).length
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

  // === 디버깅 및 관리 메서드 ===
  getStorageInfo = () => {
    return this.dataStore.getStorageInfo()
  }

  isReady = () => {
    return this.isInitialized && this.dataStore.isReady()
  }

  forceReload = async () => {
    await this.loadData()
    dataLogger.info('Data forcibly reloaded from storage')
  }

  getDataSnapshot = () => {
    return this.ensureData()
  }
}

// 전역 인스턴스 생성
const persistentMockDataStore = new PersistentMockDataStore()

// 기존 API와 동일한 인터페이스로 export
export const mockDataStore = {
  // 스케줄 관련
  getSchedules: persistentMockDataStore.getSchedules,
  addSchedule: persistentMockDataStore.addSchedule,
  deleteSchedule: persistentMockDataStore.deleteSchedule,
  updateSchedule: persistentMockDataStore.updateSchedule,
  
  // 회원 관련
  getMembers: persistentMockDataStore.getMembers,
  getMemberById: persistentMockDataStore.getMemberById,
  addMember: persistentMockDataStore.addMember,
  searchMembers: persistentMockDataStore.searchMembers,

  // 회원 요청 관련
  findMemberRequests: persistentMockDataStore.findMemberRequests,
  addMemberRequest: persistentMockDataStore.addMemberRequest,
  getMemberRequests: persistentMockDataStore.getMemberRequests,
  getMemberRequestsByEmail: persistentMockDataStore.getMemberRequestsByEmail,
  getAllRequests: persistentMockDataStore.getAllRequests,
  updateRequestStatus: persistentMockDataStore.updateRequestStatus,
  getTrainerMembers: persistentMockDataStore.getTrainerMembers,

  // 트레이너 알림 관련
  addTrainerNotification: persistentMockDataStore.addTrainerNotification,
  getTrainerNotifications: persistentMockDataStore.getTrainerNotifications,
  markTrainerNotificationAsRead: persistentMockDataStore.markTrainerNotificationAsRead,
  getUnreadTrainerNotificationsCount: persistentMockDataStore.getUnreadTrainerNotificationsCount,
  markAllTrainerNotificationsAsRead: persistentMockDataStore.markAllTrainerNotificationsAsRead,

  // 회원 알림 관련
  addMemberNotification: persistentMockDataStore.addMemberNotification,
  getMemberNotifications: persistentMockDataStore.getMemberNotifications,
  markMemberNotificationAsRead: persistentMockDataStore.markMemberNotificationAsRead,
  getUnreadMemberNotificationsCount: persistentMockDataStore.getUnreadMemberNotificationsCount,
  markAllMemberNotificationsAsRead: persistentMockDataStore.markAllMemberNotificationsAsRead,

  // 데이터 일관성 검증
  validateDataConsistency: persistentMockDataStore.validateDataConsistency,
  generateSystemReport: persistentMockDataStore.generateSystemReport,

  // 관리 메서드
  getStorageInfo: persistentMockDataStore.getStorageInfo,
  isReady: persistentMockDataStore.isReady,
  forceReload: persistentMockDataStore.forceReload,
  getDataSnapshot: persistentMockDataStore.getDataSnapshot
}

export default mockDataStore
