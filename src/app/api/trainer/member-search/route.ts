import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'
import { clerkClient } from '@clerk/nextjs/server'

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
      // Clerk에서 실제 사용자 검색
      if (query.length > 0) {
        // 이메일로 검색
        if (query.includes('@')) {
          const users = await clerkClient.users.getUserList({
            emailAddress: [query],
            limit: 10
          })
          
          searchResults = users.data.map(user => ({
            id: user.id, // Clerk 사용자 ID 사용
            firstName: user.firstName || '사용자',
            lastName: user.lastName || '',
            email: user.emailAddresses[0]?.emailAddress || '',
            isRegistered: false // 실제로는 DB에서 확인해야 함
          }))
        } else {
          // 이름으로 검색
          const users = await clerkClient.users.getUserList({
            query: query,
            limit: 10
          })
          
          searchResults = users.data
            .filter(user => {
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
              return fullName.includes(query.toLowerCase())
            })
            .map(user => ({
              id: user.id,
              firstName: user.firstName || '사용자',
              lastName: user.lastName || '',
              email: user.emailAddresses[0]?.emailAddress || '',
              isRegistered: false
            }))
        }
      }
      
      // 현재 사용자 자신은 제외
      searchResults = searchResults.filter(user => user.id !== currentUser.id)
      
    } catch (clerkError) {
      console.error('Clerk search error:', clerkError)
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
