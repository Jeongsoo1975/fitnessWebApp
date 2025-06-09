import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isTrainerRoute = createRouteMatcher(['/trainer(.*)'])
const isMemberRoute = createRouteMatcher(['/member(.*)'])
const isProtectedRoute = createRouteMatcher([
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

  // Redirect to onboarding if no role is set
  if (!userRole) {
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

  // Redirect root to appropriate dashboard
  if (req.nextUrl.pathname === '/') {
    if (userRole === 'trainer') {
      return NextResponse.redirect(new URL('/trainer/dashboard', req.url))
    } else if (userRole === 'member') {
      return NextResponse.redirect(new URL('/member/dashboard', req.url))
    }
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