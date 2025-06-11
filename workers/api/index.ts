// Cloudflare Workers API for FitnessWebApp
import { createDatabaseManager } from '../../src/lib/db'

interface Env {
  DB: D1Database
  CLERK_PUBLISHABLE_KEY: string
  CLERK_SECRET_KEY: string
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-user-id, x-user-role',
}

// Handle CORS preflight requests
function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  return null
}

// Error response helper
function errorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Success response helper
function successResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Auth middleware - extract user info from headers
function getAuthInfo(request: Request): { userId: string | null; role: string | null } {
  const userId = request.headers.get('x-clerk-user-id')
  const role = request.headers.get('x-user-role')
  return { userId, role }
}

// Require authentication
function requireAuth(userId: string | null): boolean {
  return !!userId
}

// Require specific role
function requireRole(role: string | null, requiredRole: string): boolean {
  return role === requiredRole
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    const corsResponse = handleCors(request)
    if (corsResponse) return corsResponse

    const url = new URL(request.url)
    const { pathname } = url
    const method = request.method

    // Initialize database
    const db = createDatabaseManager({ DB: env.DB })

    // Get auth info
    const { userId, role } = getAuthInfo(request)

    try {
      // Route handling
      if (pathname.startsWith('/api/workouts')) {
        return handleWorkouts(request, db, userId, role)
      }
      
      if (pathname.startsWith('/api/schedule-requests')) {
        return handleScheduleRequests(request, db, userId, role)
      }
      
      if (pathname.startsWith('/api/messages')) {
        return handleMessages(request, db, userId, role)
      }
      
      if (pathname.startsWith('/api/notifications')) {
        return handleNotifications(request, db, userId, role)
      }

      return errorResponse('Not found', 404)
    } catch (error) {
      console.error('API Error:', error)
      return errorResponse('Internal server error', 500)
    }
  },
}

// Workouts API handler
async function handleWorkouts(request: Request, db: any, userId: string | null, role: string | null): Promise<Response> {
  if (!requireAuth(userId)) {
    return errorResponse('Unauthorized', 401)
  }

  const url = new URL(request.url)
  const method = request.method
  const pathParts = url.pathname.split('/').filter(p => p)

  if (method === 'GET') {
    // GET /api/workouts - 트레이너: 모든 일정, 회원: 자신의 일정
    if (role === 'trainer') {
      const workouts = await db.query('SELECT * FROM workouts WHERE trainer_id = ? ORDER BY date DESC', [userId])
      return successResponse({ workouts })
    } else if (role === 'member') {
      const workouts = await db.query('SELECT * FROM workouts WHERE member_id = ? ORDER BY date DESC', [userId])
      return successResponse({ workouts })
    }
    return errorResponse('Invalid role', 403)
  }

  if (method === 'POST') {
    // POST /api/workouts - 트레이너만 일정 생성 가능
    if (!requireRole(role, 'trainer')) {
      return errorResponse('Only trainers can create workouts', 403)
    }

    const data = await request.json() as any
    const { memberId, date, title, description, bodyParts, exercises } = data

    if (!memberId || !date || !title) {
      return errorResponse('Missing required fields', 400)
    }

    const result = await db.execute(
      'INSERT INTO workouts (trainer_id, member_id, date, title, description, body_parts, exercises) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, memberId, date, title, description, JSON.stringify(bodyParts || []), JSON.stringify(exercises || [])]
    )

    // 회원에게 알림 생성
    await db.execute(
      'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [memberId, 'new_workout', '새로운 운동 일정', `${title} 일정이 추가되었습니다.`, result.meta.last_row_id, 'workout']
    )

    return successResponse({ id: result.meta.last_row_id, message: 'Workout created successfully' })
  }

  if (method === 'PUT') {
    // PUT /api/workouts/:id - 트레이너만 일정 수정 가능
    if (!requireRole(role, 'trainer')) {
      return errorResponse('Only trainers can update workouts', 403)
    }

    const workoutId = pathParts[2]
    if (!workoutId) {
      return errorResponse('Workout ID required', 400)
    }

    const data = await request.json() as any
    const { date, title, description, bodyParts, exercises, status } = data

    await db.execute(
      'UPDATE workouts SET date = ?, title = ?, description = ?, body_parts = ?, exercises = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND trainer_id = ?',
      [date, title, description, JSON.stringify(bodyParts || []), JSON.stringify(exercises || []), status, workoutId, userId]
    )

    return successResponse({ message: 'Workout updated successfully' })
  }

  if (method === 'DELETE') {
    // DELETE /api/workouts/:id - 트레이너만 일정 삭제 가능
    if (!requireRole(role, 'trainer')) {
      return errorResponse('Only trainers can delete workouts', 403)
    }

    const workoutId = pathParts[2]
    if (!workoutId) {
      return errorResponse('Workout ID required', 400)
    }

    await db.execute('DELETE FROM workouts WHERE id = ? AND trainer_id = ?', [workoutId, userId])
    return successResponse({ message: 'Workout deleted successfully' })
  }

  return errorResponse('Method not allowed', 405)
}

// Schedule requests API handler
async function handleScheduleRequests(request: Request, db: any, userId: string | null, role: string | null): Promise<Response> {
  if (!requireAuth(userId)) {
    return errorResponse('Unauthorized', 401)
  }

  const url = new URL(request.url)
  const method = request.method
  const pathParts = url.pathname.split('/').filter(p => p)

  if (method === 'GET') {
    // GET /api/schedule-requests - 역할별 변경 요청 조회
    if (role === 'trainer') {
      const requests = await db.query(`
        SELECT sr.*, w.title as workout_title, u.first_name, u.last_name 
        FROM schedule_change_requests sr 
        JOIN workouts w ON sr.workout_id = w.id 
        JOIN users u ON sr.member_id = u.id 
        WHERE sr.trainer_id = ? 
        ORDER BY sr.created_at DESC
      `, [userId])
      return successResponse({ requests })
    } else if (role === 'member') {
      const requests = await db.query(`
        SELECT sr.*, w.title as workout_title 
        FROM schedule_change_requests sr 
        JOIN workouts w ON sr.workout_id = w.id 
        WHERE sr.member_id = ? 
        ORDER BY sr.created_at DESC
      `, [userId])
      return successResponse({ requests })
    }
    return errorResponse('Invalid role', 403)
  }

  if (method === 'POST') {
    // POST /api/schedule-requests - 회원만 변경 요청 생성 가능
    if (!requireRole(role, 'member')) {
      return errorResponse('Only members can create schedule change requests', 403)
    }

    const data = await request.json() as any
    const { workoutId, requestedDate, requestedStartTime, requestedEndTime, reason } = data

    if (!workoutId) {
      return errorResponse('Workout ID required', 400)
    }

    // 해당 운동이 회원의 것인지 확인
    const workout = await db.first('SELECT * FROM workouts WHERE id = ? AND member_id = ?', [workoutId, userId])
    if (!workout) {
      return errorResponse('Workout not found', 404)
    }

    const result = await db.execute(`
      INSERT INTO schedule_change_requests 
      (workout_id, member_id, trainer_id, requested_date, requested_start_time, requested_end_time, 
       current_date, current_start_time, current_end_time, reason) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      workoutId, userId, workout.trainer_id, requestedDate, requestedStartTime, requestedEndTime,
      workout.date, '09:00', '10:00', reason // 현재 시간은 임시값
    ])

    // 트레이너에게 알림
    await db.execute(
      'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [workout.trainer_id, 'schedule_change_request', '일정 변경 요청', '회원이 일정 변경을 요청했습니다.', result.meta.last_row_id, 'change_request']
    )

    return successResponse({ id: result.meta.last_row_id, message: 'Schedule change request created successfully' })
  }

  if (method === 'PUT') {
    // PUT /api/schedule-requests/:id - 트레이너만 요청 승인/거절 가능
    if (!requireRole(role, 'trainer')) {
      return errorResponse('Only trainers can respond to schedule requests', 403)
    }

    const requestId = pathParts[2]
    if (!requestId) {
      return errorResponse('Request ID required', 400)
    }

    const data = await request.json() as any
    const { status, trainerResponse } = data

    if (!status || !['approved', 'rejected'].includes(status)) {
      return errorResponse('Valid status required (approved/rejected)', 400)
    }

    const request_data = await db.first('SELECT * FROM schedule_change_requests WHERE id = ? AND trainer_id = ?', [requestId, userId])
    if (!request_data) {
      return errorResponse('Request not found', 404)
    }

    await db.execute(
      'UPDATE schedule_change_requests SET status = ?, trainer_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, trainerResponse, requestId]
    )

    // 승인된 경우 실제 일정 업데이트
    if (status === 'approved' && request_data.requested_date) {
      await db.execute(
        'UPDATE workouts SET date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [request_data.requested_date, request_data.workout_id]
      )
    }

    // 회원에게 알림
    await db.execute(
      'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [request_data.member_id, 'schedule_change_response', '일정 변경 응답', 
       status === 'approved' ? '일정 변경이 승인되었습니다.' : '일정 변경이 거절되었습니다.', 
       requestId, 'change_request']
    )

    return successResponse({ message: 'Request updated successfully' })
  }

  return errorResponse('Method not allowed', 405)
}

// Messages API handler  
async function handleMessages(request: Request, db: any, userId: string | null, role: string | null): Promise<Response> {
  if (!requireAuth(userId)) {
    return errorResponse('Unauthorized', 401)
  }

  const url = new URL(request.url)
  const method = request.method

  if (method === 'GET') {
    // GET /api/messages?with=userId - 특정 사용자와의 메시지 조회
    const withUserId = url.searchParams.get('with')
    if (!withUserId) {
      return errorResponse('Target user ID required', 400)
    }

    const messages = await db.query(`
      SELECT m.*, 
             s.first_name as sender_first_name, s.last_name as sender_last_name,
             r.first_name as receiver_first_name, r.last_name as receiver_last_name
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [userId, withUserId, withUserId, userId])

    return successResponse({ messages })
  }

  if (method === 'POST') {
    // POST /api/messages - 메시지 전송
    const data = await request.json() as any
    const { receiverId, content, messageType = 'general', workoutId, changeRequestId } = data

    if (!receiverId || !content) {
      return errorResponse('Receiver ID and content required', 400)
    }

    const result = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content, message_type, workout_id, change_request_id) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, receiverId, content, messageType, workoutId, changeRequestId]
    )

    // 수신자에게 알림
    await db.execute(
      'INSERT INTO notifications (user_id, type, title, content, related_id, related_type) VALUES (?, ?, ?, ?, ?, ?)',
      [receiverId, 'new_message', '새 메시지', content.substring(0, 50) + '...', result.meta.last_row_id, 'message']
    )

    return successResponse({ id: result.meta.last_row_id, message: 'Message sent successfully' })
  }

  if (method === 'PUT') {
    // PUT /api/messages/:id/read - 메시지 읽음 처리
    const pathParts = url.pathname.split('/').filter(p => p)
    const messageId = pathParts[2]
    
    if (!messageId || pathParts[3] !== 'read') {
      return errorResponse('Invalid request', 400)
    }

    await db.execute(
      'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND receiver_id = ?',
      [messageId, userId]
    )

    return successResponse({ message: 'Message marked as read' })
  }

  return errorResponse('Method not allowed', 405)
}

// Notifications API handler
async function handleNotifications(request: Request, db: any, userId: string | null, role: string | null): Promise<Response> {
  if (!requireAuth(userId)) {
    return errorResponse('Unauthorized', 401)
  }

  const url = new URL(request.url)
  const method = request.method

  if (method === 'GET') {
    // GET /api/notifications - 사용자의 알림 조회
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    )

    const unreadCount = await db.first(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL',
      [userId]
    )

    return successResponse({ 
      notifications, 
      unreadCount: unreadCount?.count || 0 
    })
  }

  if (method === 'PUT') {
    // PUT /api/notifications/:id/read - 알림 읽음 처리
    const pathParts = url.pathname.split('/').filter(p => p)
    const notificationId = pathParts[2]
    
    if (!notificationId || pathParts[3] !== 'read') {
      return errorResponse('Invalid request', 400)
    }

    await db.execute(
      'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    )

    return successResponse({ message: 'Notification marked as read' })
  }

  if (method === 'POST' && url.pathname.endsWith('/mark-all-read')) {
    // POST /api/notifications/mark-all-read - 모든 알림 읽음 처리
    await db.execute(
      'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL',
      [userId]
    )

    return successResponse({ message: 'All notifications marked as read' })
  }

  return errorResponse('Method not allowed', 405)
}