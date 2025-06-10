import { requireRole } from '@/lib/auth'
import DashboardLayout from '@/components/shared/layout'

export default async function TestIntegrationPage() {
  // 트레이너 권한 체크 (테스트용)
  await requireRole('trainer')

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 페이지 헤더 */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">매칭 시스템 통합 테스트</h1>
          <p className="mt-2 text-sm text-gray-600">
            트레이너-회원 매칭 시스템의 전체 플로우를 테스트할 수 있습니다.
          </p>
        </div>

        {/* 테스트 플로우 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 mb-4">🧪 테스트 플로우</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">1. 트레이너 역할 테스트</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <a href="/trainer/members" className="underline hover:text-blue-900">회원 관리 페이지</a>로 이동</li>
                <li>• "회원 검색" 탭에서 회원 검색 (예: "김", "이", "박" 등)</li>
                <li>• 원하는 회원에게 "등록 요청" 버튼 클릭</li>
                <li>• 메시지 작성 후 요청 전송</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">2. 회원 역할 테스트</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 우상단 역할 전환 버튼으로 "회원"으로 변경</li>
                <li>• <a href="/member/notifications" className="underline hover:text-blue-900">알림 페이지</a>로 이동</li>
                <li>• 받은 트레이너 요청 확인</li>
                <li>• "승인" 또는 "거절" 버튼 클릭</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">3. 스케줄 연동 테스트</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 다시 "트레이너"로 역할 전환</li>
                <li>• <a href="/trainer/schedule" className="underline hover:text-blue-900">일정 관리 페이지</a>로 이동</li>
                <li>• 새 일정 추가 시 승인된 회원이 드롭다운에 표시되는지 확인</li>
                <li>• PT 세션 일정 생성 테스트</li>
              </ul>
            </div>
          </div>
        </div>

        {/* UX 개선사항 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-green-900 mb-4">✨ UX 개선사항</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">토스트 알림 시스템</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 등록 요청 전송 시 성공 알림</li>
                <li>• 요청 승인/거절 시 상태 알림</li>
                <li>• 자동 사라지는 알림 (5초)</li>
                <li>• 수동 닫기 가능</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">실시간 업데이트</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 알림 페이지 30초마다 자동 새로고침</li>
                <li>• 검색 결과 실시간 필터링 (디바운스)</li>
                <li>• 요청 상태별 개수 실시간 표시</li>
                <li>• 로딩 상태 및 에러 처리</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">사용자 피드백</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 로딩 스피너 표시</li>
                <li>• 빈 상태 안내 메시지</li>
                <li>• 에러 상황 명확한 안내</li>
                <li>• 버튼 비활성화 상태 표시</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">반응형 디자인</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 모바일/태블릿/데스크탑 대응</li>
                <li>• 터치 친화적 버튼 크기</li>
                <li>• 읽기 쉬운 폰트 크기</li>
                <li>• 접근성 고려한 색상 대비</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 테스트 데이터 정보 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-yellow-900 mb-4">📊 테스트 데이터</h2>
          <div className="text-sm text-yellow-800">
            <p className="mb-2">다음 회원들이 mockDataStore에 등록되어 있습니다:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded p-3 border border-yellow-100">
                <h4 className="font-medium mb-2">등록 가능한 회원 (isRegistered: false)</h4>
                <ul className="space-y-1">
                  <li>• 이회원 (member2@example.com)</li>
                  <li>• 박회원 (member3@example.com)</li>
                  <li>• 최회원 (member4@example.com)</li>
                  <li>• 강회원 (member6@example.com)</li>
                  <li>• 윤회원 (member7@example.com)</li>
                  <li>• 장회원 (member8@example.com)</li>
                </ul>
              </div>
              
              <div className="bg-white rounded p-3 border border-yellow-100">
                <h4 className="font-medium mb-2">이미 등록된 회원 (isRegistered: true)</h4>
                <ul className="space-y-1">
                  <li>• 김회원 (member1@example.com)</li>
                  <li>• 정회원 (member5@example.com)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <a
            href="/trainer/members"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            트레이너 회원 관리
          </a>
          <a
            href="/member/notifications"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            회원 알림 확인
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
