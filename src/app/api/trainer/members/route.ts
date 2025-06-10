import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { createDatabaseManager } from '@/lib/db'
import type { DatabaseEnv } from '@/lib/db'

export const runtime = 'edge'

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

    // Cloudflare Workers 환경에서 DB 접근
    const env = process.env as unknown as DatabaseEnv
    if (!env.DB) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = createDatabaseManager(env)

    // 먼저 현재 사용자의 데이터베이스 ID 찾기
    const trainerRecord = await db.first(`
      SELECT id FROM users 
      WHERE clerk_id = ?
    `, [currentUser.id])

    if (!trainerRecord) {
      return NextResponse.json(
        { error: 'Trainer not found' },
        { status: 404 }
      )
    }

    // 트레이너의 승인된 회원 목록 조회
    const members = await db.query(`
      SELECT 
        u.id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.email,
        tm.created_at as joinedAt
      FROM trainer_members tm
      JOIN users u ON tm.member_id = u.id
      WHERE tm.trainer_id = ? 
        AND tm.status = 'approved'
        AND u.role = 'member'
      ORDER BY u.first_name, u.last_name
    `, [trainerRecord.id])

    // AddScheduleModal의 members prop 형태에 맞게 반환
    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email
    }))

    return NextResponse.json({
      success: true,
      members: formattedMembers,
      count: formattedMembers.length
    })

  } catch (error) {
    console.error('Error fetching trainer members:', error)
    
    // 권한 오류인 경우
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}