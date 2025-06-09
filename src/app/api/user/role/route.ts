import { auth, currentUser } from '@clerk/nextjs/server'
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
    
    // currentUser를 통해 사용자 정보 업데이트 시도
    const user = await currentUser()
    console.log('[API] Current user:', user?.id)
    
    // 대안: Clerk REST API 직접 호출
    const clerkResponse = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          role: role
        }
      })
    })

    if (!clerkResponse.ok) {
      const errorText = await clerkResponse.text()
      console.error('[API] Clerk REST API error:', clerkResponse.status, errorText)
      throw new Error(`Clerk API failed: ${clerkResponse.status}`)
    }

    const clerkResult = await clerkResponse.json()
    console.log('[API] Clerk REST API success:', clerkResult)

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
