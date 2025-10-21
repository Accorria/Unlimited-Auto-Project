'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'

// Sample data - in production, this would come from an API
const sampleVehicles = [
  {
    id: 1,
    year: 2020,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    price: 18995,
    miles: 45000,
    condition: 'Excellent',
    status: 'active'
  },
  {
    id: 2,
    year: 2019,
    make: 'Toyota',
    model: 'Camry',
    trim: 'LE',
    price: 21995,
    miles: 38000,
    condition: 'Very Good',
    status: 'active'
  },
  {
    id: 3,
    year: 2021,
    make: 'Nissan',
    model: 'Altima',
    trim: 'SV',
    price: 23995,
    miles: 25000,
    condition: 'Like New',
    status: 'sold'
  }
]

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('adminUser')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const stats = [
    { name: 'Total Vehicles', value: '12', change: '+2 this month', changeType: 'positive' },
    { name: 'Active Listings', value: '8', change: '+1 this week', changeType: 'positive' },
    { name: 'Sold This Month', value: '4', change: '+100% from last month', changeType: 'positive' },
    { name: 'Pending Sales', value: '2', change: 'No change', changeType: 'neutral' }
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
                </div>
              </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                View Website
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/inventory/add"
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">🚗</div>
                <div className="font-semibold">Add Vehicle</div>
                <div className="text-sm opacity-90">Add new inventory</div>
              </Link>
              
              <Link
                href="/admin/inventory"
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-semibold">Manage Inventory</div>
                <div className="text-sm opacity-90">Edit existing vehicles</div>
              </Link>
              
              <Link
                href="/admin/content"
                className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-semibold">Edit Content</div>
                <div className="text-sm opacity-90">Update descriptions</div>
              </Link>
              
              <Link
                href="/admin/users"
                className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Manage Users</div>
                <div className="text-sm opacity-90">Add & manage users</div>
              </Link>
              
              <Link
                href="/admin/settings"
                className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold">Settings</div>
                <div className="text-sm opacity-90">System settings</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Vehicles */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Vehicles</h2>
              <Link
                href="/admin/inventory"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${vehicle.price.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.miles.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {vehicle.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/inventory/${vehicle.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
