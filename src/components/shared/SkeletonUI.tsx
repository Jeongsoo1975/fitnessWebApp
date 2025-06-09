// Skeleton UI components for loading states
import React from 'react'

export function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  )
}

export function SkeletonWorkoutItem() {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg animate-pulse">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="ml-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonButton() {
  return (
    <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
  )
}

export function SkeletonText({ lines = 1, width = 'full' }: { lines?: number; width?: 'full' | '3/4' | '1/2' | '1/3' }) {
  const widthClass = {
    'full': 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3'
  }[width]

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={`h-4 bg-gray-200 rounded animate-pulse ${widthClass}`}></div>
      ))}
    </div>
  )
}

export function SkeletonProgressBar() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-gray-300 h-2 rounded-full w-3/4"></div>
      </div>
    </div>
  )
}

export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

export function SkeletonWorkoutPlan() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonWorkoutItem key={index} />
          ))}
        </div>
        <div className="mt-6">
          <SkeletonButton />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTrainerInfo() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
