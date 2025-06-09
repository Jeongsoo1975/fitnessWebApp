// Client-side authentication hooks for FitnessWebApp
'use client'

import { useUser } from '@clerk/nextjs'
import type { UserRole } from '@/lib/auth'

export function useUserRole(): {
  role: UserRole | null
  isTrainer: boolean
  isMember: boolean
  isLoading: boolean
} {
  const { user, isLoaded } = useUser()
  
  const role = user?.publicMetadata?.role as UserRole | null
  
  return {
    role,
    isTrainer: role === 'trainer',
    isMember: role === 'member',
    isLoading: !isLoaded
  }
}

export function useRequireRole(requiredRole: UserRole) {
  const { role, isLoading } = useUserRole()
  
  return {
    hasAccess: role === requiredRole,
    isLoading,
    currentRole: role
  }
}

export function useAuthRedirect() {
  const { role, isLoading } = useUserRole()
  const { isSignedIn } = useUser()
  
  const getRedirectUrl = () => {
    if (!isSignedIn) return '/sign-in'
    if (!role) return '/onboarding'
    
    if (role === 'trainer') return '/trainer/dashboard'
    if (role === 'member') return '/member/dashboard'
    
    return '/'
  }
  
  return {
    redirectUrl: getRedirectUrl(),
    isLoading,
    isReady: !isLoading && isSignedIn && role
  }
}