import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600">
            이 페이지에 접근할 권한이 없습니다. 올바른 역할로 로그인했는지 확인해주세요.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            홈으로 돌아가기
          </Link>
          
          <Link
            href="/sign-in"
            className="block w-full py-2 px-4 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-md font-medium transition-colors"
          >
            다시 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}