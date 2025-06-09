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
  const { userId, sessionClaims } = await auth()
  
  // Allow public routes
  if (!isProtectedRoute(req)) {
    return NextResponse.next()
  }

  // Redirect to sign-in if not authenticated
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from session claims (using publicMetadata for consistency)
  const userRole = (sessionClaims?.publicMetadata as any)?.role as string

  // Handle root redirect for authenticated users
  if (req.nextUrl.pathname === '/') {
    if (userRole === 'trainer') {
      return NextResponse.redirect(new URL('/trainer/dashboard', req.url))
    } else if (userRole === 'member') {
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
    }
    // If authenticated but no role, they will be sent to onboarding next.
  }

  // Redirect to onboarding if no role is set and not already on onboarding
  if (!userRole && req.nextUrl.pathname !== '/onboarding') { // 2. 무한 루프 방지
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Check trainer route access
  if (isTrainerRoute(req) && userRole !== 'trainer') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // Check member route access
  if (isMemberRoute(req) && userRole !== 'member') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
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
