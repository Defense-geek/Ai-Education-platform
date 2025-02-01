import Link from 'next/link'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import '@/app/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0">
                  <Link href="http://localhost:3000/" className="text-2xl font-bold text-blue-600">
                    LOGO
                  </Link>
                </div>
                <Link 
                  href="http://localhost:3000/dashboard/sign-upCourses" 
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Sign Up for Courses
                </Link>
                <Link 
                  href="http://localhost:3000/dashboard" 
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
              <div className="flex items-center">
              <UserButton 
                    afterSignOutUrl="http://localhost:3000/" 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
              </div>
            </div>
          </div>
        </nav>
        <main className="bg-gray-50 min-h-screen">{children}</main>
      </body>
    </html>
  )
}