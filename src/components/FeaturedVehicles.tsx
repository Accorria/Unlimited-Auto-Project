'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import vehicleData from '@/data/vehicle-data.json'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim?: string
  price?: number
  miles?: number
  coverPhoto?: string
  photos?: Array<{
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
}

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeaturedVehicles = async () => {
      try {
        // Fetch vehicles from API (this will include the Mini Cooper)
        const response = await fetch(`/api/vehicles?dealer=unlimited-auto`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const apiVehicles = data.vehicles || []
          
          if (apiVehicles.length > 0) {
            // Show 6 featured vehicles from API
            const featuredVehicles = apiVehicles
              .filter(vehicle => vehicle.status === 'active' && vehicle.price && vehicle.price > 0)
              .sort((a: Vehicle, b: Vehicle) => {
                // Sort by display_order first (admin-controlled order)
                const aOrder = (a as any).display_order || 999
                const bOrder = (b as any).display_order || 999
                if (aOrder !== bOrder) return aOrder - bOrder
                // Then by price (higher prices first for featured section)
                const aPrice = a.price || 0
                const bPrice = b.price || 0
                if (aPrice !== bPrice) return bPrice - aPrice
                // Then by year (newer first)
                return b.year - a.year
              })
              .slice(0, 6) // Show 6 vehicles instead of 3
            
            console.log('Featured vehicles found:', featuredVehicles.length, featuredVehicles)
            setVehicles(featuredVehicles)
            setLoading(false)
            return
          }
        }
        
        // No fallback - if API has no vehicles, show empty state
        console.log('No vehicles found in API')
        setVehicles([])
      } catch (error) {
        console.error('Error loading vehicles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedVehicles()
    
    // Refresh every 10 seconds to catch reordering
    const interval = setInterval(loadFeaturedVehicles, 10000)
    return () => clearInterval(interval)
  }, [])
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vehicles for Sale & Financing
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Quality cars at great prices. All vehicles come with our satisfaction guarantee and easy financing options.
          </p>
          <Link
            href="/inventory"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            View All Inventory
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading vehicles...</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No vehicles currently available</div>
            <p className="text-gray-400">Check back soon for new inventory!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="relative h-64">
                <Image
                  src={vehicle.vehicle_photos?.[0]?.public_url || vehicle.coverPhoto || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                />
                {/* Down payment badge from vehicle data with $999 fallback */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                  {`$${(((vehicle as any).downPayment ?? 999)).toLocaleString()} Down`}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'Call for Price'}
                  </span>
                </div>

                {/* Vehicle details like Twins Auto Sales */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                  <p><strong>Mileage:</strong> {vehicle.miles ? `${vehicle.miles.toLocaleString()}` : 'TBD'}</p>
                  <p><strong>Condition:</strong> {vehicle.condition || 'Good'}</p>
                  {vehicle.transmission && <p><strong>Trans:</strong> {vehicle.transmission}</p>}
                  {vehicle.drivetrain && <p><strong>Drive:</strong> {vehicle.drivetrain}</p>}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {vehicle.features && vehicle.features.length > 0 ? (
                    vehicle.features.map((feature, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {feature}
                      </span>
                    ))
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      {vehicle.description || 'No features listed'}
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/inventory/${vehicle.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/contact?vehicle=${vehicle.id}`}
                    className="flex-1 border-2 border-blue-600 text-blue-600 text-center py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold"
                  >
                    Schedule Drive
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        <div className="text-center mt-16">
          <div className="bg-linear-to-r from-blue-600 to-blue-800 p-8 rounded-xl shadow-lg">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to find your next car?</h3>
            <p className="text-xl text-blue-100 mb-8">Explore our full inventory and drive away happy!</p>
            <Link
              href="/inventory"
              className="bg-white text-blue-800 px-10 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              View All Inventory →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}