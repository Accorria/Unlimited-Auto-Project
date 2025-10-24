'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhotoUpload from '@/components/PhotoUpload'

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

// Common vehicle colors
const colorOptions = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Gold', 'Orange', 'Yellow', 'Purple', 'Beige', 'Tan', 'Maroon', 'Navy', 'Other'
]

// Common vehicle makes (alphabetical order)
const commonMakes = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
]

// Common models by make (alphabetical order)
const commonModels: Record<string, string[]> = {
  'Acura': ['CDX', 'ILX', 'MDX', 'NSX', 'RDX', 'RLX', 'TLX'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'i3', 'i8', 'X1', 'X3', 'X5', 'X7', 'Z4'],
  'Buick': ['Cascada', 'Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal'],
  'Cadillac': ['ATS', 'CT6', 'CTS', 'Escalade', 'XTS', 'XT4', 'XT5', 'XT6'],
  'Chevrolet': ['Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Express', 'Impala', 'Malibu', 'Silverado', 'Sonic', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Grand Caravan', 'Journey'],
  'Ford': ['Bronco', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Focus', 'Fusion', 'Maverick', 'Mustang', 'Ranger', 'Transit'],
  'GMC': ['Acadia', 'Canyon', 'Savana', 'Sierra', 'Terrain', 'Yukon'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Fit', 'HR-V', 'Insight', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai': ['Elantra', 'Genesis', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster', 'Venue'],
  'Infiniti': ['FX', 'G37', 'Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX80'],
  'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Wagoneer', 'Renegade', 'Wrangler'],
  'Kia': ['Forte', 'Niro', 'Optima', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Lexus': ['BRZ', 'Crosstrek', 'ES', 'GX', 'GS', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX'],
  'Lincoln': ['Aviator', 'Continental', 'Corsair', 'MKC', 'MKT', 'MKX', 'MKZ', 'Navigator'],
  'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'E-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'S-Class'],
  'Mini': ['Cooper', 'Cooper S', 'Cooper SE', 'Cooper JCW', 'Countryman', 'Countryman S', 'Countryman JCW', 'Hardtop', 'Hardtop S', 'Hardtop JCW', 'Convertible', 'Convertible S', 'Convertible JCW', 'Clubman', 'Clubman S', 'Clubman JCW', 'Paceman', 'Roadster'],
  'Mitsubishi': ['Eclipse Cross', 'Lancer', 'Mirage', 'Mirage G4', 'Outlander'],
  'Nissan': ['370Z', 'Altima', 'Armada', 'Frontier', 'GT-R', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Subaru': ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
  'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster'],
  'Toyota': ['4Runner', 'Avalon', 'C-HR', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sienna', 'Tacoma', 'Tundra', 'Venza'],
  'Volkswagen': ['Arteon', 'Atlas', 'Beetle', 'Golf', 'ID.4', 'Jetta', 'Passat', 'Tiguan'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
}

// Make-specific trims
const makeSpecificTrims: Record<string, string[]> = {
  'Mini': ['Base', 'Cooper', 'Cooper S', 'Cooper SE', 'Cooper JCW', 'Hardtop', 'Hardtop S', 'Hardtop JCW', 'Convertible', 'Convertible S', 'Convertible JCW', 'Clubman', 'Clubman S', 'Clubman JCW', 'Countryman', 'Countryman S', 'Countryman JCW', 'Paceman', 'Roadster'],
  'BMW': ['Base', 'M Sport', 'M Performance', 'xDrive', 'sDrive', 'M3', 'M5', 'M8', 'Alpina'],
  'Mercedes-Benz': ['Base', 'AMG', 'AMG Line', '4MATIC', 'EQ', 'Maybach'],
  'Audi': ['Base', 'S-Line', 'RS', 'Quattro', 'e-tron', 'S', 'RS'],
  'Toyota': ['Base', 'LE', 'XLE', 'Limited', 'Platinum', 'TRD', 'Hybrid', 'Prime'],
  'Honda': ['Base', 'LX', 'EX', 'EX-L', 'Touring', 'Sport', 'Type R', 'Hybrid'],
  'Ford': ['Base', 'S', 'SE', 'SEL', 'Titanium', 'ST', 'RS', 'Platinum', 'King Ranch'],
  'Chevrolet': ['Base', 'LS', 'LT', 'LTZ', 'SS', 'RS', 'Z71', 'Premier'],
  'Nissan': ['Base', 'S', 'SV', 'SL', 'Platinum', 'NISMO', 'SR'],
  'Hyundai': ['Base', 'SE', 'SEL', 'Limited', 'N Line', 'N'],
  'Kia': ['Base', 'LX', 'EX', 'SX', 'GT-Line', 'GT'],
  'Mazda': ['Base', 'Sport', 'Touring', 'Grand Touring', 'Signature'],
  'Subaru': ['Base', 'Premium', 'Limited', 'Touring', 'STI', 'Wilderness'],
  'Volkswagen': ['Base', 'S', 'SE', 'SEL', 'R-Line', 'GTI', 'R'],
  'Lexus': ['Base', 'F Sport', 'Luxury', 'Ultra Luxury', 'F'],
  'Acura': ['Base', 'Technology', 'A-Spec', 'Advance', 'Type S'],
  'Infiniti': ['Base', 'Pure', 'Luxe', 'Essential', 'Sensory', 'Autograph'],
  'Cadillac': ['Base', 'Luxury', 'Premium Luxury', 'Platinum', 'V'],
  'Lincoln': ['Base', 'Premier', 'Reserve', 'Black Label'],
  'Buick': ['Base', 'Preferred', 'Essence', 'Avenir'],
  'GMC': ['Base', 'SLE', 'SLT', 'Denali', 'AT4'],
  'Ram': ['Base', 'Tradesman', 'Big Horn', 'Laramie', 'Rebel', 'Limited', 'TRX'],
  'Jeep': ['Base', 'Sport', 'Sahara', 'Rubicon', 'High Altitude', 'Trailhawk'],
  'Dodge': ['Base', 'SXT', 'GT', 'R/T', 'Scat Pack', 'Hellcat', 'Demon'],
  'Chrysler': ['Base', 'Touring', 'Limited', 'Pinnacle'],
  'Tesla': ['Standard Range', 'Long Range', 'Performance', 'Plaid']
}

// Common vehicle features
const commonFeatures = [
  'Air Conditioning', 'Alloy Wheels', 'AM/FM Radio', 'Backup Camera', 'Bluetooth', 'CD Player', 'Cruise Control', 'Heated Seats', 'Keyless Entry', 'Leather Seats', 'Navigation System', 'Power Windows', 'Remote Start', 'Sunroof', 'USB Port', 'Xenon Headlights'
]

// Description templates
const descriptionTemplates = [
  {
    name: 'Standard',
    description: 'Excellent condition, well-maintained, low miles'
  },
  {
    name: 'Premium', 
    description: 'One owner, garage kept, recent service'
  },
  {
    name: 'Value',
    description: 'Great value, perfect for families, financing available'
  },
  {
    name: 'Urgency',
    description: 'Rare find, pristine condition, won\'t last long'
  }
]

export default function AddVehicle() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null)
  const [customTemplates, setCustomTemplates] = useState(descriptionTemplates)
  const router = useRouter()

  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    price: '',
    miles: '',
    condition: 'Excellent',
    status: 'active',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: '',
    vin: '',
    engine: '',
    mpg: '',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: [] as string[],
    description: '',
    images: [] as string[]
  })
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }
  }, [router])

  // Format number with commas
  const formatNumber = (value: string): string => {
    const number = value.replace(/,/g, '')
    if (number === '') return ''
    return parseInt(number).toLocaleString()
  }

  // Parse number from formatted string
  const parseNumber = (value: string): string => {
    return value.replace(/,/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Handle number formatting for price and miles
    if (name === 'price' || name === 'miles') {
      const numericValue = parseNumber(value)
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }))
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Reset dependent fields when make or model changes
    if (name === 'make') {
      setFormData(prev => ({ ...prev, model: '', trim: '' }))
    }
    if (name === 'model') {
      setFormData(prev => ({ ...prev, trim: '' }))
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImagesChange = useCallback((images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }))
  }, [])

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
      const aiDescription = `This ${formData.year} ${formData.make} ${formData.model} ${formData.trim} is in ${formData.condition.toLowerCase()} condition with ${formData.miles ? formatNumber(formData.miles) : 'low'} miles. Features include ${formData.features.join(', ') || 'modern amenities'}. This vehicle offers excellent value and reliability.`
      
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

  const applyTemplate = (template: any) => {
    const description = template.description
      .replace('{year}', formData.year)
      .replace('{make}', formData.make)
      .replace('{model}', formData.model)
      .replace('{miles}', formData.miles ? formatNumber(formData.miles) : 'low')
      .replace('{features}', formData.features.join(', ') || 'modern amenities')
    
    setFormData(prev => ({
      ...prev,
      description: description
    }))
  }

  const editTemplate = (index: number) => {
    setEditingTemplate(index)
  }

  const saveTemplate = (index: number, newDescription: string) => {
    const updatedTemplates = [...customTemplates]
    updatedTemplates[index].description = newDescription
    setCustomTemplates(updatedTemplates)
    setEditingTemplate(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.make) newErrors.make = 'Make is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.miles) newErrors.miles = 'Miles is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    // Numeric validation
    if (formData.price && (isNaN(Number(parseNumber(formData.price))) || Number(parseNumber(formData.price)) <= 0)) {
      newErrors.price = 'Please enter a valid price'
    }
    if (formData.miles && (isNaN(Number(parseNumber(formData.miles))) || Number(parseNumber(formData.miles)) < 0)) {
      newErrors.miles = 'Please enter valid mileage'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fix the errors in the form before submitting.')
      return
    }

    setLoading(true)

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        price: parseNumber(formData.price),
        miles: parseNumber(formData.miles)
      }

      // Call the API to save the vehicle
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save vehicle')
      }

      console.log('Vehicle saved successfully:', result)
      alert('Vehicle added successfully!')
      // Force refresh the inventory page
      router.push('/admin/inventory?refresh=' + Date.now())
    } catch (error) {
      console.error('Error adding vehicle:', error)
      alert(`Failed to add vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
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
                <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
                <p className="text-sm text-gray-600">Add a new vehicle to your inventory</p>
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
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 75 }, (_, i) => {
                    const year = 2024 - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                <select
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Make</option>
                  {commonMakes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
                {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.make}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.make ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Model</option>
                  {formData.make && commonModels[formData.make]?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trim</label>
                <select
                  name="trim"
                  value={formData.trim}
                  onChange={handleInputChange}
                  disabled={!formData.model}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    'border-gray-300'
                  } ${!formData.model ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Trim</option>
                  {(makeSpecificTrims[formData.make] || ['Base', 'Premium', 'Limited', 'Sport']).map((trim) => (
                    <option key={trim} value={trim}>
                      {trim}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    name="price"
                    value={formData.price ? formatNumber(formData.price) : ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price"
                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miles *</label>
                <input
                  type="text"
                  name="miles"
                  value={formData.miles ? formatNumber(formData.miles) : ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter miles"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.miles ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.miles && <p className="text-red-500 text-sm mt-1">{errors.miles}</p>}
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
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Color</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  maxLength={17}
                  placeholder="Optional"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Photos</h2>
            <PhotoUpload 
              onPhotosChange={handleImagesChange}
              vehicleData={{
                year: formData.year,
                make: formData.make,
                model: formData.model
              }}
            />
          </div>

          {/* Features and Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features and Description</h2>
            <div className="space-y-6">
              {/* Features - Clickable Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {commonFeatures.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.features.includes(feature)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click features to select them. Selected: {formData.features.length} features
                </p>
              </div>

              {/* Description */}
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
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                {aiEnabled && (
                  <p className="text-sm text-purple-600 mt-1">
                    💡 AI Assistant is enabled. Upload photos and click "Generate with AI" to auto-create descriptions.
                  </p>
                )}
                
                {/* Editable Description Templates */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Quick Description Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customTemplates.map((template, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{template.name}</span>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => editTemplate(index)}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate(template)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              Use
                            </button>
                          </div>
                        </div>
                        {editingTemplate === index ? (
                          <div className="space-y-2">
                            <textarea
                              value={template.description}
                              onChange={(e) => {
                                const updatedTemplates = [...customTemplates]
                                updatedTemplates[index].description = e.target.value
                                setCustomTemplates(updatedTemplates)
                              }}
                              className="w-full text-xs p-2 border border-gray-300 rounded"
                              rows={2}
                            />
                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => saveTemplate(index, template.description)}
                                className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTemplate(null)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">{template.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
              {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}