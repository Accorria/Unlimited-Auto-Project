'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SalesAgentChat from '@/components/SalesAgentChat'

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
  // API response fields
  dealer_id?: string
  model_code?: string
  cost?: number
  title_status?: string
  downPayment?: number
  assigned_to?: string
  display_order?: number
  created_at?: string
  updated_at?: string
  vehicle_photos?: Array<{
    id: string
    angle: string
    file_path: string
    public_url: string
  }>
}

// We'll fetch vehicles from the API instead of using static data

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [salesAgentOpen, setSalesAgentOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMileageRange, setSelectedMileageRange] = useState('')
  const [sortBy, setSortBy] = useState('price-low')

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/vehicles?dealer=unlimited-auto&_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }).catch((error) => {
          // Handle network errors gracefully
          console.warn('Network error fetching vehicles (server may be down):', error)
          return null
        })
        
        if (response && response.ok) {
          const data = await response.json()
          const apiVehicles = data.vehicles || []
          
          // If we have vehicles from API, use them
          if (apiVehicles.length > 0) {
            setVehicles(apiVehicles)
            setLoading(false)
            return
          }
        }
        
        // No fallback - if API has no vehicles, show empty state
        if (response) {
          console.log('No vehicles found in API')
        }
        setVehicles([])
      } catch (error) {
        // Only log if it's not a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Server may be down - cannot fetch vehicles')
        } else {
          console.error('Error fetching vehicles:', error)
        }
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
    
    // Refresh every 60 seconds to catch reordering and status changes (only when page is visible)
    let interval: NodeJS.Timeout | null = null
    const startPolling = () => {
      if (document.visibilityState === 'visible') {
        interval = setInterval(fetchVehicles, 60000) // 60 seconds instead of 10
      }
    }
    const stopPolling = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
    
    // Only poll when page is visible
    if (document.visibilityState === 'visible') {
      startPolling()
    }
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVehicles() // Refresh immediately when page becomes visible
        startPolling()
      } else {
        stopPolling()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Get unique makes and years for filters
  const makes = [...new Set(vehicles.map(v => v.make))].sort()
  const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a)

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    const filtered = vehicles.filter(vehicle => {
      // Search filter - be more permissive
      const matchesSearch = !searchTerm || 
                           vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.year?.toString().includes(searchTerm)
      
      const matchesMake = !selectedMake || vehicle.make === selectedMake
      const matchesYear = !selectedYear || vehicle.year?.toString() === selectedYear
      
      let matchesPrice = true
      if (selectedPriceRange && vehicle.price) {
        const [min, max] = selectedPriceRange.split('-').map(Number)
        if (max) {
          matchesPrice = vehicle.price >= min && vehicle.price <= max
        } else {
          matchesPrice = vehicle.price >= min
        }
      }

      let matchesMileage = true
      if (selectedMileageRange && vehicle.miles) {
        const [min, max] = selectedMileageRange.split('-').map(Number)
        if (max) {
          matchesMileage = vehicle.miles >= min && vehicle.miles <= max
        } else {
          matchesMileage = vehicle.miles >= min
        }
      }

      return matchesSearch && matchesMake && matchesYear && matchesPrice && matchesMileage
    })

    // Sort vehicles - first by display_order (admin-controlled order), then by user selection
    filtered.sort((a, b) => {
      // First, sort by display_order if available (respects admin drag-and-drop order)
      const aOrder = a.display_order ?? 999
      const bOrder = b.display_order ?? 999
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      
      // Then apply user-selected sort
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        case 'year-new':
          return b.year - a.year
        case 'year-old':
          return a.year - b.year
        case 'miles-low':
          return (a.miles || 0) - (b.miles || 0)
        case 'miles-high':
          return (b.miles || 0) - (a.miles || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [vehicles, searchTerm, selectedMake, selectedPriceRange, selectedYear, selectedMileageRange, sortBy])

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Vehicle Inventory</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Quality used cars at unbeatable prices. All vehicles come with our satisfaction guarantee and financing options.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search by make, model, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Make Filter */}
            <div>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                <option value="">All Makes</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Prices</option>
                <option value="0-5000">Under $5,000</option>
                <option value="0-15000">Under $15,000</option>
                <option value="15000-20000">$15,000 - $20,000</option>
                <option value="20000-25000">$20,000 - $25,000</option>
                <option value="25000-30000">$25,000 - $30,000</option>
                <option value="30000">Over $30,000</option>
              </select>
            </div>

            {/* Mileage Range Filter */}
            <div>
              <select
                value={selectedMileageRange}
                onChange={(e) => setSelectedMileageRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Mileage</option>
                <option value="0-25000">Under 25,000 miles</option>
                <option value="25000-50000">25,000 - 50,000 miles</option>
                <option value="50000-75000">50,000 - 75,000 miles</option>
                <option value="75000-100000">75,000 - 100,000 miles</option>
                <option value="100000">Over 100,000 miles</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-gray-600 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
              <option value="miles-low">Mileage: Low to High</option>
              <option value="miles-high">Mileage: High to Low</option>
            </select>
            <span className="text-gray-600">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </span>
          </div>
        </div>
      </section>

      {/* Vehicle Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading vehicles...</span>
            </div>
          ) : (
            <>
              {/* Debug info removed - issue fixed! */}
              {filteredVehicles.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {vehicles.length === 0 ? 'No vehicles currently available' : 'No vehicles match your search'}
              </h3>
              <p className="text-gray-600 mb-8">
                {vehicles.length === 0 ? 'Check back soon for new inventory!' : 'Try adjusting your search criteria'}
              </p>
              {vehicles.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedMake('')
                    setSelectedPriceRange('')
                    setSelectedYear('')
                    setSelectedMileageRange('')
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => {
                // Normalize status to lowercase for comparison
                const normalizedStatus = vehicle.status?.toLowerCase() || 'available'
                const isSold = normalizedStatus === 'sold'
                
                return (
                <div key={vehicle.id} className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border-2 ${
                  isSold
                    ? 'border-red-300' 
                    : 'border-gray-100 hover:shadow-2xl hover:-translate-y-2'
                }`}>
                  <Link href={`/inventory/${vehicle.id}`} className="relative h-64 bg-gray-200 block cursor-pointer group">
                    <Image
                      src={vehicle.vehicle_photos?.[0]?.public_url || vehicle.coverPhoto || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={(vehicle.vehicle_photos?.[0]?.public_url || vehicle.coverPhoto)?.includes('supabase.co')}
                      onError={(e) => {
                        const imageUrl = vehicle.vehicle_photos?.[0]?.public_url || vehicle.coverPhoto
                        console.error('Vehicle image failed to load:', {
                          vehicleId: vehicle.id,
                          vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                          imageUrl: imageUrl,
                          hasPhotos: !!vehicle.vehicle_photos?.length,
                          photoCount: vehicle.vehicle_photos?.length || 0,
                          allPhotoUrls: vehicle.vehicle_photos?.map(p => p.public_url) || []
                        })
                        const target = e.target as HTMLImageElement
                        if (target.parentElement) {
                          const img = document.createElement('img')
                          img.src = imageUrl || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'
                          img.alt = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                          img.className = 'w-full h-full object-cover'
                          img.onerror = () => {
                            img.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'
                          }
                          target.parentElement.innerHTML = ''
                          target.parentElement.appendChild(img)
                        }
                      }}
                    />
                    {/* Hover overlay to indicate clickability */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 px-4 py-2 rounded-lg text-sm font-semibold">
                        View Details →
                      </div>
                    </div>
                    {/* Dynamic down payment badge - only show if not sold */}
                    {!isSold && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg z-10">
                        ${vehicle.downPayment || 999} Down
                      </div>
                    )}
                    
                    {/* SOLD badge - bottom corner, keeps image visible */}
                    {isSold && (
                      <div className="absolute bottom-2 left-2 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl z-20 border-2 border-white">
                        SOLD
                      </div>
                    )}
                  </Link>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim || ''}
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'Call for Price'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-6">
                      <p><strong>Mileage:</strong> {vehicle.miles ? `${vehicle.miles.toLocaleString()}` : 'TBD'}</p>
                      <p><strong>Condition:</strong> {vehicle.condition || 'Good'}</p>
                      {vehicle.transmission && <p><strong>Trans:</strong> {vehicle.transmission}</p>}
                      {vehicle.drivetrain && <p><strong>Drive:</strong> {vehicle.drivetrain}</p>}
                    </div>

                    <div className="space-y-3">
                      {isSold ? (
                        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
                          <p className="text-gray-700 font-semibold text-lg mb-2">This vehicle has been sold</p>
                          <p className="text-sm text-gray-600">Check out our other available vehicles!</p>
                        </div>
                      ) : (
                        <>
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
                          <Link
                            href={`/credit-application?vehicle=${vehicle.id}`}
                            className="w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold block"
                          >
                            🚗 Drive Today
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle)
                              setSalesAgentOpen(true)
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
                          >
                            💬 Talk to Sales Agent
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-xl text-blue-100 mb-8">
            We're constantly adding new vehicles to our inventory. Contact us and we'll help you find the perfect car!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/credit-application"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Get Pre-Approved
            </Link>
          </div>
        </div>
      </section>

      {/* Sales Agent Chat */}
      {salesAgentOpen && selectedVehicle && (
        <SalesAgentChat
          vehicleId={selectedVehicle.id}
          vehicleName={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}${selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}`}
          isOpen={salesAgentOpen}
          onOpenChange={setSalesAgentOpen}
          onClose={() => {
            setSalesAgentOpen(false)
            setSelectedVehicle(null)
          }}
        />
      )}

      <Footer />
    </main>
  )
}
