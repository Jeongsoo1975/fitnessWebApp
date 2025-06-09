import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/user/role called')
    
    const { userId } = await auth()
    console.log('[API] User ID from auth:', userId)
    
    if (!userId) {
      console.log('[API] No userId found - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('[API] Request body:', body)
    
    const { role } = body
    
    if (!role || !['trainer', 'member'].includes(role)) {
      console.log('[API] Invalid role:', role)
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    console.log('[API] Updating user metadata for userId:', userId, 'with role:', role)
    
    // Update user metadata using Clerk's server-side API
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role
      }
    })

    console.log('[API] Successfully updated user metadata')
    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('[API] Detailed error in /api/user/role:', error)
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack available')
    return NextResponse.json(
      { error: 'Failed to update user role' }, 
      { status: 500 }
    )
  }
}
