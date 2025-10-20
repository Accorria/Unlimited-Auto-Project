'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Sample vehicle data - in a real app, this would come from an API
const vehicleData = {
  1: {
    id: 1,
    year: 2020,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    price: 18995,
    miles: 45000,
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop'
    ],
    features: ['Automatic', 'Bluetooth', 'Backup Camera', 'Cruise Control', 'Keyless Entry', 'USB Ports'],
    condition: 'Excellent',
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
    warranty: '30-Day Limited Warranty',
    history: 'Clean CARFAX - No Accidents Reported',
    description: 'This 2020 Honda Civic LX is in excellent condition with low mileage and a clean history. Perfect for daily commuting with great fuel economy and Honda reliability. All maintenance records available.'
  }
}

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const resolvedParams = use(params)
  
  const vehicle = vehicleData[resolvedParams.id as keyof typeof vehicleData]
  
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

  const displayedFeatures = showAllFeatures ? vehicle.features : vehicle.features.slice(0, 6)

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
                src={vehicle.images[selectedImageIndex]}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                ${vehicle.price.toLocaleString()}
              </div>
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                {vehicle.condition}
              </div>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {vehicle.images.map((image, index) => (
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
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="text-2xl font-bold text-blue-600">${vehicle.price.toLocaleString()}</span>
                <span>•</span>
                <span>{vehicle.miles.toLocaleString()} miles</span>
                <span>•</span>
                <span>{vehicle.vin}</span>
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
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Features & Options</h3>
              <div className="flex flex-wrap gap-2">
                {displayedFeatures.map((feature, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {feature}
                  </span>
                ))}
              </div>
              {vehicle.features.length > 6 && (
                <button
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showAllFeatures ? 'Show Less' : `Show All ${vehicle.features.length} Features`}
                </button>
              )}
            </div>

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
                  <span>Free CARFAX Report</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>No Hidden Fees</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (months)</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-600">Estimated Monthly Payment</p>
              <p className="text-3xl font-bold text-blue-600">$XXX</p>
              <p className="text-sm text-gray-500 mt-2">*Actual payment may vary based on credit approval</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
