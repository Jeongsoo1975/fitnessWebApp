export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg min-h-[100px] sm:min-h-[120px]">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-md" />
          </div>
          <div className="ml-4 sm:ml-5 w-0 flex-1">
            <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-2" />
            <Skeleton className="h-6 sm:h-7 w-16 sm:w-20" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 sm:px-5 py-3 sm:py-4">
        <Skeleton className="h-4 sm:h-5 w-32 sm:w-36" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section Skeleton */}
      <div>
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-56 mb-2" />
        <Skeleton className="h-5 sm:h-6 w-64 sm:w-72" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <Skeleton className="h-6 sm:h-7 w-24 sm:w-28" />
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 sm:p-6 bg-gray-50 rounded-lg min-h-[80px] sm:min-h-[100px]">
                  <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                  <div className="ml-4 sm:ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 sm:h-5 w-24 sm:w-28 mb-1 sm:mb-2" />
                        <Skeleton className="h-3 sm:h-4 w-32 sm:w-36" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-1 sm:mb-2" />
                        <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" />
              </div>
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 sm:h-14 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}