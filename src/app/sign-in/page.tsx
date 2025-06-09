import { SignIn } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            FitnessWebApp
          </h1>
          <p className="text-gray-600 mt-2">
            개인 PT 관리 시스템에 로그인하세요
          </p>
        </div>
        
        <SignIn 
          routing="hash"
          signUpUrl="/sign-up"
          redirectUrl="/onboarding"
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              card: 'shadow-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden'
            }
          }}
        />
      </div>
    </div>
  )
}