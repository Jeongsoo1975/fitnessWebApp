import Navigation from './navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Navigation>
      <div className="py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {children}
        </div>
      </div>
    </Navigation>
  )
}