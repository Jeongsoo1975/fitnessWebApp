import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isTrainerRoute = createRouteMatcher(['/trainer(.*)'])
const isMemberRoute = createRouteMatcher(['/member(.*)'])
const isProtectedRoute = createRouteMatcher([
  '/', // 1. 루트 경로 추가 - 인증된 사용자의 대시보드 리디렉션을 위해
  '/trainer(.*)', 
  '/member(.*)', 
  '/profile(.*)',
  '/settings(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // 개발 환경에서만 상세 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] ${req.method} ${req.nextUrl.pathname}`)
    console.log(`[MIDDLEWARE] userId: ${userId ? 'exists' : 'null'}`)
    console.log(`[MIDDLEWARE] isProtectedRoute: ${isProtectedRoute(req)}`)
  }
  
  // Allow public routes
  if (!isProtectedRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Allowing public route: ${req.nextUrl.pathname}`)
    }
    return NextResponse.next()
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // 루트 경로 접근 시 onboarding으로 리디렉션
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // 대시보드 경로는 일단 허용 (클라이언트에서 역할 확인)
  if (isTrainerRoute(req) || isMemberRoute(req)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Allowing dashboard route - role will be checked client-side`)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
