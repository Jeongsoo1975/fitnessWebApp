
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
