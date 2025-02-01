'use client'

import { SignIn } from "@clerk/nextjs"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser  } from "@clerk/nextjs"

export default function SignInPage() {
  const { isLoaded, user } = useUser ()
  const router = useRouter()

  useEffect(() => {
    // Only run this effect if the user state is loaded
    if (isLoaded) {
      console.log('User  loaded:', user); // Log user object for debugging

      if (user) {
        const role = user.publicMetadata.role;
        console.log('User  role:', role); // Log user role for debugging

        // Redirect based on the user's role
        if (role === 'admin') {
          console.log('Redirecting to admin dashboard');
          router.push('/dashboard-admin');
        } else {
          console.log('Redirecting to user dashboard');
          router.push('/dashboard');
        }
      } else {
        console.log('User  is not signed in.'); // Log if user is not signed in
      }
    }
  }, [isLoaded, user, router])

  // Render the SignIn component only if the user is not signed in
  if (isLoaded && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
              },
            }}
          />
        </div>
      </div>
    )
  }
}