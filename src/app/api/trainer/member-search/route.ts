import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// export const runtime = 'edge' // Clerk Client는 Node.js runtime에서만 작동

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
      // 개발 환경에서는 mockDataStore에서만 검색
      // 실제 환경에서는 데이터베이스 연동 필요
      searchResults = mockDataStore.searchMembers(query)
      
      // 새로 가입한 사용자의 이메일을 임시로 추가 (테스트용)
      if (query && query.includes('@') && searchResults.length === 0) {
        // 검색한 이메일이 기존 회원에 없으면 새로 추가
        const existingMember = mockDataStore.getMembers().find(m => m.email.toLowerCase() === query.toLowerCase())
        
        if (!existingMember) {
          const newMember = mockDataStore.addMember({
            email: query,
            firstName: '신규',
            lastName: '회원'
          })
          searchResults = [newMember]
        }
      }
      
    } catch (error) {
      console.error('Search error:', error)
      searchResults = mockDataStore.searchMembers(query)
    }
    
    // 이미 등록된 회원 필터링 (isRegistered가 true인 회원 제외)
    const availableMembers = searchResults.filter(member => !member.isRegistered)

    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
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
