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
  // auth()를 await해서 sessionClaims 업데이트를 보장
  const { userId, sessionClaims } = await auth()
  
  console.log(`[MIDDLEWARE] ${req.method} ${req.nextUrl.pathname}`)
  console.log(`[MIDDLEWARE] userId: ${userId ? 'exists' : 'null'}`)
  console.log(`[MIDDLEWARE] isProtectedRoute: ${isProtectedRoute(req)}`)
  
  // Allow public routes
  if (!isProtectedRoute(req)) {
    console.log(`[MIDDLEWARE] Allowing public route: ${req.nextUrl.pathname}`)
    return NextResponse.next()
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    console.log(`[MIDDLEWARE] No userId, redirecting to sign-in`)
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from session claims - 여러 방법으로 시도
  let userRole = (sessionClaims?.publicMetadata as any)?.role as string
  
  // sessionClaims가 비어있으면 role query parameter 확인 (임시 해결책)
  if (!userRole) {
    const urlRole = req.nextUrl.searchParams.get('role')
    if (urlRole && ['trainer', 'member'].includes(urlRole)) {
      userRole = urlRole
      console.log(`[MIDDLEWARE] Using role from URL parameter: ${userRole}`)
    }
  }
  
  console.log(`[MIDDLEWARE] userRole from sessionClaims: ${userRole || 'undefined'}`)
  console.log(`[MIDDLEWARE] full sessionClaims.publicMetadata:`, sessionClaims?.publicMetadata)

  // Handle root redirect for authenticated users
  if (req.nextUrl.pathname === '/') {
    console.log(`[MIDDLEWARE] Root path detected, userRole: ${userRole}`)
    if (userRole === 'trainer') {
      console.log(`[MIDDLEWARE] Redirecting trainer to dashboard`)
      return NextResponse.redirect(new URL('/trainer/dashboard', req.url))
    } else if (userRole === 'member') {
      console.log(`[MIDDLEWARE] Redirecting member to dashboard`)
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
    }
    // If authenticated but no role, they will be sent to onboarding next.
    console.log(`[MIDDLEWARE] User has no role, will check onboarding redirect`)
  }

  // Redirect to onboarding if no role is set and not already on onboarding
  if (!userRole && req.nextUrl.pathname !== '/onboarding') { // 2. 무한 루프 방지
    console.log(`[MIDDLEWARE] No role and not on onboarding, redirecting to onboarding`)
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Check trainer route access
  if (isTrainerRoute(req) && userRole !== 'trainer') {
    console.log(`[MIDDLEWARE] Trainer route access denied for role: ${userRole}, redirecting to unauthorized`)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Check member route access
  if (isMemberRoute(req) && userRole !== 'member') {
    console.log(`[MIDDLEWARE] Member route access denied for role: ${userRole}, redirecting to unauthorized`)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  console.log(`[MIDDLEWARE] Allowing request to proceed: ${req.nextUrl.pathname}`)
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
