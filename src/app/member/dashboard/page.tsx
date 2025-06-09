import { requireRole } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default async function MemberDashboard() {
  await requireRole('member')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                회원 대시보드
              </h1>
            </div>
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              남은 PT 세션
            </h3>
            <div className="text-3xl font-bold text-blue-600">0</div>
            <p className="text-sm text-gray-500 mt-1">회</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              이번 주 운동
            </h3>
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-500 mt-1">회</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              현재 체중
            </h3>
            <div className="text-3xl font-bold text-purple-600">-</div>
            <p className="text-sm text-gray-500 mt-1">kg</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            안녕하세요! 💪
          </h2>
          <p className="text-gray-600">
            회원 대시보드에 오신 것을 환영합니다. 여기서 운동 계획을 확인하고 진행 상황을 추적할 수 있습니다.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">오늘의 운동</h4>
              <p className="text-sm text-gray-600 mb-3">
                트레이너가 계획한 오늘의 운동을 확인하세요
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                운동 계획 보기 →
              </button>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">식단 기록</h4>
              <p className="text-sm text-gray-600 mb-3">
                오늘 섭취한 음식을 기록하고 관리하세요
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                식단 기록 →
              </button>
            </div>
          </div>
        </div>

        {/* Trainer Information */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            담당 트레이너
          </h3>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">없음</span>
            </div>
            <div>
              <p className="text-gray-600">
                아직 담당 트레이너가 배정되지 않았습니다.
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1">
                트레이너 찾기 →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}