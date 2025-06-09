'use client'

import { useState } from 'react'
import { CheckCircleIcon, PlayIcon } from '@heroicons/react/24/outline'

interface Exercise {
  id: string
  name: string
  sets: ExerciseSet[]
  restTime: number // seconds
  notes?: string
}

interface ExerciseSet {
  id: string
  reps: number
  weight?: number
  completed: boolean
}

interface WorkoutSession {
  id: string
  name: string
  date: string
  duration: number // minutes
  exercises: Exercise[]
  status: 'planned' | 'in-progress' | 'completed'
}

export default function WorkoutTracker() {
  const [currentSession, setCurrentSession] = useState<WorkoutSession>({
    id: '1',
    name: '상체 운동 (가슴, 삼두)',
    date: new Date().toISOString().split('T')[0],
    duration: 0,
    status: 'planned',
    exercises: [
      {
        id: '1',
        name: '벤치프레스',
        restTime: 120,
        sets: [
          { id: '1-1', reps: 10, weight: 60, completed: false },
          { id: '1-2', reps: 8, weight: 65, completed: false },
          { id: '1-3', reps: 6, weight: 70, completed: false }
        ]
      },
      {
        id: '2',
        name: '인클라인 덤벨 프레스',
        restTime: 90,
        sets: [
          { id: '2-1', reps: 12, weight: 22.5, completed: false },
          { id: '2-2', reps: 10, weight: 25, completed: false },
          { id: '2-3', reps: 8, weight: 27.5, completed: false }
        ]
      },
      {
        id: '3',
        name: '딥스',
        restTime: 90,
        sets: [
          { id: '3-1', reps: 15, completed: false },
          { id: '3-2', reps: 12, completed: false },
          { id: '3-3', reps: 10, completed: false }
        ]
      }
    ]
  })

  const [isResting, setIsResting] = useState(false)
  const [restTimeLeft, setRestTimeLeft] = useState(0)

  const startWorkout = () => {
    setCurrentSession({ ...currentSession, status: 'in-progress' })
  }

  const completeSet = (exerciseId: string, setId: string) => {
    const updatedExercises = currentSession.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map(set => {
          if (set.id === setId) {
            return { ...set, completed: true }
          }
          return set
        })
        return { ...exercise, sets: updatedSets }
      }
      return exercise
    })

    setCurrentSession({ ...currentSession, exercises: updatedExercises })
    
    // 휴식 시간 시작
    const exercise = currentSession.exercises.find(ex => ex.id === exerciseId)
    if (exercise) {
      setRestTimeLeft(exercise.restTime)
      setIsResting(true)
    }
  }

  const getCompletedSets = (exercise: Exercise) => {
    return exercise.sets.filter(set => set.completed).length
  }

  const getTotalSets = (exercise: Exercise) => {
    return exercise.sets.length
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWorkoutProgress = () => {
    const totalSets = currentSession.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)
    const completedSets = currentSession.exercises.reduce((total, exercise) => total + getCompletedSets(exercise), 0)
    return Math.round((completedSets / totalSets) * 100)
  }

  return (
    <div className="mobile-container-full">
      {/* 워크아웃 헤더 */}
      <div className="mobile-card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mobile-subheading">{currentSession.name}</h2>
            <p className="mobile-caption text-gray-500">
              진행률: {getWorkoutProgress()}%
            </p>
          </div>
          
          {currentSession.status === 'planned' ? (
            <button
              onClick={startWorkout}
              className="mobile-button bg-green-600 text-white flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              시작
            </button>
          ) : (
            <button className="mobile-button bg-red-600 text-white">
              완료
            </button>
          )}
        </div>

        {/* 진행률 바 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getWorkoutProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* 휴식 타이머 */}
      {isResting && (
        <div className="mobile-card mb-4 bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="mobile-subheading text-blue-800 mb-2">휴식 시간</h3>
            <div className="text-4xl font-bold text-blue-600 mb-4">
              {formatTime(restTimeLeft)}
            </div>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsResting(false)}
                className="mobile-button-small bg-blue-600 text-white"
              >
                휴식 종료
              </button>
              <button 
                onClick={() => setRestTimeLeft(restTimeLeft + 30)}
                className="mobile-button-small bg-gray-200 text-gray-800"
              >
                +30초
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 운동 목록 */}
      <div className="mobile-spacing">
        {currentSession.exercises.map((exercise, exerciseIndex) => (
          <div key={exercise.id} className="mobile-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="mobile-body font-medium">{exercise.name}</h3>
                <p className="mobile-caption text-gray-500">
                  {getCompletedSets(exercise)}/{getTotalSets(exercise)} 세트 완료
                </p>
              </div>
              <span className="mobile-caption text-blue-600 font-medium">
                휴식 {exercise.restTime}초
              </span>
            </div>

            {/* 세트 목록 */}
            <div className="space-y-3">
              {exercise.sets.map((set, setIndex) => (
                <div key={set.id} className={`mobile-card-compact border transition-all ${
                  set.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="mobile-caption font-medium text-gray-600">
                        세트 {setIndex + 1}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <div className="mobile-caption text-gray-500">횟수</div>
                          <div className="mobile-body font-medium">{set.reps}</div>
                        </div>
                        
                        {set.weight && (
                          <div className="text-center">
                            <div className="mobile-caption text-gray-500">무게</div>
                            <div className="mobile-body font-medium">{set.weight}kg</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => completeSet(exercise.id, set.id)}
                      disabled={set.completed}
                      className={`touch-target p-2 rounded-lg transition-all ${
                        set.completed
                          ? 'text-green-600 bg-green-100'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 운동 노트 */}
            {exercise.notes && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="mobile-caption text-yellow-800">
                  💡 {exercise.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="mobile-container">
          <div className="grid grid-cols-2 gap-3">
            <button className="mobile-button bg-gray-200 text-gray-800">
              일시정지
            </button>
            <button className="mobile-button bg-blue-600 text-white">
              운동 완료
            </button>
          </div>
        </div>
      </div>

      {/* 하단 패딩 (Fixed 버튼 공간 확보) */}
      <div className="h-20"></div>
    </div>
  )
}