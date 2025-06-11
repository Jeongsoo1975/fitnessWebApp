import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser, searchValidUsers } from '@/lib/auth'

// GET /api/trainer/member-search - 회원 검색
export async function GET(request: NextRequest) {
  try {
    // 트레이너 권한 체크
    await requireRole('trainer')
    
    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    console.log('[trainer-member-search] GET - Searching for:', query)

    // Use existing auth validation for email-based search
    const searchResults = await searchValidUsers(query)

    return NextResponse.json({
      success: true,
      results: searchResults,
      count: searchResults.length
    })

  } catch (error) {
    console.error('Error searching members:', error)
    
    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    )
  }
}
