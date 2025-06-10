
import { NextRequest, NextResponse } from 'next/server'
import { requireRole, getCurrentUser } from '@/lib/auth'
import { createDatabaseManager } from '@/lib/db'
import type { DatabaseEnv } from '@/lib/db'

export const runtime = 'edge'

// GET /api/trainer/schedules - 트레이너의 스케줄 목록 조회
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
    const date = url.searchParams.get('date')

    // 개발 환경에서 DB가 없는 경우 더미 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      const env = process.env as unknown as DatabaseEnv
      if (!env.DB) {
        console.log('Development mode: Returning mock schedule data')
        return NextResponse.json({
          success: true,
          schedules: [
            {
              id: '1',
              title: 'PT 세션 - 김회원',
              notes: '상체 운동 중심',
              date: date || '2025-06-10',
              status: 'scheduled',
              memberId: '1',
              memberName: '김 회원',
              createdAt: '2025-06-10T09:00:00Z',
              updatedAt: '2025-06-10T09:00:00Z'
            }
          ],
          count: 1
        })
      }
    }

    // Cloudflare Workers 환경에서 DB 접근
    const env = process.env as unknown as DatabaseEnv
    if (!env.DB) {
      console.error('Database not available in production environment')
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = createDatabaseManager(env)

    // 현재 사용자의 데이터베이스 ID 찾기
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

    // 쿼리 조건 설정
    let whereClause = 'WHERE w.trainer_id = ?'
    const queryParams = [trainerRecord.id]

    if (date) {
      whereClause += ' AND DATE(w.date) = ?'
      queryParams.push(date)
    }

    // 스케줄 목록 조회
    const schedules = await db.query(`
      SELECT 
        w.id,
        w.title,
        w.description as notes,
        w.date,
        w.status,
        w.member_id as memberId,
        u.first_name as memberFirstName,
        u.last_name as memberLastName,
        w.created_at as createdAt,
        w.updated_at as updatedAt
      FROM workouts w
      LEFT JOIN users u ON w.member_id = u.id
      ${whereClause}
      ORDER BY w.date ASC, w.created_at ASC
    `, queryParams)

    // 스케줄 데이터 포맷팅
    const formattedSchedules = schedules.map((schedule: any) => ({
      id: schedule.id,
      title: schedule.title,
      notes: schedule.notes,
      date: schedule.date,
      status: schedule.status,
      memberId: schedule.memberId,
      memberName: schedule.memberId 
        ? `${schedule.memberFirstName || ''} ${schedule.memberLastName || ''}`.trim()
        : null,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    }))

    return NextResponse.json({
      success: true,
      schedules: formattedSchedules,
      count: formattedSchedules.length
    })

  } catch (error) {
    console.error('Error fetching schedules:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // 개발 환경에서 DB 오류 시 더미 데이터 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Database error, returning fallback data')
      return NextResponse.json({
        success: true,
        schedules: [],
        count: 0
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST /api/trainer/schedules - 새 스케줄 생성
export async function POST(request: NextRequest) {
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

    // 요청 본문 파싱
    const body = await request.json()
    const { 
      date, 
      title, 
      type = 'session',
      memberId, 
      startTime, 
      endTime, 
      location, 
      notes,
      status = 'scheduled'
    } = body

    // 필수 필드 검증
    if (!date || !title) {
      return NextResponse.json(
        { error: 'Date and title are required' },
        { status: 400 }
      )
    }

    // 개발 환경에서 DB가 없는 경우 mock 응답 반환
    if (process.env.NODE_ENV === 'development') {
      const env = process.env as unknown as DatabaseEnv
      if (!env.DB) {
        console.log('Development mode: Mock schedule creation')
        return NextResponse.json({
          success: true,
          scheduleId: Date.now().toString(),
          message: 'Schedule created successfully (development mode)'
        })
      }
    }

    // Cloudflare Workers 환경에서 DB 접근
    const env = process.env as unknown as DatabaseEnv
    if (!env.DB) {
      console.error('Database not available in production environment')
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      )
    }

    const db = createDatabaseManager(env)

    // 현재 사용자의 데이터베이스 ID 찾기
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

    // 회원 ID가 제공된 경우, 해당 회원이 트레이너의 승인된 회원인지 확인
    if (memberId) {
      const memberCheck = await db.first(`
        SELECT tm.id FROM trainer_members tm
        WHERE tm.trainer_id = ? AND tm.member_id = ? AND tm.status = 'approved'
      `, [trainerRecord.id, memberId])

      if (!memberCheck) {
        return NextResponse.json(
          { error: 'Member not found or not approved' },
          { status: 400 }
        )
      }
    }

    // 새 스케줄 생성
    const result = await db.execute(`
      INSERT INTO workouts (
        trainer_id,
        member_id,
        title,
        description,
        date,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      trainerRecord.id,
      memberId || null,
      title,
      notes || null,
      date,
      status
    ])

    return NextResponse.json({
      success: true,
      scheduleId: result.meta.last_row_id,
      message: 'Schedule created successfully'
    })

  } catch (error) {
    console.error('Error creating schedule:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // 개발 환경에서 DB 오류 시 mock 응답 반환
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Database error, returning mock success')
      return NextResponse.json({
        success: true,
        scheduleId: Date.now().toString(),
        message: 'Schedule created successfully (fallback mode)'
      })
    }

    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}

// PUT /api/trainer/schedules - 기존 스케줄 수정
export async function PUT(request: NextRequest) {
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

    // 요청 본문 파싱
    const body = await request.json()
    const { 
      id,
      date, 
      title, 
      type, 
      memberId, 
      startTime, 
      endTime, 
      location, 
      notes,
      status 
    } = body

    // 필수 필드 검증
    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
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

    // 현재 사용자의 데이터베이스 ID 찾기
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

    // 기존 스케줄 존재 여부 및 소유권 확인
    const existingSchedule = await db.first(`
      SELECT id FROM workouts 
      WHERE id = ? AND trainer_id = ?
    `, [id, trainerRecord.id])

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found or access denied' },
        { status: 404 }
      )
    }

    // 수정할 필드들 구성
    const updates = []
    const params = []

    if (date !== undefined) {
      updates.push('date = ?')
      params.push(date)
    }
    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (notes !== undefined) {
      updates.push('description = ?')
      params.push(notes)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }
    if (memberId !== undefined) {
      updates.push('member_id = ?')
      params.push(memberId || null)
    }

    // 업데이트할 필드가 있는 경우에만 실행
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      params.push(id) // WHERE 조건용

      const updateQuery = `
        UPDATE workouts 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `

      await db.execute(updateQuery, params)
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully'
    })

  } catch (error) {
    console.error('Error updating schedule:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

// DELETE /api/trainer/schedules - 스케줄 삭제
export async function DELETE(request: NextRequest) {
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

    // URL에서 스케줄 ID 추출
    const url = new URL(request.url)
    const scheduleId = url.searchParams.get('id')

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
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

    // 현재 사용자의 데이터베이스 ID 찾기
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

    // 스케줄 존재 여부 및 소유권 확인
    const existingSchedule = await db.first(`
      SELECT id FROM workouts 
      WHERE id = ? AND trainer_id = ?
    `, [scheduleId, trainerRecord.id])

    if (!existingSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found or access denied' },
        { status: 404 }
      )
    }

    // 스케줄 삭제 실행
    await db.execute(`
      DELETE FROM workouts 
      WHERE id = ? AND trainer_id = ?
    `, [scheduleId, trainerRecord.id])

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting schedule:', error)
    
    if (error instanceof Error && error.message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
