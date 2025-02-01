'use client';

import React from 'react';

// Define the User type to match Prisma's data types
type User = {
  id: string;
  username: string | null;
  email: string;
  phoneNumber: string | null;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface AdminUsersPageProps {
  users: User[] | undefined;
}

const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ users }) => {
  if (!users) {
    return <p>Loading users...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Dashboard Heading */}
        <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          Admin Dashboard
        </h1>

        {/* Profile Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome, Admin!</h2>
              <p className="text-gray-400">System Administrator</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-200">
            User List ({users.length} total users)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-700">
                <tr>
                  <th className="table-col-name">Username</th>
                  <th className="table-col-name">Email</th>
                  <th className="table-col-name">Phone</th>
                  <th className="table-col-name">Created At</th>
                  <th className="table-col-name">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="table-box">{user.username || 'No Username'}</td>
                    <td className="table-box">{user.email}</td>
                    <td className="table-box">{user.phoneNumber || 'No Phone Number'}</td>
                    <td className="table-box">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="table-box">{new Date(user.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
