'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Sample vehicle data - in production, this would come from an API
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
    status: 'active',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: 'Silver',
    vin: '1HGCV1F3XLA123456',
    engine: '1.5L 4-Cylinder',
    mpg: '32 City / 42 Highway',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['Automatic', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
    description: 'This 2020 Honda Civic LX is in excellent condition with low mileage and a clean history.',
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop']
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
    status: 'active',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: 'White',
    vin: '4T1C11AK5KU123456',
    engine: '2.5L 4-Cylinder',
    mpg: '28 City / 39 Highway',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['Automatic', 'Lane Assist', 'Cruise Control', 'Heated Seats'],
    description: 'This 2019 Toyota Camry LE offers excellent reliability and fuel economy.',
    images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop']
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
    status: 'sold',
    fuelType: 'Gas',
    transmission: 'CVT',
    drivetrain: 'FWD',
    color: 'Black',
    vin: '1N4BL4BV5MN123456',
    engine: '2.5L 4-Cylinder',
    mpg: '28 City / 39 Highway',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['CVT', 'Apple CarPlay', 'Heated Seats', 'Sunroof'],
    description: 'This 2021 Nissan Altima SV is like new with low mileage and premium features.',
    images: ['https://images.unsplash.com/photo-1549317336-206569e8475c?w=500&h=300&fit=crop']
  }
]

export default function InventoryManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [vehicles, setVehicles] = useState(sampleVehicles)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }
  }, [router])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id))
    }
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, status: newStatus } : vehicle
    ))
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.year.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-sm text-gray-600">Manage your vehicle inventory</p>
              </div>
            </div>
            <Link
              href="/admin/inventory/add"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Vehicle
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Vehicles</label>
              <input
                type="text"
                placeholder="Search by make, model, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active (For Sale)</option>
                <option value="pending">Pending Sale</option>
                <option value="sold">Sold</option>
                <option value="not-for-sale">Not For Sale</option>
                <option value="maintenance">In Maintenance</option>
                <option value="reserved">Reserved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end space-x-4">
              <div className="text-sm text-gray-600">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusFilter('active')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                >
                  Show For Sale Only
                </button>
                <button
                  onClick={() => setStatusFilter('not-for-sale')}
                  className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                >
                  Show Not For Sale
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={vehicle.images[0]}
                            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                          </div>
                          <div className="text-sm text-gray-500">
                            VIN: {vehicle.vin}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${vehicle.price.toLocaleString()}</div>
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
                      <select
                        value={vehicle.status}
                        onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                          vehicle.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : vehicle.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : vehicle.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : vehicle.status === 'not-for-sale'
                            ? 'bg-red-100 text-red-800'
                            : vehicle.status === 'maintenance'
                            ? 'bg-blue-100 text-blue-800'
                            : vehicle.status === 'reserved'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="active">Active (For Sale)</option>
                        <option value="pending">Pending Sale</option>
                        <option value="sold">Sold</option>
                        <option value="not-for-sale">Not For Sale</option>
                        <option value="maintenance">In Maintenance</option>
                        <option value="reserved">Reserved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/inventory/${vehicle.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/inventory/${vehicle.id}`}
                          className="text-green-600 hover:text-green-900"
                          target="_blank"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🚗</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or add a new vehicle.</p>
            <Link
              href="/admin/inventory/add"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Vehicle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
