import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { userId } = await auth()
  
  // 인증된 사용자는 middleware에서 자동으로 리디렉션됨
  // 여기서는 리디렉션하지 않음

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FitnessWebApp
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              트레이너와 회원을 위한 통합 피트니스 관리 플랫폼
            </p>
            <p className="text-gray-600">
              PT 세션, 운동 계획, 식단 관리, 진행 현황을 한 곳에서
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Trainer Card */}
            <Link href="/sign-up" className="group">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">트레이너</h3>
                <p className="text-gray-600 text-sm mb-4">
                  회원 관리, PT 세션 진행, 운동 계획 수립
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md group-hover:bg-blue-700 transition-colors">
                    트레이너로 시작하기
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* Member Card */}
            <Link href="/sign-up" className="group">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent group-hover:border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">회원</h3>
                <p className="text-gray-600 text-sm mb-4">
                  운동 기록, 식단 관리, 진행 현황 추적
                </p>
                <div className="text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md group-hover:bg-green-700 transition-colors">
                    회원으로 시작하기
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 text-center">
              역할을 선택하여 바로 시작하거나, 아래에서 일반 회원가입을 진행하세요
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                회원가입하기
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
              >
                로그인
              </Link>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
