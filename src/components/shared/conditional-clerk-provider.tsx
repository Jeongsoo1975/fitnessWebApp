'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface ConditionalClerkProviderProps {
  children: ReactNode
}

export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  // Only render ClerkProvider in client-side with valid keys
  const hasValidKeys = 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder_key_for_build'

  if (!hasValidKeys) {
    return <>{children}</>
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}