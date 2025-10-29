'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotifications } from '@/components/Notification'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim?: string
  price?: number
  miles?: number
  coverPhoto?: string
  photos?: string[] // Array of photo URLs
  vehicle_photos?: Array<{
    id: string
    angle: string
    file_path: string
    public_url: string
  }>
  description?: string
  status: string
  vin?: string
  // Legacy fields for fallback data
  features?: string[]
  condition?: string
  fuelType?: string
  transmission?: string
  drivetrain?: string
  color?: string
  images?: string[] // For fallback data
}


export default function InventoryManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])
  const [draggedVehicle, setDraggedVehicle] = useState<string | null>(null)
  const router = useRouter()
  const { addNotification, NotificationContainer } = useNotifications()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchVehicles()
    } else {
      router.push('/admin/login')
    }
  }, [router])

  // Refresh data when URL changes (after adding a vehicle)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('refresh')) {
      // Clear the refresh parameter and reload data
      window.history.replaceState({}, '', '/admin/inventory')
      fetchVehicles()
    }
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?dealer=unlimited-auto&t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched vehicles:', data.vehicles)
        setVehicles(data.vehicles || [])
      } else {
        console.error('Failed to fetch vehicles')
        setVehicles([]) // Don't show sample vehicles
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([]) // Don't show sample vehicles
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          // Remove from local state
          setVehicles(vehicles.filter(vehicle => vehicle.id !== id))
          addNotification('Vehicle deleted successfully!', 'success')
        } else {
          addNotification('Failed to delete vehicle. Please try again.', 'error')
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        addNotification('Error deleting vehicle. Please try again.', 'error')
      }
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, status: newStatus } : vehicle
    ))
  }

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicles(prev => 
      prev.includes(id) 
        ? prev.filter(vehicleId => vehicleId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([])
    } else {
      setSelectedVehicles(filteredVehicles.map(vehicle => vehicle.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedVehicles.length === 0) {
      addNotification('Please select vehicles to delete', 'error')
      return
    }

    if (confirm(`Are you sure you want to delete ${selectedVehicles.length} vehicle(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = selectedVehicles.map(id => 
          fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
        )
        
        const results = await Promise.all(deletePromises)
        const successCount = results.filter(response => response.ok).length
        
        if (successCount === selectedVehicles.length) {
          setVehicles(vehicles.filter(vehicle => !selectedVehicles.includes(vehicle.id)))
          setSelectedVehicles([])
          addNotification(`${successCount} vehicle(s) deleted successfully!`, 'success')
        } else {
          addNotification(`Only ${successCount} of ${selectedVehicles.length} vehicles were deleted`, 'error')
        }
      } catch (error) {
        console.error('Error deleting vehicles:', error)
        addNotification('Error deleting vehicles. Please try again.', 'error')
      }
    }
  }

  // Drag and drop handlers for reordering
  const handleDragStart = (e: React.DragEvent, vehicleId: string) => {
    setDraggedVehicle(vehicleId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetVehicleId: string) => {
    e.preventDefault()
    
    if (!draggedVehicle || draggedVehicle === targetVehicleId) {
      setDraggedVehicle(null)
      return
    }

    try {
      // Find the indices of the dragged and target vehicles
      const draggedIndex = vehicles.findIndex(v => v.id === draggedVehicle)
      const targetIndex = vehicles.findIndex(v => v.id === targetVehicleId)
      
      if (draggedIndex === -1 || targetIndex === -1) return

      // Create new array with reordered vehicles
      const newVehicles = [...vehicles]
      const [draggedItem] = newVehicles.splice(draggedIndex, 1)
      newVehicles.splice(targetIndex, 0, draggedItem)
      
      // Update local state immediately for better UX
      setVehicles(newVehicles)
      
      // Update the display order in the database
      await fetch('/api/vehicles/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleIds: newVehicles.map(v => v.id)
        })
      })
      
      addNotification('Vehicle order updated successfully', 'success')
      
      // Trigger a refresh of public pages by invalidating their cache
      try {
        await fetch('/api/vehicles/refresh-cache', { method: 'POST' })
      } catch (error) {
        console.log('Cache refresh failed, but reordering succeeded')
      }
    } catch (error) {
      console.error('Error reordering vehicles:', error)
      addNotification('Failed to reorder vehicles', 'error')
      // Refresh to get correct order
      fetchVehicles()
    } finally {
      setDraggedVehicle(null)
    }
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
            <div className="flex gap-3">
              {selectedVehicles.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Selected ({selectedVehicles.length})
                </button>
              )}
              <Link
                href="/admin/inventory/add"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Vehicle
              </Link>
            </div>
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
                placeholder={vehicles.length > 0 ? "Search by make, model, or year..." : "No vehicles to search"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={vehicles.length === 0}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  vehicles.length === 0 
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
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
                    <input
                      type="checkbox"
                      checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
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
                  <tr 
                    key={vehicle.id} 
                    className={`hover:bg-gray-50 cursor-move ${draggedVehicle === vehicle.id ? 'opacity-50' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, vehicle.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, vehicle.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(vehicle.id)}
                        onChange={() => handleSelectVehicle(vehicle.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-12 w-12">
                          {(() => {
                            const imageUrl = vehicle.coverPhoto || vehicle.photos?.[0] || vehicle.vehicle_photos?.[0]?.public_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                            console.log(`Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} image URL:`, imageUrl)
                            return (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={imageUrl}
                                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                                onLoad={() => {
                                  console.log(`Successfully loaded image for ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
                                }}
                                onError={(e) => {
                                  console.error(`Failed to load image for ${vehicle.year} ${vehicle.make} ${vehicle.model}:`, imageUrl)
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                                }}
                              />
                            )
                          })()}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${vehicle.status === 'sold' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                            {vehicle.status === 'sold' && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                SOLD
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            VIN: {vehicle.vin}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicle.miles ? vehicle.miles.toLocaleString() : 'TBD'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {vehicle.condition || vehicle.status || 'Available'}
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
      <NotificationContainer />
    </div>
  )
}
