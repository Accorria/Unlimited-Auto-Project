'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TalkToSalesAgent from '@/components/TalkToSalesAgent'
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
  // New specification fields
  engine?: string
  mpg?: string
  body_style?: string
  doors?: number
  passengers?: number
  fuel_type?: string
  exterior_color?: string
  interior_color?: string
  downPayment?: number
  down_payment?: number
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTalkToSalesAgent, setShowTalkToSalesAgent] = useState(false)
  const resolvedParams = use(params)

  useEffect(() => {
    const fetchVehicle = async () => {
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
        })
        
        if (response.ok) {
          const data = await response.json()
          const foundVehicle = data.vehicles.find((v: Vehicle) => v.id === resolvedParams.id)
          
          if (foundVehicle) {
            setVehicle(foundVehicle)
            setLoading(false)
            return
          }
        }
        
        // Fallback to static data if API fails
        console.log('Using fallback vehicle data')
        const foundVehicle = vehicleData.find((v: Vehicle) => v.id === resolvedParams.id)
        setVehicle(foundVehicle || null)
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        setVehicle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicle()
    
    // Refresh every 60 seconds to catch status and data changes (only when page is visible)
    let interval: NodeJS.Timeout | null = null
    const startPolling = () => {
      if (document.visibilityState === 'visible') {
        interval = setInterval(fetchVehicle, 60000) // 60 seconds instead of 10
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
        fetchVehicle() // Refresh immediately when page becomes visible
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
  }, [resolvedParams.id])

  
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading vehicle details...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">The vehicle you're looking for doesn't exist.</p>
            <Link
              href="/inventory"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Back to Inventory
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Get images from photos array or use cover photo
  const vehicleImages = vehicle.vehicle_photos?.map(photo => photo.public_url) || 
                       vehicle.photos?.map(photo => photo.public_url) ||
                       (vehicle.coverPhoto ? [vehicle.coverPhoto] : [])
  
  const displayedFeatures = vehicle.features ? 
    (showAllFeatures ? vehicle.features : vehicle.features.slice(0, 6)) : []

  // Normalize status to lowercase for comparison
  const normalizedStatus = vehicle.status?.toLowerCase() || 'available'
  const isSold = normalizedStatus === 'sold'

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/inventory" className="text-blue-600 hover:text-blue-800">Inventory</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={vehicleImages[selectedImageIndex] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                fill
                className={`object-cover ${isSold ? 'opacity-80 grayscale' : ''}`}
                priority
              />
              {isSold && (
                <>
                  <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
                  <div className="absolute top-6 left-0 right-0 bg-red-600 text-white text-center py-4 text-3xl font-extrabold shadow-2xl transform -rotate-2 z-20 border-4 border-white">
                    SOLD
                  </div>
                  <div className="absolute bottom-6 right-6 bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-lg z-20 border-2 border-white">
                    SOLD
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {vehicleImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicleImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </h1>
              {isSold && (
                <div className="mb-4 bg-red-600 text-white text-center py-4 px-6 rounded-lg shadow-lg border-4 border-white transform -rotate-1">
                  <p className="text-2xl font-extrabold">SOLD</p>
                  <p className="text-sm mt-1">This vehicle has been sold</p>
                </div>
              )}
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                {!isSold && (
                  <span className="text-2xl font-bold text-blue-600">
                    ${((vehicle.downPayment || vehicle.down_payment || 999)).toLocaleString()} Down
                  </span>
                )}
                {vehicle.miles && (
                  <>
                    {!isSold && <span>•</span>}
                    <span>{vehicle.miles.toLocaleString()} miles</span>
                  </>
                )}
                {vehicle.vin && (
                  <>
                    <span>•</span>
                    <span>{vehicle.vin}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  isSold 
                    ? 'bg-red-600 text-white' 
                    : normalizedStatus === 'available' || normalizedStatus === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}>
                  {isSold 
                    ? 'SOLD' 
                    : vehicle.condition || vehicle.status || 'Available'}
                </span>
              </div>
            </div>

            {/* Key Specs */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Engine:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.engine || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Transmission:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.transmission || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Drivetrain:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.drivetrain || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fuel Type:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.fuel_type || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">MPG:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.mpg || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Body Style:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.body_style || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Doors:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.doors || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Passengers:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {vehicle.passengers || 'Not Specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            {displayedFeatures.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Features & Options</h3>
                <div className="flex flex-wrap gap-2">
                  {displayedFeatures.map((feature, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
                {vehicle.features && vehicle.features.length > 6 && (
                  <button
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showAllFeatures ? 'Show Less' : `Show All ${vehicle.features.length} Features`}
                  </button>
                )}
              </div>
            )}

            {/* Guarantees */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-black mb-4">Guarantees</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-2xl text-green-600 mr-3 font-bold">✓</span>
                  <span className="text-lg font-semibold text-black">No Hidden Fees</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl text-green-600 mr-3 font-bold">✓</span>
                  <span className="text-lg font-semibold text-black">Fast Approval</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl text-green-600 mr-3 font-bold">✓</span>
                  <span className="text-lg font-semibold text-black">Quality Guarantee</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {isSold ? (
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-800 font-semibold text-xl mb-2">This vehicle has been sold</p>
                  <p className="text-gray-600 mb-4">Check out our other available vehicles!</p>
                  <Link
                    href="/inventory"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    View Other Vehicles
                  </Link>
                </div>
              ) : (
                <>
                  {/* Talk to a Sales Agent Button - Prominent */}
                  <button
                    onClick={() => setShowTalkToSalesAgent(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    💬 Talk to a Sales Agent
                  </button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href={`/contact?vehicle=${vehicle.id}`}
                      className="bg-blue-600 text-white text-center py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                    >
                      Schedule Test Drive
                    </Link>
                    <Link
                      href="/credit-application"
                      className="border-2 border-blue-600 text-blue-600 text-center py-4 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold text-lg"
                    >
                      Get Pre-Approved
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      href="/contact"
                      className="bg-gray-600 text-white text-center py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Contact Us
                    </Link>
                    <button 
                      onClick={() => window.print()}
                      className="border-2 border-gray-600 text-gray-600 text-center py-3 rounded-lg hover:bg-gray-600 hover:text-white transition-colors font-semibold"
                    >
                      Print Details
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Talk to Sales Agent Pop-up */}
      {showTalkToSalesAgent && vehicle && (
        <TalkToSalesAgent
          vehicle={vehicle}
          onClose={() => setShowTalkToSalesAgent(false)}
        />
      )}

      <Footer />
    </main>
  )
}
