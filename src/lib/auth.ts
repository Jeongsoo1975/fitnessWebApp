// Authentication utilities for FitnessWebApp
import { auth, currentUser } from '@clerk/nextjs/server'
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