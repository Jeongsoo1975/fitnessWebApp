ainerNotifications.length,
          unread: data.trainerNotifications.filter(n => !n.isRead).length,
          byType: data.trainerNotifications.reduce((acc: any, n) => {
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
      recommendations: [] as string[]
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

  // === 복구 시스템 통합 메서드 ===
  createBackup = async () => {
    const data = this.ensureData()
    return await dataRecoveryUtils.createBackup(data)
  }

  restoreFromBackup = async () => {
    const restoredData = await dataRecoveryUtils.restoreFromBackup()
    if (restoredData) {
      this.memoryCache = restoredData
      await this.saveData()
      dataLogger.info('Data restored from backup successfully')
      return true
    }
    return false
  }

  diagnoseSystem = async () => {
    return await dataRecoveryUtils.diagnoseSystem()
  }

  getBackupList = async () => {
    return await dataRecoveryUtils.getBackupList()
  }

  performManualRecovery = async (source: 'backup' | 'empty' = 'backup') => {
    const result = await dataRecoveryUtils.performManualRecovery(source)
    if (result.success) {
      await this.loadData()
    }
    return result
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

  // === 매칭 품질 모니터링 메서드 ===
  getMatchingMonitorReport = () => {
    return globalMatchingMonitor.getReport()
  }

  resetMatchingMonitor = () => {
    globalMatchingMonitor.reset()
    dataLogger.info('Matching monitor reset')
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

  // 회원 요청 관련 (개선된 매칭 시스템)
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

  // 복구 시스템
  createBackup: persistentMockDataStore.createBackup,
  restoreFromBackup: persistentMockDataStore.restoreFromBackup,
  diagnoseSystem: persistentMockDataStore.diagnoseSystem,
  getBackupList: persistentMockDataStore.getBackupList,
  performManualRecovery: persistentMockDataStore.performManualRecovery,

  // 관리 메서드
  getStorageInfo: persistentMockDataStore.getStorageInfo,
  isReady: persistentMockDataStore.isReady,
  forceReload: persistentMockDataStore.forceReload,
  getDataSnapshot: persistentMockDataStore.getDataSnapshot,

  // 매칭 품질 모니터링
  getMatchingMonitorReport: persistentMockDataStore.getMatchingMonitorReport,
  resetMatchingMonitor: persistentMockDataStore.resetMatchingMonitor
}

export default mockDataStore