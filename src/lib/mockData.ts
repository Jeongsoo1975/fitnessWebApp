// 영속성 기반 mockDataStore로 교체
// 모든 기존 API는 동일하게 유지되며, 내부적으로 영속성 저장 수행

export { mockDataStore } from './persistentMockData'

// 기존 인터페이스들도 재export (하위 호환성 유지)
export type {
  MockSchedule,
  MockMember,
  MockMemberProfile,
  MockTrainerMemberRequest,
  MockTrainerNotification,
  MockMemberNotification,
  MockData
} from './dataTypes'
