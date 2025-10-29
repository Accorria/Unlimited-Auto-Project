'use client'

import { useState, useEffect, useCallback, use } from 'react'
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
  'Chevrolet': ['Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Express', 'Impala', 'Malibu', 'Silverado 1500', 'Silverado 2500 HD', 'Silverado 3500 HD', 'Sonic', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Bolt EV', 'Bolt EUV', 'Blazer', 'Trax'],
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
  'Mitsubishi': ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander Sport'],
  'Nissan': ['370Z', 'Altima', 'Armada', 'Frontier', 'GT-R', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Subaru': ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Toyota': ['4Runner', 'Avalon', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza', 'Yaris'],
  'Volkswagen': ['Atlas', 'Beetle', 'Golf', 'Jetta', 'Passat', 'Tiguan'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
}

// Make-specific trim levels
const makeSpecificTrims: Record<string, string[]> = {
  'Honda': ['Base', 'LX', 'EX', 'EX-L', 'Sport', 'Touring'],
  'Toyota': ['Base', 'LE', 'XLE', 'Limited', 'Platinum'],
  'Ford': ['Base', 'XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'],
  'Chevrolet': ['Base', 'LS', 'LT', 'LTZ', 'Premier', 'High Country', 'Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'RST', 'LT Trail Boss', 'ZR2', 'SS', 'RS', 'Z71'],
  'Silverado 1500': ['Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'ZR2', 'High Country'],
  'Silverado 2500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
  'Silverado 3500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
  'BMW': ['Base', 'Sport', 'Luxury', 'M Sport', 'M'],
  'Mercedes-Benz': ['Base', 'AMG Line', 'AMG'],
  'Audi': ['Base', 'Premium', 'Premium Plus', 'Prestige'],
  'Lexus': ['Base', 'F Sport', 'Luxury'],
  'Acura': ['Base', 'Technology', 'Advance'],
  'Infiniti': ['Base', 'Luxury', 'Sport'],
  'Cadillac': ['Base', 'Luxury', 'Premium Luxury', 'Platinum'],
  'Lincoln': ['Base', 'Reserve', 'Black Label'],
  'Chrysler': ['Base', 'Touring', 'Limited', 'Pinnacle', 'L', 'LX', 'LXI'],
  'Dodge': ['Base', 'SXT', 'GT', 'R/T', 'Scat Pack', 'Hellcat'],
  'Jeep': ['Base', 'Sport', 'Sahara', 'Rubicon', 'Trailhawk'],
  'Ram': ['Base', 'Tradesman', 'Big Horn', 'Laramie', 'Longhorn', 'Limited'],
  'GMC': ['Base', 'SLE', 'SLT', 'Denali'],
  'Nissan': ['Base', 'S', 'SV', 'SL', 'Platinum'],
  'Hyundai': ['Base', 'SE', 'SEL', 'Limited'],
  'Kia': ['Base', 'LX', 'EX', 'SX'],
  'Mazda': ['Base', 'Sport', 'Touring', 'Grand Touring'],
  'Subaru': ['Base', 'Premium', 'Limited', 'Touring'],
  'Volkswagen': ['Base', 'S', 'SE', 'SEL'],
  'Volvo': ['Base', 'Momentum', 'R-Design', 'Inscription']
}

// Vehicle features organized by category
const vehicleFeatures = {
  'Exterior': [
    'Alloy Wheels', 'Chrome Wheels', 'Steel Wheels', 'Fog Lights', 'LED Headlights', 'Xenon Headlights', 'Halogen Headlights', 'Daytime Running Lights', 'Power Mirrors', 'Heated Mirrors', 'Auto-Dimming Mirrors', 'Tinted Windows', 'Privacy Glass', 'Spoiler', 'Running Boards', 'Roof Rails', 'Tow Package', 'Trailer Hitch'
  ],
  'Interior': [
    'Leather Seats', 'Cloth Seats', 'Vinyl Seats', 'Heated Seats', 'Cooled Seats', 'Power Seats', 'Memory Seats', 'Lumbar Support', 'Split Folding Rear Seats', 'Stow \'n Go Seating', 'Third Row Seating', 'Captain\'s Chairs', 'Bench Seating', 'Leather Steering Wheel', 'Wood Trim', 'Carbon Fiber Trim', 'Ambient Lighting', 'Cargo Cover', 'Cargo Net'
  ],
  'Climate Control': [
    'Air Conditioning', 'Automatic Climate Control', 'Dual Zone Climate Control', 'Tri-Zone Climate Control', 'Rear Climate Control', 'Heated Steering Wheel', 'Heated Seats', 'Cooled Seats', 'Remote Start', 'Defrost System'
  ],
  'Technology & Audio': [
    'AM/FM Radio', 'CD Player', 'MP3 Player', 'USB Port', 'Auxiliary Input', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Uconnect Touchscreen', 'Navigation System', 'GPS', 'Satellite Radio', 'HD Radio', 'Premium Audio', 'Bose Audio', 'Harman Kardon', 'JBL Audio', 'Infotainment System', 'WiFi Hotspot', 'Wireless Charging'
  ],
  'Safety & Security': [
    'Backup Camera', 'Rearview Camera', '360° Camera', 'Parking Sensors', 'Blind Spot Monitoring', 'Lane Departure Warning', 'Forward Collision Warning', 'Automatic Emergency Braking', 'Adaptive Cruise Control', 'Lane Keep Assist', 'Traffic Sign Recognition', 'Driver Attention Monitor', 'Tire Pressure Monitoring', 'Stability Control', 'Traction Control', 'Anti-lock Brakes', 'Airbags', 'Security System', 'Immobilizer', 'Theft Deterrent'
  ],
  'Convenience': [
    'Power Windows', 'Power Locks', 'Keyless Entry', 'Push Button Start', 'Remote Start', 'Cruise Control', 'Adaptive Cruise Control', 'Tilt Steering Wheel', 'Telescoping Steering Wheel', 'Power Steering', 'Steering Wheel Controls', 'Cup Holders', 'Storage Compartments', 'Cargo Area', 'Cargo Management', 'Roof Rack', 'Tonneau Cover', 'Bed Liner'
  ],
  'Doors & Access': [
    'Power Sliding Doors', 'Power Liftgate', 'Power Tailgate', 'Keyless Entry', 'Remote Keyless Entry', 'Smart Key', 'Proximity Key', 'Key Fob', 'Manual Doors', 'Manual Liftgate'
  ],
  'Transmission & Performance': [
    'Manual Transmission', 'Automatic Transmission', 'CVT Transmission', 'Semi-Automatic Transmission', 'Paddle Shifters', 'Sport Mode', 'Eco Mode', 'Tow Mode', '4WD', 'AWD', 'FWD', 'RWD', 'Limited Slip Differential', 'Locking Differential'
  ],
  'Special Features': [
    'Sunroof', 'Moonroof', 'Panoramic Sunroof', 'Convertible Top', 'Hardtop', 'Soft Top', 'T-Top', 'Targa Top', 'Hatchback', 'Liftback', 'Wagon', 'Crossover', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Turbocharged', 'Supercharged', 'V6 Engine', 'V8 Engine', '4-Cylinder Engine', '6-Cylinder Engine', '8-Cylinder Engine'
  ]
}

// Description templates
const descriptionTemplates = [
  {
    name: 'Standard',
    template: 'Great value, perfect for families, financing available'
  },
  {
    name: 'Premium',
    template: 'Luxury features, low mileage, excellent condition, certified pre-owned'
  },
  {
    name: 'Value',
    template: 'Affordable pricing, reliable transportation, well-maintained'
  },
  {
    name: 'Urgency',
    template: 'Limited time offer, must sell, great deal, call today!'
  }
]

export default function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const router = useRouter()
  const resolvedParams = use(params)

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
    interiorColor: '',
    vin: '',
    engine: '',
    mpg: '',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: [] as string[],
    description: '',
    images: [] as string[],
    downPayment: 999,
    customDownPayment: ''
  })
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }

    // Fetch vehicle data by ID
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${resolvedParams.id}`)
        if (response.ok) {
          const vehicle = await response.json()
          console.log('Fetched vehicle for editing:', vehicle)
          
          // Transform the vehicle data to match formData structure
          const transformedVehicle = {
            ...vehicle,
            // Map photos to images array (photos are already sorted by angle)
            images: vehicle.photos ? vehicle.photos.map((photo: any) => photo.public_url) : [],
            // Ensure features is an array
            features: Array.isArray(vehicle.features) ? vehicle.features : []
          }
          
          setFormData(transformedVehicle)
        } else {
          console.error('Failed to fetch vehicle')
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicle()
  }, [router, resolvedParams.id])

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.make) newErrors.make = 'Make is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.miles) newErrors.miles = 'Miles is required'
    if (!formData.description) newErrors.description = 'Description is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
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

  const parseNumber = (value: string | number) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseInt(value.replace(/[^0-9]/g, ''))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
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

      console.log('Submitting vehicle data:', submitData)

      // Call the API to update the vehicle
      const response = await fetch(`/api/vehicles/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok) {
        console.error('API error details:', result)
        throw new Error(result.error || 'Failed to update vehicle')
      }

      console.log('Vehicle updated successfully:', result)
      alert('Vehicle updated successfully!')
      // Force refresh the inventory page
      router.push('/admin/inventory?refresh=' + Date.now())
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert(`Failed to update vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
          <Link href="/admin/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/inventory" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
          <p className="text-gray-600 mt-2">Update vehicle information in your inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Assistant */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-600">Enable AI to auto-generate descriptions from photos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {aiEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
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
                  value={formData.year || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 115 }, (_, i) => {
                    const year = new Date().getFullYear() - i
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
                  value={formData.make || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
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
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
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
                  value={formData.trim || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Trim</option>
                  {formData.make && makeSpecificTrims[formData.make]?.map((trim) => (
                    <option key={trim} value={trim}>
                      {trim}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miles *</label>
                <input
                  type="text"
                  name="miles"
                  value={formData.miles || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter miles"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                {errors.miles && <p className="text-red-500 text-sm mt-1">{errors.miles}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
                <select
                  name="downPayment"
                  value={formData.downPayment || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select down payment</option>
                  <option value="0">$0 Down Payment</option>
                  <option value="500">$500 Down Payment</option>
                  <option value="1000">$1,000 Down Payment</option>
                  <option value="1500">$1,500 Down Payment</option>
                  <option value="2000">$2,000 Down Payment</option>
                  <option value="2500">$2,500 Down Payment</option>
                  <option value="3000">$3,000 Down Payment</option>
                  <option value="3500">$3,500 Down Payment</option>
                  <option value="4000">$4,000 Down Payment</option>
                  <option value="4500">$4,500 Down Payment</option>
                  <option value="5000">$5,000 Down Payment</option>
                  <option value="custom">Custom Amount</option>
                </select>
                {formData.downPayment === 'custom' && (
                  <div className="mt-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="customDownPayment"
                        value={formData.customDownPayment || ''}
                        onChange={handleInputChange}
                        placeholder="Enter custom amount"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">This will appear as a badge on the vehicle listing</p>
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
                  value={formData.condition || ''}
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
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="active">Active (For Sale)</option>
                  <option value="pending">Pending Sale</option>
                  <option value="sold">Sold</option>
                  <option value="reconditioning">Reconditioning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType || ''}
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
                  value={formData.transmission || ''}
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
                  value={formData.drivetrain || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4WD">4WD</option>
                  <option value="4x4">4x4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <select
                  name="color"
                  value={formData.color || ''}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interior Color</label>
                <select
                  name="interiorColor"
                  value={formData.interiorColor || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Interior Color</option>
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
                  value={formData.vin || ''}
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
                  value={formData.engine || ''}
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
                  value={formData.mpg || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 28 City / 39 Highway"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Style</label>
                <select
                  name="bodyStyle"
                  value={formData.bodyStyle || ''}
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
                  <option value="Minivan">Minivan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doors</label>
                <input
                  type="number"
                  name="doors"
                  value={formData.doors || ''}
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
                  value={formData.passengers || ''}
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                  {Object.entries(vehicleFeatures).map(([category, features]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {features.map((feature) => (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => handleFeatureToggle(feature)}
                            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                              (formData.features || []).includes(feature)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click features to select them. Selected: {(formData.features || []).length} features
                </p>
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
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter a detailed description of the vehicle..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                
                {/* Quick Description Templates */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Description Templates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {descriptionTemplates.map((template) => (
                      <div key={template.name} className="border border-gray-300 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{template.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, description: template.template }))}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Use
                          </button>
                        </div>
                        <p className="text-xs text-gray-600">{template.template}</p>
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating Vehicle...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}