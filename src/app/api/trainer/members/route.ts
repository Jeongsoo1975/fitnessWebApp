import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { mockDataStore } from '@/lib/mockData'

// GET /api/trainer/members - 트레이너의 승인된 회원 목록 조회
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

    // 트레이너의 승인된 회원 목록 조회
    const approvedMembers = mockDataStore.getTrainerMembers(currentUser.id)
    
    // 개발 환경 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log('Trainer members retrieved:')
      console.log('- Trainer ID:', currentUser.id)
      console.log('- Total approved members:', approvedMembers.length)
      console.log('- Members:', approvedMembers)
    }

    return NextResponse.json({
      success: true,
      members: approvedMembers.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        requestId: member.requestId
      })),
      count: approvedMembers.length
    })

  } catch (error) {
    console.error('Error retrieving trainer members:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to retrieve trainer members' },
      { status: 500 }
    )
  }
}
