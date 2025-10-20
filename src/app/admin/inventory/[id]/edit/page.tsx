'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/components/ImageUpload'

// Vehicle condition options
const conditionOptions = [
  'Excellent',
  'Very Good', 
  'Good',
  'Fair',
  'Poor',
  'Salvage',
  'Rebuilt'
]

// Sample vehicle data - in production, this would come from an API
const sampleVehicle = {
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
  features: 'Automatic,Bluetooth,Backup Camera,Cruise Control',
  description: 'This 2020 Honda Civic LX is in excellent condition with low mileage and a clean history.',
  images: []
}

// CarQuery API integration
interface CarQueryMake {
  make_id: string
  make_display: string
  make_is_common: string
  make_country: string
}

interface CarQueryModel {
  model_id: string
  model_make_id: string
  model_name: string
  model_trim: string
  model_year: string
  model_body: string
  model_engine_position: string
  model_engine_cc: string
  model_engine_cyl: string
  model_engine_type: string
  model_engine_valves_per_cyl: string
  model_engine_power_ps: string
  model_engine_power_rpm: string
  model_engine_torque_nm: string
  model_engine_torque_rpm: string
  model_engine_bore_mm: string
  model_engine_stroke_mm: string
  model_engine_compression: string
  model_engine_fuel: string
  model_top_speed_kph: string
  model_0_to_100_kph: string
  model_drive: string
  model_transmission_type: string
  model_seats: string
  model_doors: string
  model_weight_kg: string
  model_length_mm: string
  model_width_mm: string
  model_height_mm: string
  model_wheelbase_mm: string
  model_lkm_hwy: string
  model_lkm_mixed: string
  model_lkm_city: string
  model_fuel_cap_l: string
  model_sold_in_us: string
  model_co2: string
  model_make_display: string
}

export default function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const router = useRouter()
  const resolvedParams = use(params)

  const [formData, setFormData] = useState(sampleVehicle)
  
  // CarQuery API state
  const [makes, setMakes] = useState<CarQueryMake[]>([])
  const [models, setModels] = useState<CarQueryModel[]>([])
  const [trims, setTrims] = useState<CarQueryModel[]>([])
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingTrims, setLoadingTrims] = useState(false)

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }

    // Load makes on component mount
    loadMakes()

    // In production, fetch vehicle data by ID
    // const fetchVehicle = async () => {
    //   const response = await fetch(`/api/vehicles/${resolvedParams.id}`)
    //   const vehicle = await response.json()
    //   setFormData(vehicle)
    // }
    // fetchVehicle()
  }, [router, resolvedParams.id])

  // CarQuery API functions
  const loadMakes = async () => {
    setLoadingMakes(true)
    try {
      // Try with CORS proxy first, then fallback to direct API
      const proxyUrl = 'https://api.allorigins.win/raw?url='
      const apiUrl = 'https://www.carqueryapi.com/api/0.3/?cmd=getMakes'
      
      let response
      try {
        // First try with CORS proxy
        response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
      } catch (proxyError) {
        console.log('Proxy failed, trying direct API...')
        // Fallback to direct API call
        response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
        })
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setMakes(data.Makes || [])
    } catch (error) {
      console.error('Error loading makes:', error)
      // Fallback to static makes list if API fails
      setMakes([
        { make_id: 'honda', make_display: 'Honda', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'toyota', make_display: 'Toyota', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'ford', make_display: 'Ford', make_is_common: '1', make_country: 'USA' },
        { make_id: 'chevrolet', make_display: 'Chevrolet', make_is_common: '1', make_country: 'USA' },
        { make_id: 'nissan', make_display: 'Nissan', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'bmw', make_display: 'BMW', make_is_common: '1', make_country: 'Germany' },
        { make_id: 'mercedes-benz', make_display: 'Mercedes-Benz', make_is_common: '1', make_country: 'Germany' },
        { make_id: 'audi', make_display: 'Audi', make_is_common: '1', make_country: 'Germany' },
        { make_id: 'tesla', make_display: 'Tesla', make_is_common: '1', make_country: 'USA' },
        { make_id: 'hyundai', make_display: 'Hyundai', make_is_common: '1', make_country: 'South Korea' },
        { make_id: 'kia', make_display: 'Kia', make_is_common: '1', make_country: 'South Korea' },
        { make_id: 'subaru', make_display: 'Subaru', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'mazda', make_display: 'Mazda', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'volkswagen', make_display: 'Volkswagen', make_is_common: '1', make_country: 'Germany' },
        { make_id: 'lexus', make_display: 'Lexus', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'acura', make_display: 'Acura', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'infiniti', make_display: 'Infiniti', make_is_common: '1', make_country: 'Japan' },
        { make_id: 'cadillac', make_display: 'Cadillac', make_is_common: '1', make_country: 'USA' },
        { make_id: 'lincoln', make_display: 'Lincoln', make_is_common: '1', make_country: 'USA' },
        { make_id: 'jeep', make_display: 'Jeep', make_is_common: '1', make_country: 'USA' }
      ])
    } finally {
      setLoadingMakes(false)
    }
  }

  const loadModels = async (make: string) => {
    if (!make) return
    setLoadingModels(true)
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url='
      const apiUrl = `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${encodeURIComponent(make)}`
      
      let response
      try {
        response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })
      } catch (proxyError) {
        response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/json' },
        })
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setModels(data.Models || [])
    } catch (error) {
      console.error('Error loading models:', error)
      // Fallback to empty array if API fails
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  const loadTrims = async (make: string, model: string, year: string) => {
    if (!make || !model || !year) return
    setLoadingTrims(true)
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url='
      const apiUrl = `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`
      
      let response
      try {
        response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })
      } catch (proxyError) {
        response = await fetch(apiUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/json' },
        })
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setTrims(data.Trims || [])
    } catch (error) {
      console.error('Error loading trims:', error)
      // Fallback to empty array if API fails
      setTrims([])
    } finally {
      setLoadingTrims(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-load models when make changes
    if (name === 'make') {
      loadModels(value)
      setFormData(prev => ({ ...prev, model: '', trim: '' }))
    }

    // Auto-load trims when model or year changes
    if (name === 'model' || name === 'year') {
      if (name === 'model') {
        setFormData(prev => ({ ...prev, trim: '' }))
      }
      if (formData.make && (name === 'model' ? value : formData.model) && (name === 'year' ? value : formData.year)) {
        loadTrims(formData.make, String(name === 'model' ? value : formData.model), String(name === 'year' ? value : formData.year))
      }
    }
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }))
  }

  const generateAIDescription = async () => {
    if (!formData.images || formData.images.length === 0) {
      alert('Please upload at least one image to generate an AI description.')
      return
    }

    setAiLoading(true)
    try {
      // Simulate AI API call - replace with actual AI service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI-generated description
      const aiDescription = `This ${formData.year} ${formData.make} ${formData.model} ${formData.trim} is in ${formData.condition.toLowerCase()} condition with ${formData.miles.toLocaleString()} miles. Features include ${formData.features || 'modern amenities'}. This vehicle offers excellent value and reliability.`
      
      setFormData(prev => ({
        ...prev,
        description: aiDescription
      }))
    } catch (error) {
      console.error('Error generating AI description:', error)
      alert('Failed to generate AI description. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // In production, this would update the vehicle in your database
    console.log('Vehicle updated:', formData)
    
    alert('Vehicle updated successfully!')
    router.push('/admin/inventory')
    setLoading(false)
  }

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
              <Link href="/admin/inventory" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Inventory
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
                <p className="text-sm text-gray-600">Update vehicle information with AI assistance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Assistant Toggle */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-600">Enable AI to auto-generate descriptions from photos</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${aiEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {aiEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option key="year-placeholder" value="">Select Year</option>
                  {Array.from({ length: 115 }, (_, i) => {
                    const year = 2024 - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  disabled={loadingMakes}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option key="make-placeholder" value="">{loadingMakes ? 'Loading makes...' : 'Select Make'}</option>
                  {makes.map((make) => (
                    <option key={make.make_id} value={make.make_display}>
                      {make.make_display}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  disabled={loadingModels || !formData.make}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option key="model-placeholder" value="">{loadingModels ? 'Loading models...' : 'Select Model'}</option>
                  {models.map((model) => (
                    <option key={model.model_id} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trim</label>
                <select
                  name="trim"
                  value={formData.trim}
                  onChange={handleInputChange}
                  disabled={loadingTrims || !formData.model || !formData.year}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option key="trim-placeholder" value="">{loadingTrims ? 'Loading trims...' : 'Select Trim'}</option>
                  {trims.map((trim, index) => (
                    <option key={`trim-${index}-${trim.model_trim}`} value={trim.model_trim}>
                      {trim.model_trim}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miles *</label>
                <input
                  type="number"
                  name="miles"
                  value={formData.miles}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  {conditionOptions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="active">Active (For Sale)</option>
                  <option value="pending">Pending Sale</option>
                  <option value="sold">Sold</option>
                  <option value="not-for-sale">Not For Sale</option>
                  <option value="maintenance">In Maintenance</option>
                  <option value="reserved">Reserved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="Gas">Gas</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drivetrain</label>
                <select
                  name="drivetrain"
                  value={formData.drivetrain}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4WD">4WD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIN *</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  required
                  maxLength={17}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
                  onChange={handleInputChange}
                  placeholder="e.g., 2.0L 4-Cylinder"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MPG</label>
                <input
                  type="text"
                  name="mpg"
                  value={formData.mpg}
                  onChange={handleInputChange}
                  placeholder="e.g., 28 City / 39 Highway"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Style</label>
                <select
                  name="bodyStyle"
                  value={formData.bodyStyle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Wagon">Wagon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doors</label>
                <input
                  type="number"
                  name="doors"
                  value={formData.doors}
                  onChange={handleInputChange}
                  min="2"
                  max="5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <input
                  type="number"
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleInputChange}
                  min="2"
                  max="8"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Photos (Max 20)</h2>
            <ImageUpload 
              onImagesChange={handleImagesChange}
              existingImages={formData.images}
              maxImages={20}
            />
          </div>

          {/* Features and Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features and Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Enter features separated by commas (e.g., Bluetooth, Backup Camera, Cruise Control)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                <p className="text-sm text-gray-500 mt-1">Separate multiple features with commas</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  {aiEnabled && (
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? 'Generating...' : '🤖 Generate with AI'}
                    </button>
                  )}
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter a detailed description of the vehicle..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                {aiEnabled && (
                  <p className="text-sm text-purple-600 mt-1">
                    💡 AI Assistant is enabled. Upload photos and click &quot;Generate with AI&quot; to auto-create descriptions.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/inventory"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Vehicle...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}