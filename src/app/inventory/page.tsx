'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Vehicle {
  id: number
  year: number
  make: string
  model: string
  trim: string
  price: number
  miles: number
  coverPhoto?: string
  features: string[]
  condition: string
  fuelType: string
  transmission: string
  drivetrain: string
  color: string
  vin: string
}

// Fallback vehicle data
const fallbackVehicles = [
  {
    id: 1,
    year: 2020,
    make: 'Honda',
    model: 'Civic',
    trim: 'LX',
    price: 18995,
    miles: 45000,
    coverPhoto: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop',
    features: ['Automatic', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
    condition: 'Excellent',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: 'Silver',
    vin: '1HGCV1F3XLA123456'
  },
  {
    id: 2,
    year: 2019,
    make: 'Toyota',
    model: 'Camry',
    trim: 'LE',
    price: 21995,
    miles: 38000,
    coverPhoto: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop',
    features: ['Automatic', 'Lane Assist', 'Cruise Control', 'Heated Seats'],
    condition: 'Very Good',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: 'White',
    vin: '4T1C11AK5KU123456'
  },
  {
    id: 3,
    year: 2021,
    make: 'Nissan',
    model: 'Altima',
    trim: 'SV',
    price: 23995,
    miles: 25000,
    coverPhoto: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=500&h=300&fit=crop',
    features: ['CVT', 'Apple CarPlay', 'Heated Seats', 'Sunroof'],
    condition: 'Like New',
    fuelType: 'Gas',
    transmission: 'CVT',
    drivetrain: 'FWD',
    color: 'Black',
    vin: '1N4BL4BV5MN123456'
  },
  {
    id: 4,
    year: 2018,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    price: 32995,
    miles: 52000,
    coverPhoto: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&h=300&fit=crop',
    features: ['4WD', 'Towing Package', 'Bed Liner', 'Backup Camera'],
    condition: 'Good',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: '4WD',
    color: 'Blue',
    vin: '1FTFW1ET5DFC12345'
  },
  {
    id: 5,
    year: 2020,
    make: 'Chevrolet',
    model: 'Equinox',
    trim: 'LT',
    price: 24995,
    miles: 41000,
    coverPhoto: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500&h=300&fit=crop',
    features: ['AWD', 'Leather Seats', 'Navigation', 'Heated Seats'],
    condition: 'Very Good',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'AWD',
    color: 'Red',
    vin: '2GNAXUEV5L6123456'
  },
  {
    id: 6,
    year: 2019,
    make: 'Hyundai',
    model: 'Elantra',
    trim: 'SE',
    price: 16995,
    miles: 48000,
    coverPhoto: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop',
    features: ['Automatic', 'Bluetooth', 'Backup Camera', 'Remote Start'],
    condition: 'Good',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: 'Gray',
    vin: '5NPE34AF5KH123456'
  }
]

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMake, setSelectedMake] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [sortBy, setSortBy] = useState('price-low')

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data.vehicles || [])
        } else {
          // Fallback to hardcoded data if API fails
          setVehicles(fallbackVehicles)
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setVehicles(fallbackVehicles)
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Get unique makes and years for filters
  const makes = [...new Set(vehicles.map(v => v.make))].sort()
  const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a)

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles.filter(vehicle => {
      const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.year.toString().includes(searchTerm)
      const matchesMake = !selectedMake || vehicle.make === selectedMake
      const matchesYear = !selectedYear || vehicle.year.toString() === selectedYear
      
      let matchesPrice = true
      if (selectedPriceRange) {
        const [min, max] = selectedPriceRange.split('-').map(Number)
        if (max) {
          matchesPrice = vehicle.price >= min && vehicle.price <= max
        } else {
          matchesPrice = vehicle.price >= min
        }
      }

      return matchesSearch && matchesMake && matchesYear && matchesPrice
    })

    // Sort vehicles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'year-new':
          return b.year - a.year
        case 'year-old':
          return a.year - b.year
        case 'miles-low':
          return a.miles - b.miles
        case 'miles-high':
          return b.miles - a.miles
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedMake, selectedPriceRange, selectedYear, sortBy])

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-16">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Make Filter */}
            <div>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <option value="0-15000">Under $15,000</option>
                <option value="15000-20000">$15,000 - $20,000</option>
                <option value="20000-25000">$20,000 - $25,000</option>
                <option value="25000-30000">$25,000 - $30,000</option>
                <option value="30000">Over $30,000</option>
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
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No vehicles found</h3>
              <p className="text-gray-600 mb-8">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedMake('')
                  setSelectedPriceRange('')
                  setSelectedYear('')
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                  <div className="relative h-64">
                    <Image
                      src={vehicle.coverPhoto || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop'}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                      $999 Down
                    </div>
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                      {vehicle.condition}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                      {vehicle.miles.toLocaleString()} miles
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">
                        ${vehicle.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <div>Transmission: {vehicle.transmission}</div>
                      <div>Drivetrain: {vehicle.drivetrain}</div>
                      <div>Fuel: {vehicle.fuelType}</div>
                      <div>Color: {vehicle.color}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {vehicle.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {feature}
                        </span>
                      ))}
                      {vehicle.features.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                          +{vehicle.features.length - 3} more
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
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
              href="/financing"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Get Pre-Approved
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
