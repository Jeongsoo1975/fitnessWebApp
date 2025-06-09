import { requireRole } from '@/lib/auth'
import { UserButton } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default async function TrainerDashboard() {
  await requireRole('trainer')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                트레이너 대시보드
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
              등록된 회원
            </h3>
            <div className="text-3xl font-bold text-blue-600">0</div>
            <p className="text-sm text-gray-500 mt-1">명</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              오늘 세션
            </h3>
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-sm text-gray-500 mt-1">건</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              이번 주 세션
            </h3>
            <div className="text-3xl font-bold text-purple-600">0</div>
            <p className="text-sm text-gray-500 mt-1">건</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            환영합니다! 👋
          </h2>
          <p className="text-gray-600">
            트레이너 대시보드에 오신 것을 환영합니다. 여기서 회원들의 운동 계획과 진행 상황을 관리할 수 있습니다.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">회원 관리</h4>
              <p className="text-sm text-gray-600 mb-3">
                새로운 회원을 등록하고 기존 회원들을 관리하세요
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                회원 관리 →
              </button>
            </div>
            
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">운동 계획</h4>
              <p className="text-sm text-gray-600 mb-3">
                회원별 맞춤 운동 계획을 작성하고 관리하세요
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                운동 계획 →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}