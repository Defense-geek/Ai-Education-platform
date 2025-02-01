import { auth, clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function DELETE(req: Request) {
  let userEmail: string | undefined
  let userId: string | undefined

  try {
    const authResponse = await auth()
    userId = authResponse.userId

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user from Clerk
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)

    if (!clerkUser) {
      return new NextResponse(`User with ID ${userId} not found`, { status: 404 })
    }

    // Delete user from Clerk first
    await clerk.users.deleteUser(userId)

    // Then delete user from Prisma database using email
    if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
      userEmail = clerkUser.emailAddresses[0].emailAddress

      const deleteUserFromDatabase = async (email, retries = 3) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            await prisma.user.delete({
              where: { email }
            })
            return true
          } catch (dbError) {
            console.error(`Error deleting user from database on attempt ${attempt}:`, dbError)
            if (attempt === retries) return false // Return false if all retries fail
          }
        }
      }

      const dbDeletionSucceeded = await deleteUserFromDatabase(userEmail)
      if (!dbDeletionSucceeded) {
        console.warn('User was deleted from Clerk but not from the database. Additional cleanup may be required.')
      }
    } else {
      console.warn(`No email addresses found for user with ID ${userId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting user with ID ${userId}:`, error)
    return new NextResponse(`Internal Error for user with email ${userEmail}`, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
