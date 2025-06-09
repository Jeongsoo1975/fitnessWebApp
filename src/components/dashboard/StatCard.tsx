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
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${iconBgColor} rounded-md flex items-center justify-center`}>
              <div className={iconColor}>
                {icon}
              </div>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
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