'use client'

import { useState, useEffect } from 'react'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim?: string
  price?: number
  miles?: number
  status: string
}

interface VehicleSelectorProps {
  selectedVehicle: string
  onVehicleChange: (vehicleId: string) => void
  required?: boolean
}

export default function VehicleSelector({ selectedVehicle, onVehicleChange, required = false }: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?dealer=unlimited-auto')
        if (response.ok) {
          const data = await response.json()
          // Only show active vehicles that are for sale
          const activeVehicles = (data.vehicles || []).filter((v: Vehicle) => 
            v.status === 'active' && v.price && v.price > 0
          )
          setVehicles(activeVehicles)
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle)

  if (loading) {
    return (
      <div className="w-full px-2 py-2 border border-gray-300 rounded-md bg-gray-50">
        <span className="text-gray-500">Loading vehicles...</span>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="w-full px-2 py-2 border border-gray-300 rounded-md bg-gray-50">
        <span className="text-gray-500">No vehicles available</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <select
        value={selectedVehicle}
        onChange={(e) => onVehicleChange(e.target.value)}
        className="w-full px-2 py-2 border border-gray-300 rounded-md"
        required={required}
      >
        <option value="">Select a vehicle from our inventory</option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ''} - ${vehicle.price?.toLocaleString() || 'Call for Price'}
          </option>
        ))}
      </select>
      
      {selectedVehicleData && (
        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
          <p><strong>Selected:</strong> {selectedVehicleData.year} {selectedVehicleData.make} {selectedVehicleData.model} {selectedVehicleData.trim || ''}</p>
          <p><strong>Price:</strong> ${selectedVehicleData.price?.toLocaleString() || 'Call for Price'}</p>
          {selectedVehicleData.miles && <p><strong>Mileage:</strong> {selectedVehicleData.miles.toLocaleString()} miles</p>}
        </div>
      )}
    </div>
  )
}
