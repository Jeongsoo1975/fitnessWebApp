-- Migration: 001_initial_schema
-- Description: Create initial database schema for FitnessWebApp
-- Created: 2025-06-09

-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    clerk_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('trainer', 'member')),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    profile_image TEXT,
    invite_code TEXT UNIQUE,
    specialties TEXT,
    experience INTEGER,
    certification TEXT,
    goals TEXT,
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    medical_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create trainer_members relationship table
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

-- Create PT sessions table
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

-- Create session records table
CREATE TABLE session_records (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    pt_session_id TEXT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    signature TEXT,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pt_session_id) REFERENCES pt_sessions(id) ON DELETE CASCADE
);

-- Create workouts table
CREATE TABLE workouts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    trainer_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    body_parts TEXT NOT NULL,
    exercises TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create diets table
CREATE TABLE diets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    description TEXT NOT NULL,
    image_url TEXT,
    calories INTEGER,
    carbs REAL,
    protein REAL,
    fat REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create progress tracking table
CREATE TABLE progress_tracking (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT NOT NULL,
    date DATE NOT NULL,
    weight REAL,
    body_fat_percentage REAL,
    muscle_mass REAL,
    chest REAL,
    waist REAL,
    hip REAL,
    arm REAL,
    thigh REAL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create exercise records table
CREATE TABLE exercise_records (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT NOT NULL,
    workout_id TEXT,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    weight REAL,
    duration INTEGER,
    rest_time INTEGER,
    notes TEXT,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE SET NULL
);

-- Create indexes for performance optimization
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