import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

export const runtime = 'edge'

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

    // URL 파라미터 추출
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''

    // mockDataStore를 사용한 회원 검색
    const searchResults = mockDataStore.searchMembers(query)
    
    // 이미 등록된 회원 필터링 (isRegistered가 true인 회원 제외)
    const availableMembers = searchResults.filter(member => !member.isRegistered)

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Member search - Query:', query)
      console.log('Total results:', searchResults.length)
      console.log('Available (unregistered) members:', availableMembers.length)
    }

    return NextResponse.json({
      success: true,
      members: availableMembers.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        isRegistered: member.isRegistered
      })),
      count: availableMembers.length
    })

  } catch (error) {
    console.error('Error searching members:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    )
  }
}
