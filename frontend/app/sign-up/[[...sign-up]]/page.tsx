import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
            },
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}