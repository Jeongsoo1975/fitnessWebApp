import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    
    if (!role || !['trainer', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update user metadata using Clerk's server-side API
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role
      }
    })

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Failed to update user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' }, 
      { status: 500 }
    )
  }
}
