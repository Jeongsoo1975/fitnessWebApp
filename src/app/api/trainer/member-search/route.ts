import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// Clerk Client는 서버리스 환경에서 제한적이므로 백엔드 API 대신 간단한 시뮬레이션 사용

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

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Member search - Query:', query)
    }

    let searchResults = []

    try {
      // 실제 이메일로 검색하는 경우, 임시 사용자 정보 반환
      if (query.includes('@')) {
        // 현재 사용자의 이메일과 다른 경우에만 검색 결과 반환
        const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
        
        if (query !== currentUserEmail) {
          // 실제 회원 계정이 있다고 가정하고 검색 결과 반환
          const emailParts = query.split('@')
          const username = emailParts[0]
          
          searchResults = [{
            id: query, // 실제 테스트에서는 이메일을 ID로 사용
            firstName: username.charAt(0).toUpperCase() + username.slice(1),
            lastName: '회원',
            email: query,
            isRegistered: false
          }]
          
          console.log('Created search result for email:', query)
        }
      } else {
        // 이름으로 검색하는 경우 mockData 활용
        const mockResults = mockDataStore.searchMembers(query)
        searchResults = mockResults.filter(member => !member.isRegistered)
      }
      
    } catch (error) {
      console.error('Search error:', error)
      searchResults = []
    }

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Total results:', searchResults.length)
      console.log('Available members:', searchResults.length)
    }

    return NextResponse.json({
      success: true,
      members: searchResults,
      count: searchResults.length
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
