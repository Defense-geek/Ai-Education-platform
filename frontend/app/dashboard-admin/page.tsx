import { PrismaClient } from '@prisma/client';
import AdminUsersPage from './AdminUsersPage';

// Ensure PrismaClient is created only once to avoid over-connection issues
const prisma = new PrismaClient();

export default async function Page() {
  // Fetch users from the database
  const users = await prisma.user.findMany();

  // Pass the fetched users to the AdminUsersPage component
  return <AdminUsersPage users={users} />;
}
    