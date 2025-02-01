'use client'

import { useState } from 'react'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from '@clerk/nextjs'
import { FaTrash } from 'react-icons/fa'

export default function DeleteAccount() {
  const router = useRouter()
  const { signOut} = useAuth() // Get the user object to access email
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setIsDeleting(true)
        
        const response = await fetch('/api/user', {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete account')
        }

        await signOut()
        alert('Your account has been successfully deleted.')
        router.push('/')
      } catch (error) {
        console.error('Error deleting account:', error)
        alert('Failed to delete account. Please try again.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <button
      onClick={handleDeleteAccount}
      disabled={isDeleting}
      className="w-full max-w-md bg-red-900 text-red-100 rounded-lg px-6 py-3 font-semibold hover:bg-red-800 transition-colors flex items-center justify-center space-x-2"
      aria-label="Delete account"
    >
      {isDeleting ? (
        <div className="flex items-center space-x-2">
          <span className="mr-2">Deleting...</span>
          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <FaTrash className="w-4 h-4" />
          <span>Delete Account</span>
        </>
      )}
    </button>
  )
}