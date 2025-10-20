'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleBasedNav from '@/components/RoleBasedNav'
import { User, UserRole } from '@/lib/types'
import { canManageUserRole, getRoleDisplayName } from '@/lib/auth'

// Sample users data - in production, this would come from Supabase
const sampleUsers: User[] = [
  {
    id: 'user-1',
    auth_user_id: 'auth-1',
    dealer_id: 'unlimited-auto',
    role: 'sales_rep',
    email: 'rio@unlimitedauto.com',
    name: 'Rio Martinez',
    phone: '(313) 555-0123',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    auth_user_id: 'auth-2',
    dealer_id: 'unlimited-auto',
    role: 'sales_manager',
    email: 'mo@unlimitedauto.com',
    name: 'Mo Johnson',
    phone: '(313) 555-0124',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-3',
    auth_user_id: 'auth-3',
    dealer_id: 'unlimited-auto',
    role: 'dealer_admin',
    email: 'fred@unlimitedauto.com',
    name: 'Fred Wilson',
    phone: '(313) 555-0125',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  dealer_admin: 'bg-blue-100 text-blue-800',
  sales_manager: 'bg-green-100 text-green-800',
  sales_rep: 'bg-yellow-100 text-yellow-800'
}

export default function UserManagement() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState<User[]>(sampleUsers)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    phone: '',
    role: 'sales_rep' as UserRole
  })

  const handleLogout = async () => {
    await signOut()
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // In production, this would call the API to invite a user
    const newUser: User = {
      id: `user-${Date.now()}`,
      dealer_id: user?.dealer_id || '',
      role: inviteForm.role,
      email: inviteForm.email,
      name: inviteForm.name,
      phone: inviteForm.phone,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setUsers([...users, newUser])
    setShowInviteModal(false)
    setInviteForm({ email: '', name: '', phone: '', role: 'sales_rep' })
  }

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (!user || !canManageUserRole(user, newRole)) {
      alert('You do not have permission to assign this role.')
      return
    }
    
    setUsers(users.map(u => 
      u.id === userId ? { ...u, role: newRole, updated_at: new Date().toISOString() } : u
    ))
  }

  const handleToggleActive = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, is_active: !u.is_active, updated_at: new Date().toISOString() } : u
    ))
  }

  // Filter users based on current user's role
  const filteredUsers = users.filter(u => {
    if (user?.role === 'super_admin') {
      return true // SMA can see all users
    }
    if (user?.role === 'dealer_admin') {
      return u.dealer_id === user.dealer_id // DA can see their dealer's users
    }
    return false
  })

  const canInviteUsers = user?.role === 'super_admin' || user?.role === 'dealer_admin'
  const canManageRoles = user?.role === 'super_admin' || user?.role === 'dealer_admin'

  return (
    <ProtectedRoute requiredRoles={['super_admin', 'dealer_admin']}>
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNav user={user} />
        
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage team members and their roles</p>
              </div>
              <div className="flex items-center space-x-4">
                {canInviteUsers && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Invite User
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Team Members ({filteredUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                          {u.phone && (
                            <div className="text-sm text-gray-500">{u.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canManageRoles ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className={`text-sm border border-gray-300 rounded px-2 py-1 ${roleColors[u.role]}`}
                          >
                            {user?.role === 'super_admin' && (
                              <option value="super_admin">Super Master Admin</option>
                            )}
                            <option value="dealer_admin">Dealer Admin</option>
                            <option value="sales_manager">Sales Manager</option>
                            <option value="sales_rep">Sales Rep</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[u.role]}`}>
                            {getRoleDisplayName(u.role)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleActive(u.id)}
                          className={`${
                            u.is_active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Invite New User</h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleInviteUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {user?.role === 'super_admin' && (
                        <option value="super_admin">Super Master Admin</option>
                      )}
                      <option value="dealer_admin">Dealer Admin</option>
                      <option value="sales_manager">Sales Manager</option>
                      <option value="sales_rep">Sales Rep</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Send Invite
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
