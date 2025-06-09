import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  iconBgColor: string
  iconColor: string
  change?: {
    value: string
    color: string
    description?: string
  }
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor, 
  change 
}: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg min-h-[100px] sm:min-h-[120px] touch-manipulation transition-transform active:scale-95">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconBgColor} rounded-md flex items-center justify-center`}>
              <div className={`${iconColor} transition-colors duration-200`}>
                {icon}
              </div>
            </div>
          </div>
          <div className="ml-4 sm:ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm sm:text-base font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg sm:text-xl font-medium text-gray-900 mt-1">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-4 sm:px-5 py-3 sm:py-4">
          <div className="text-sm sm:text-base">
            <span className={`${change.color} font-medium`}>{change.value}</span>
            {change.description && (
              <span className="text-gray-500"> {change.description}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}