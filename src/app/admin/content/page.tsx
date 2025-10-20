'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Sample content data - in production, this would come from an API
const contentSections = {
  hero: {
    title: 'Hero Section',
    description: 'Main homepage hero content',
    fields: {
      mainTitle: 'REDFORD\'S EASIEST CREDIT APPROVAL',
      subtitle: 'Best Used Car Deals • All Credit Types Welcome',
      description: 'Quality used cars with guaranteed financing. Bad credit? No credit? No problem! Drive home today.',
      ctaText: 'Get Approved Now'
    }
  },
  services: {
    title: 'Services Section',
    description: 'Services overview content',
    fields: {
      title: 'Our Services',
      subtitle: 'From car sales to complete automotive services, we\'re your trusted partner for all vehicle needs.',
      vehicleSalesDesc: 'Quality used cars with comprehensive inspections and warranties.',
      autoRepairDesc: 'Professional mechanical services for all makes and models.',
      collisionDesc: 'Expert body work and paint services to restore your vehicle.',
      detailingDesc: 'Premium cleaning and detailing services for your vehicle.',
      tintingDesc: 'Professional window tinting for style and protection.',
      wrappingDesc: 'Custom vinyl wraps and graphics for your vehicle.'
    }
  },
  financing: {
    title: 'Financing Section',
    description: 'Financing information and messaging',
    fields: {
      title: 'Flexible Financing Options',
      subtitle: 'We work with a variety of lenders to ensure you get the best rates and terms for your next vehicle.',
      mainTitle: 'Redford\'s Easiest Credit Approval!',
      description: 'We work with ALL credit types - good, bad, or no credit. Get approved in minutes, not days!',
      ctaText: 'Apply for Financing'
    }
  },
  about: {
    title: 'About Section',
    description: 'Company information and story',
    fields: {
      title: 'About Unlimited Auto',
      subtitle: 'Your trusted automotive partner in Redford, Michigan. We\'ve been serving the community with quality cars and professional service for over 15 years.',
      story: 'Founded in 2008, Unlimited Auto has grown from a small family business to Redford\'s premier automotive destination. What started as a simple used car lot has evolved into a full-service automotive center offering everything from quality pre-owned vehicles to comprehensive repair services.',
      mission: 'Our founder, Mike Johnson, began with a simple mission: to provide honest, reliable automotive services to the Redford community.'
    }
  }
}

export default function ContentManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [content, setContent] = useState(contentSections)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }
  }, [router])

  const handleFieldChange = (section: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        fields: {
          ...prev[section as keyof typeof prev].fields,
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, this would save to your database
    console.log('Content saved:', content)
    
    alert('Content saved successfully!')
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

  const currentSection = content[activeSection as keyof typeof content]

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
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-sm text-gray-600">Edit website content and descriptions</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Content Sections</h2>
              </div>
              <nav className="p-4 space-y-2">
                {Object.entries(content).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{currentSection.title}</h2>
                <p className="text-gray-600 mt-1">{currentSection.description}</p>
              </div>
              <div className="p-6 space-y-6">
                {Object.entries(currentSection.fields).map(([fieldKey, fieldValue]) => (
                  <div key={fieldKey}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    {fieldKey === 'story' || fieldKey === 'mission' ? (
                      <textarea
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(activeSection, fieldKey, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    ) : (
                      <input
                        type="text"
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(activeSection, fieldKey, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                <p className="text-gray-600 text-sm">How this content will appear on the website</p>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {currentSection.fields.title || currentSection.fields.mainTitle}
                  </h3>
                  {currentSection.fields.subtitle && (
                    <p className="text-blue-600 font-semibold mb-2">{currentSection.fields.subtitle}</p>
                  )}
                  {currentSection.fields.description && (
                    <p className="text-gray-600 mb-4">{currentSection.fields.description}</p>
                  )}
                  {currentSection.fields.ctaText && (
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                      {currentSection.fields.ctaText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
