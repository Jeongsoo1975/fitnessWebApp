-- Test queries for FitnessWebApp database schema
-- Use these queries to verify database functionality

-- Test 1: Create a test trainer user
INSERT INTO users (
    clerk_id, role, email, first_name, last_name, 
    invite_code, specialties, experience
) VALUES (
    'test_trainer_clerk_id', 'trainer', 'trainer@test.com', 
    'John', 'Trainer', 'TR001', 
    '["weight_training", "cardio"]', 5
);

-- Test 2: Create a test member user  
INSERT INTO users (
    clerk_id, role, email, first_name, last_name,
    goals, fitness_level
) VALUES (
    'test_member_clerk_id', 'member', 'member@test.com',
    'Jane', 'Member', 
    '["weight_loss", "muscle_gain"]', 'beginner'
);

-- Test 3: Create trainer-member relationship
INSERT INTO trainer_members (trainer_id, member_id, status)
SELECT 
    (SELECT id FROM users WHERE role = 'trainer' LIMIT 1),
    (SELECT id FROM users WHERE role = 'member' LIMIT 1),
    'approved';

-- Test 4: Create PT session
INSERT INTO pt_sessions (trainer_id, member_id, total_sessions)
SELECT 
    (SELECT id FROM users WHERE role = 'trainer' LIMIT 1),
    (SELECT id FROM users WHERE role = 'member' LIMIT 1),
    10;

-- Test 5: Create a workout schedule
INSERT INTO workouts (trainer_id, member_id, date, title, body_parts)
SELECT 
    (SELECT id FROM users WHERE role = 'trainer' LIMIT 1),
    (SELECT id FROM users WHERE role = 'member' LIMIT 1),
    DATE('now', '+1 day'),
    'Upper Body Workout',
    '["chest", "back", "shoulders"]';

-- Test 6: Add diet record
INSERT INTO diets (member_id, date, meal_type, description, calories)
SELECT 
    (SELECT id FROM users WHERE role = 'member' LIMIT 1),
    DATE('now'),
    'breakfast',
    'Oatmeal with banana and protein powder',
    350;

-- Test 7: Add progress tracking
INSERT INTO progress_tracking (member_id, date, weight, body_fat_percentage)
SELECT 
    (SELECT id FROM users WHERE role = 'member' LIMIT 1),
    DATE('now'),
    70.5,
    15.2;

-- Verification queries
-- Check all users
SELECT role, email, first_name, last_name FROM users;

-- Check trainer-member relationships  
SELECT 
    t.email as trainer_email,
    m.email as member_email,
    tm.status
FROM trainer_members tm
JOIN users t ON tm.trainer_id = t.id
JOIN users m ON tm.member_id = m.id;

-- Check PT sessions with remaining counts
SELECT 
    u.email as member_email,
    ps.total_sessions,
    ps.used_sessions,
    ps.remaining_sessions
FROM pt_sessions ps
JOIN users u ON ps.member_id = u.id;

-- Check workouts
SELECT 
    u.email as member_email,
    w.date,
    w.title,
    w.body_parts,
    w.status
FROM workouts w
JOIN users u ON w.member_id = u.id;

-- Cleanup queries (for testing)
-- DELETE FROM exercise_records;
-- DELETE FROM progress_tracking;
-- DELETE FROM diets;  
-- DELETE FROM workouts;
-- DELETE FROM session_records;
-- DELETE FROM pt_sessions;
-- DELETE FROM trainer_members;
-- DELETE FROM users;