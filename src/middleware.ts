import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes
const isTrainerRoute = createRouteMatcher(['/trainer(.*)'])
const isMemberRoute = createRouteMatcher(['/member(.*)'])
const isProtectedRoute = createRouteMatcher([
  '/', // Root path for dashboard redirection
  '/trainer(.*)', 
  '/member(.*)', 
  '/profile(.*)',
  '/settings(.*)',
  '/workout(.*)',
  '/schedule(.*)'
])

// User cache for performance optimization
interface CachedUserData {
  userId: string
  role: string | null
  profileComplete: boolean
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// Simple in-memory cache (Edge Runtime compatible)
const userCache = new Map<string, CachedUserData>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 1000

// Cache management functions
function getCachedUser(userId: string): CachedUserData | null {
  const cached = userCache.get(userId)
  
  if (!cached) return null
  
  // Check if cache is expired
  if (Date.now() > cached.timestamp + cached.ttl) {
    userCache.delete(userId)
    return null
  }
  
  return cached
}

function setCachedUser(userId: string, role: string | null, profileComplete: boolean) {
  // Simple LRU - remove oldest entries if cache is full
  if (userCache.size >= MAX_CACHE_SIZE) {
    const oldestEntry = Array.from(userCache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0]
    
    if (oldestEntry) {
      userCache.delete(oldestEntry[0])
    }
  }
  
  userCache.set(userId, {
    userId,
    role,
    profileComplete,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  })
}

// Fetch user data from API
async function fetchUserData(userId: string, request: Request): Promise<{
  role: string | null
  profileComplete: boolean
} | null> {
  try {
    // Create internal API request URL
    const apiUrl = new URL('/api/user/role', request.url)
    
    // Create new request with Clerk auth headers
    const apiRequest = new Request(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': userId,
        'x-forwarded-host': request.headers.get('host') || '',
        'x-forwarded-proto': request.headers.get('x-forwarded-proto') || 'https'
      }
    })

    const response = await fetch(apiRequest)
    
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MIDDLEWARE] API call failed: ${response.status}`)
      }
      return null
    }

    const data = await response.json() as any
    
    if (!data.success || !data.data) {
      return null
    }

    const role = data.data.role || null
    
    // Check profile completeness if role exists
    let profileComplete = false
    
    if (role) {
      try {
        const profileApiUrl = new URL('/api/user/profile', request.url)
        const profileRequest = new Request(profileApiUrl.toString(), {
          method: 'POST', // POST for completeness check
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': userId,
            'x-forwarded-host': request.headers.get('host') || '',
            'x-forwarded-proto': request.headers.get('x-forwarded-proto') || 'https'
          }
        })

        const profileResponse = await fetch(profileRequest)
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json() as any
          profileComplete = profileData.data?.isComplete || false
        }
      } catch (profileError) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MIDDLEWARE] Profile check failed:`, profileError)
        }
        // Continue without profile check
      }
    }

    return { role, profileComplete }

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] fetchUserData error:`, error)
    }
    return null
  }
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // Development logging
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
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] No userId, redirecting to sign-in`)
    }
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Handle root path - always redirect to onboarding for role/profile check
  if (req.nextUrl.pathname === '/') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Root path, redirecting to onboarding`)
    }
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Skip API routes and static files from role checking
  if (req.nextUrl.pathname.startsWith('/api/') || 
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname.includes('.')) {
    return NextResponse.next()
  }

  // Get user data (cached or fresh)
  let userData: CachedUserData | null = getCachedUser(userId)
  
  if (!userData) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Cache miss, fetching user data for ${userId}`)
    }
    
    const fetchedData = await fetchUserData(userId, req)
    
    if (fetchedData) {
      setCachedUser(userId, fetchedData.role, fetchedData.profileComplete)
      userData = getCachedUser(userId)
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] Cache hit for ${userId}`)
  }

  // If we couldn't get user data, allow but log warning
  if (!userData) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Could not fetch user data, allowing with warning`)
    }
    // Allow access but they'll likely hit auth issues on the page
    return NextResponse.next()
  }

  const { role, profileComplete } = userData

  // If user has no role, redirect to onboarding
  if (!role) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] No role assigned, redirecting to onboarding`)
    }
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // If profile is incomplete, redirect to onboarding (except if already on onboarding)
  if (!profileComplete && !req.nextUrl.pathname.startsWith('/onboarding')) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Profile incomplete, redirecting to onboarding`)
    }
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  // Role-based route protection
  if (isTrainerRoute(req) && role !== 'trainer') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Non-trainer accessing trainer route, redirecting`)
    }
    
    // Redirect to appropriate dashboard
    const redirectUrl = role === 'member' ? '/member/dashboard' : '/onboarding'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  if (isMemberRoute(req) && role !== 'member') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Non-member accessing member route, redirecting`)
    }
    
    // Redirect to appropriate dashboard
    const redirectUrl = role === 'trainer' ? '/trainer/dashboard' : '/onboarding'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // All checks passed, allow access
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MIDDLEWARE] Access granted for ${role} to ${req.nextUrl.pathname}`)
  }

  // Add user info to headers for downstream use
  const response = NextResponse.next()
  response.headers.set('x-user-role', role)
  response.headers.set('x-user-profile-complete', profileComplete.toString())
  
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
