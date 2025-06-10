import type { Metadata } from 'next'
import ConditionalClerkProvider from '@/components/shared/conditional-clerk-provider'
import PerformanceMonitor from '@/components/shared/PerformanceMonitor'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitnessWebApp - Personal Training Management',
  description: 'Web-based Personal Training management app for trainers and members',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FitnessWebApp'
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    url: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Performance hints */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Accessibility meta */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="antialiased font-display-swap">
        {/* Skip link for keyboard navigation */}
        <a 
          href="#main-content" 
          className="skip-link focus-visible-enhanced"
          tabIndex={1}
        >
          메인 콘텐츠로 건너뛰기
        </a>
        
        {/* Accessibility landmark */}
        <div id="root" role="application" aria-label="FitnessWebApp">
          <ConditionalClerkProvider>
            <main id="main-content" className="focus-visible-enhanced">
              {children}
            </main>
          </ConditionalClerkProvider>
        </div>

        {/* Performance Monitor (development only by default) */}
        <PerformanceMonitor />

        {/* Screen reader announcements container */}
        <div 
          id="sr-announcements" 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
        />
      </body>
    </html>
  )
}