import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser, searchValidUsers } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// Clerk Backend SDK를 사용하여 실제 사용자 검증 수행

// GET /api/trainer/member-search - 회원 검색 (실제 사용자 검증 포함)
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
    let message = ''

    try {
      // 이메일로 검색하는 경우, 실제 Clerk 사용자 검증 사용
      if (query.includes('@')) {
        console.log('[member-search] Email search initiated for:', query)
        
        // 현재 사용자의 이메일과 다른 경우에만 검색 진행
        const currentUserEmail = currentUser.emailAddresses?.[0]?.emailAddress
        
        if (query === currentUserEmail) {
          console.log('[member-search] Cannot search for own email address')
          message = '자신의 이메일로는 검색할 수 없습니다.'
        } else {
          // 실제 Clerk 사용자 검증
          const validUsers = await searchValidUsers(query)
          
          if (validUsers.length > 0) {
            const user = validUsers[0]
            searchResults = [{
              id: user.id,
              firstName: user.firstName || '사용자',
              lastName: user.lastName || '',
              email: user.email,
              isRegistered: false // 트레이너와 연결되지 않은 상태
            }]
            console.log('[member-search] Valid user found:', user.id)
            message = '검색 결과를 찾았습니다.'
          } else {
            console.log('[member-search] No valid user found for email:', query)
            message = '해당 이메일로 등록된 사용자를 찾을 수 없습니다. 올바른 이메일 주소인지 확인해주세요.'
          }
        }
      } else {
        // 이름으로 검색하는 경우 기존 mockData 활용
        console.log('[member-search] Name search initiated for:', query)
        const mockResults = mockDataStore.searchMembers(query)
        searchResults = mockResults.filter(member => !member.isRegistered)
        
        if (searchResults.length > 0) {
          message = `${searchResults.length}명의 검색 결과를 찾았습니다.`
        } else {
          message = '검색 결과를 찾을 수 없습니다.'
        }
      }
      
    } catch (error) {
      console.error('[member-search] Search error:', error)
      searchResults = []
      message = '검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('[member-search] Search completed - Total results:', searchResults.length)
      console.log('[member-search] Message:', message)
    }

    return NextResponse.json({
      success: true,
      members: searchResults,
      count: searchResults.length,
      message: message || undefined
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
