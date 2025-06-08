import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitnessWebApp - Personal Training Management',
  description: 'Web-based Personal Training management app for trainers and members',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}