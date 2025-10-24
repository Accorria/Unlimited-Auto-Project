'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const resolvedParams = use(params)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        // First try to find in our generated vehicle data
        if (vehicleData && vehicleData.length > 0) {
          const foundVehicle = vehicleData.find((v: Vehicle) => v.id === resolvedParams.id)
          setVehicle(foundVehicle || null)
          setLoading(false)
          return
        }
        
        // Fallback to API
        const response = await fetch('/api/vehicles?dealer=unlimited-auto')
        if (response.ok) {
          const data = await response.json()
          const foundVehicle = data.vehicles.find((v: Vehicle) => v.id === resolvedParams.id)
          setVehicle(foundVehicle || null)
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicle()
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
  const vehicleImages = vehicle.photos?.map(photo => photo.public_url) || 
                       (vehicle.coverPhoto ? [vehicle.coverPhoto] : [])
  
  const displayedFeatures = vehicle.features ? 
    (showAllFeatures ? vehicle.features : vehicle.features.slice(0, 6)) : []

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
                className="object-cover"
                priority
              />
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
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <span className="text-2xl font-bold text-blue-600">$9.99 Down</span>
                {vehicle.miles && (
                  <>
                    <span>•</span>
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
                <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                  {vehicle.condition || vehicle.status || 'Available'}
                </span>
              </div>
            </div>

            {/* Key Specs */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Engine:</span>
                  <span className="ml-2 font-medium">{vehicle.engine}</span>
                </div>
                <div>
                  <span className="text-gray-600">Transmission:</span>
                  <span className="ml-2 font-medium">{vehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-gray-600">Drivetrain:</span>
                  <span className="ml-2 font-medium">{vehicle.drivetrain}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fuel Type:</span>
                  <span className="ml-2 font-medium">{vehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-gray-600">MPG:</span>
                  <span className="ml-2 font-medium">{vehicle.mpg}</span>
                </div>
                <div>
                  <span className="text-gray-600">Body Style:</span>
                  <span className="ml-2 font-medium">{vehicle.bodyStyle}</span>
                </div>
                <div>
                  <span className="text-gray-600">Doors:</span>
                  <span className="ml-2 font-medium">{vehicle.doors}</span>
                </div>
                <div>
                  <span className="text-gray-600">Passengers:</span>
                  <span className="ml-2 font-medium">{vehicle.passengers}</span>
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

            {/* Warranty & History */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Warranty & History</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{vehicle.warranty}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>{vehicle.history}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>No Hidden Fees</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href={`/contact?vehicle=${vehicle.id}`}
                  className="bg-blue-600 text-white text-center py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Schedule Test Drive
                </Link>
                <Link
                  href="/financing"
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
                <button className="border-2 border-gray-600 text-gray-600 text-center py-3 rounded-lg hover:bg-gray-600 hover:text-white transition-colors font-semibold">
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Financing Calculator */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment Calculator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
              <input
                type="number"
                placeholder="0"
                defaultValue="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (months)</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" defaultValue="48">
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
                <option value="72">72 months</option>
                <option value="84">84 months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                placeholder="6.9"
                step="0.1"
                defaultValue="6.9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600">Estimated Monthly Payment</p>
              <p className="text-3xl font-bold text-blue-600">$299/month*</p>
              <p className="text-sm text-gray-500 mt-2">*Actual payment may vary based on credit approval</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
