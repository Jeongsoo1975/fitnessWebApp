// Authentication utilities for FitnessWebApp
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { User } from '@clerk/nextjs/server'

export type UserRole = 'trainer' | 'member'

export interface AuthUser {
  id: string
  role?: UserRole
  emailAddresses: any[]
  publicMetadata: any
}

// Get current authenticated user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  if (!user) return null

  return {
    id: user.id,
    role: user.publicMetadata?.role as UserRole,
    emailAddresses: user.emailAddresses,
    publicMetadata: user.publicMetadata
  }
}

// Check if user has specific role
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  return user.role === requiredRole
}

// Require authentication (redirect to sign-in if not authenticated)
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
}

// Require specific role (redirect if not authorized)
export async function requireRole(requiredRole: UserRole) {
  await requireAuth()
  
  const user = await getCurrentUser()
  if (!user?.role) {
    redirect('/onboarding') // Redirect to role selection
  }
  
  if (user.role !== requiredRole) {
    redirect('/unauthorized')
  }
}

// Get user's role or redirect to onboarding
export async function getUserRole(): Promise<UserRole> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  if (!user.role) {
    redirect('/onboarding')
  }
  
  return user.role
}

// Check if user is trainer
export async function isTrainer(): Promise<boolean> {
  return await hasRole('trainer')
}

// Check if user is member
export async function isMember(): Promise<boolean> {
  return await hasRole('member')
}

// Redirect based on user role
export async function redirectBasedOnRole() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  if (!user.role) {
    redirect('/onboarding')
  }
  
  if (user.role === 'trainer') {
    redirect('/trainer/dashboard')
  } else {
    redirect('/member/dashboard')
  }
}

// ==================== User Validation Functions ====================

export interface ValidatedUser {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role?: UserRole
}

// Validate if a user exists by email using Clerk API
export async function validateUserByEmail(email: string): Promise<ValidatedUser | null> {
  try {
    console.log('[validateUserByEmail] Validating user with email:', email)
    
    const client = await clerkClient()
    const response = await client.users.getUserList({
      emailAddress: [email],
      limit: 1
    })
    
    console.log('[validateUserByEmail] Clerk API response:', response.data?.length || 0, 'users found')
    
    if (response.data && response.data.length > 0) {
      const user = response.data[0]
      const validatedUser: ValidatedUser = {
        id: user.id,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.emailAddresses[0]?.emailAddress || email,
        role: user.publicMetadata?.role as UserRole || undefined
      }
      
      console.log('[validateUserByEmail] User validated successfully:', validatedUser.id)
      return validatedUser
    }
    
    console.log('[validateUserByEmail] No user found with email:', email)
    return null
    
  } catch (error) {
    console.error('[validateUserByEmail] Error validating user:', error)
    
    // Return null instead of throwing to allow graceful handling
    return null
  }
}

// Search for valid users by email with additional validation
export async function searchValidUsers(query: string): Promise<ValidatedUser[]> {
  try {
    console.log('[searchValidUsers] Searching for users with query:', query)
    
    // Only search if query looks like an email
    if (!query.includes('@')) {
      console.log('[searchValidUsers] Query is not an email format, returning empty results')
      return []
    }
    
    const validatedUser = await validateUserByEmail(query)
    if (validatedUser) {
      console.log('[searchValidUsers] Found valid user:', validatedUser.id)
      return [validatedUser]
    }
    
    console.log('[searchValidUsers] No valid users found')
    return []
    
  } catch (error) {
    console.error('[searchValidUsers] Error searching valid users:', error)
    return []
  }
}

// Check if a user exists and has a specific role
export async function validateUserWithRole(email: string, expectedRole?: UserRole): Promise<boolean> {
  try {
    const user = await validateUserByEmail(email)
    
    if (!user) {
      console.log('[validateUserWithRole] User not found:', email)
      return false
    }
    
    if (expectedRole && user.role !== expectedRole) {
      console.log('[validateUserWithRole] User role mismatch. Expected:', expectedRole, 'Actual:', user.role)
      return false
    }
    
    console.log('[validateUserWithRole] User validation successful:', user.id)
    return true
    
  } catch (error) {
    console.error('[validateUserWithRole] Error validating user with role:', error)
    return false
  }
}