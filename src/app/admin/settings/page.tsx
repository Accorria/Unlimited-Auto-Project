'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { normalizePhoneToE164 } from '@/lib/sms'

export default function AdminSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingSMS, setSavingSMS] = useState(false)
  const router = useRouter()
  const [smsPhoneNumbers, setSmsPhoneNumbers] = useState<string[]>([])
  const [newPhoneNumber, setNewPhoneNumber] = useState('')

  const [settings, setSettings] = useState({
    businessName: 'Unlimited Auto Repair & Collision LLC',
    businessAddress: '24645 Plymouth Rd Unit A, Redford Township, MI 48239',
    businessPhone: '(313) 766-4475',
    businessEmail: 'info@unlimitedauto.com',
    businessHours: {
      monday: '9AM-7PM',
      tuesday: '9AM-7PM',
      wednesday: '9AM-7PM',
      thursday: '9AM-7PM',
      friday: '9AM-7PM',
      saturday: '9AM-6PM',
      sunday: '12PM-5PM'
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      google: ''
    },
    seo: {
      metaTitle: 'Unlimited Auto - Redford\'s Easiest Credit Approval',
      metaDescription: 'Quality used cars with guaranteed financing. Bad credit? No credit? No problem! Drive home today.',
      keywords: 'used cars, auto financing, bad credit, Redford, Michigan'
    }
  })

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadSMSPhoneNumbers()
    } else {
      router.push('/admin/login')
    }
  }, [router])

  const loadSMSPhoneNumbers = async () => {
    try {
      const response = await fetch('/api/dealers/sms-phones')
      if (response.ok) {
        const data = await response.json()
        setSmsPhoneNumbers(data.phoneNumbers || [])
      }
    } catch (error) {
      console.error('Error loading SMS phone numbers:', error)
    }
  }

  const handleAddPhoneNumber = () => {
    if (!newPhoneNumber.trim()) return
    
    const normalized = normalizePhoneToE164(newPhoneNumber)
    if (!normalized) {
      alert('Invalid phone number format. Please enter a valid phone number (e.g., 3137732380 or +13137732380)')
      return
    }
    
    if (smsPhoneNumbers.includes(normalized)) {
      alert('This phone number is already in the list')
      return
    }
    
    setSmsPhoneNumbers([...smsPhoneNumbers, normalized])
    setNewPhoneNumber('')
  }

  const handleRemovePhoneNumber = (phone: string) => {
    setSmsPhoneNumbers(smsPhoneNumbers.filter(p => p !== phone))
  }

  const handleSaveSMSPhones = async () => {
    setSavingSMS(true)
    try {
      const response = await fetch('/api/dealers/sms-phones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers: smsPhoneNumbers })
      })
      
      if (response.ok) {
        alert('SMS phone numbers saved successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to save phone numbers'}`)
      }
    } catch (error) {
      console.error('Error saving SMS phone numbers:', error)
      alert('Failed to save phone numbers. Please try again.')
    } finally {
      setSavingSMS(false)
    }
  }

  const handleInputChange = (section: string, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleBusinessHoursChange = (day: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: value
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, this would save to your database
    console.log('Settings saved:', settings)
    
    alert('Settings saved successfully!')
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
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">Manage website settings and business information</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => handleInputChange('business', 'businessName', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={settings.businessPhone}
                  onChange={(e) => handleInputChange('business', 'businessPhone', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={settings.businessAddress}
                  onChange={(e) => handleInputChange('business', 'businessAddress', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleInputChange('business', 'businessEmail', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.businessHours).map(([day, hours]) => (
                <div key={day}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {day}
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => handleBusinessHoursChange(day, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform} URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleInputChange('socialMedia', platform, e.target.value)}
                    placeholder={`https://${platform}.com/yourpage`}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input
                  type="text"
                  value={settings.seo.keywords}
                  onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                  placeholder="Separate keywords with commas"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h2>
            <p className="text-sm text-gray-600 mb-4">
              Configure phone numbers that will receive SMS notifications when new leads come in from the sales agent chatbot.
            </p>
            
            <div className="space-y-4">
              {/* Current Phone Numbers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Numbers Receiving SMS Notifications
                </label>
                {smsPhoneNumbers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No phone numbers configured. Add one below.</p>
                ) : (
                  <div className="space-y-2">
                    {smsPhoneNumbers.map((phone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-900 font-medium">{phone}</span>
                        <button
                          onClick={() => handleRemovePhoneNumber(phone)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="3137732380 or +13137732380"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPhoneNumber()
                      }
                    }}
                  />
                  <button
                    onClick={handleAddPhoneNumber}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter phone number in any format (e.g., 3137732380, (313) 773-2380, +13137732380). Will be automatically converted to E.164 format.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={handleSaveSMSPhones}
                  disabled={savingSMS}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {savingSMS ? 'Saving...' : 'Save SMS Phone Numbers'}
                </button>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Admin Version:</span>
                <span className="ml-2 text-gray-600">1.0.0</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-600">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Vehicles:</span>
                <span className="ml-2 text-gray-600">12</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Active Listings:</span>
                <span className="ml-2 text-gray-600">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
