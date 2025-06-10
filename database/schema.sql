-- FitnessWebApp Database Schema
-- Created for Cloudflare D1

-- Users table (트레이너와 회원 공통)
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    clerk_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('trainer', 'member')),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    profile_image TEXT,
    invite_code TEXT UNIQUE, -- 트레이너용 초대 코드
    specialties TEXT, -- JSON array for trainer specialties
    experience INTEGER, -- 트레이너 경력 (년)
    certification TEXT, -- JSON array for trainer certifications
    goals TEXT, -- JSON array for member goals
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    medical_conditions TEXT, -- JSON array for member medical conditions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 트레이너-회원 관계 테이블
CREATE TABLE trainer_members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    trainer_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(trainer_id, member_id)
);

-- PT 세션 관리 테이블
CREATE TABLE pt_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    trainer_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    used_sessions INTEGER NOT NULL DEFAULT 0,
    remaining_sessions INTEGER GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(trainer_id, member_id)
);

-- 개별 세션 기록 테이블
CREATE TABLE session_records (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    pt_session_id TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    signature TEXT, -- Base64 encoded signature
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pt_session_id) REFERENCES pt_sessions(id) ON DELETE CASCADE
);

-- 운동 일정 테이블
CREATE TABLE workouts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    trainer_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    body_parts TEXT NOT NULL, -- JSON array: ["chest", "back", "legs"]
    exercises TEXT, -- JSON array of exercise objects
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 식단 관리 테이블
CREATE TABLE diets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    description TEXT NOT NULL,
    image_url TEXT,
    calories INTEGER,
    carbs REAL, -- 탄수화물 (g)
    protein REAL, -- 단백질 (g)
    fat REAL, -- 지방 (g)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 진행 현황 추적 테이블
CREATE TABLE progress_tracking (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    weight REAL, -- 체중 (kg)
    body_fat_percentage REAL, -- 체지방률 (%)
    muscle_mass REAL, -- 근육량 (kg)
    chest REAL, -- 가슴 둘레 (cm)
    waist REAL, -- 허리 둘레 (cm)
    hip REAL, -- 엉덩이 둘레 (cm)
    arm REAL, -- 팔 둘레 (cm)
    thigh REAL, -- 허벅지 둘레 (cm)
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 운동 기록 테이블 (개별 운동 성과)
CREATE TABLE exercise_records (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT NOT NULL,
    workout_id TEXT,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight REAL,
    duration INTEGER, -- 시간 (초)
    rest_time INTEGER, -- 휴식 시간 (초)
    notes TEXT,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_trainer_members_trainer ON trainer_members(trainer_id);
CREATE INDEX idx_trainer_members_member ON trainer_members(member_id);
CREATE INDEX idx_trainer_members_status ON trainer_members(status);
CREATE INDEX idx_pt_sessions_trainer ON pt_sessions(trainer_id);
CREATE INDEX idx_pt_sessions_member ON pt_sessions(member_id);
CREATE INDEX idx_session_records_pt_session ON session_records(pt_session_id);
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_workouts_member ON workouts(member_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_diets_member ON diets(member_id);
CREATE INDEX idx_diets_date ON diets(date);
CREATE INDEX idx_progress_member ON progress_tracking(member_id);
CREATE INDEX idx_progress_date ON progress_tracking(date);
CREATE INDEX idx_exercise_records_member ON exercise_records(member_id);
CREATE INDEX idx_exercise_records_workout ON exercise_records(workout_id);

-- 일정 변경 요청 테이블
CREATE TABLE schedule_change_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workout_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    trainer_id TEXT NOT NULL,
    requested_date DATE,
    requested_start_time TIME,
    requested_end_time TIME,
    current_date DATE NOT NULL,
    current_start_time TIME NOT NULL,
    current_end_time TIME NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    trainer_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 메시지 테이블 (트레이너-회원 간 소통)
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    workout_id TEXT,
    change_request_id TEXT,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'general' CHECK (message_type IN ('general', 'schedule_change', 'system')),
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL,
    FOREIGN KEY (change_request_id) REFERENCES schedule_change_requests(id) ON DELETE SET NULL
);

-- 알림 테이블
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('new_workout', 'schedule_change_request', 'schedule_change_response', 'new_message')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    related_id TEXT, -- workout_id, change_request_id, message_id 등
    related_type TEXT CHECK (related_type IN ('workout', 'change_request', 'message')),
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 새 테이블들의 인덱스 생성
CREATE INDEX idx_schedule_change_requests_workout ON schedule_change_requests(workout_id);
CREATE INDEX idx_schedule_change_requests_member ON schedule_change_requests(member_id);
CREATE INDEX idx_schedule_change_requests_trainer ON schedule_change_requests(trainer_id);
CREATE INDEX idx_schedule_change_requests_status ON schedule_change_requests(status);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_workout ON messages(workout_id);
CREATE INDEX idx_messages_change_request ON messages(change_request_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);