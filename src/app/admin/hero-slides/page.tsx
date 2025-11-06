'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface HeroSlide {
  image: string
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
}

const defaultSlides: HeroSlide[] = [
  {
    image: '/Dealership_Photos/Screenshot_2025-11-05_at_6.07.19_PM.png',
    title: 'REDFORD\'S EASIEST CREDIT APPROVAL',
    subtitle: 'Best Used Car Deals • All Credit Types Welcome',
    description: 'Quality used cars with guaranteed financing. Bad credit? No credit? No problem! Drive home today.',
    ctaText: 'Get Approved Now',
    ctaLink: '/financing',
  },
  {
    image: '/Dealership_Photos/Unlimited_Auto_Side_View.webp',
    title: 'View Inventory',
    subtitle: 'Drive Off Today',
    description: 'Browse our quality used cars and drive home today. All credit types welcome with our easy financing options.',
    ctaText: 'View Inventory',
    ctaLink: '/inventory',
  },
  {
    image: '/Dealership_Photos/Complete_Auto_Services.jpg',
    title: 'Complete Auto Services',
    subtitle: 'Repair • Collision • Detailing • Tinting • Wrapping',
    description: 'From sales to service, we handle all your automotive needs at one location.',
    ctaText: 'Our Services',
    ctaLink: '/services',
  },
]

export default function HeroSlidesManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [slides, setSlides] = useState<HeroSlide[]>(defaultSlides)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      // Load saved slides
      const savedSlides = localStorage.getItem('heroSlides')
      if (savedSlides) {
        try {
          const parsed = JSON.parse(savedSlides)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSlides(parsed)
          }
        } catch (error) {
          console.error('Error loading slides:', error)
        }
      }
    } else {
      router.push('/admin/login')
    }
  }, [router])

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddSlide = () => {
    setSlides(prev => [...prev, {
      image: '',
      title: '',
      subtitle: '',
      description: '',
      ctaText: '',
      ctaLink: '/',
    }])
    setEditingIndex(slides.length)
  }

  const handleDeleteSlide = (index: number) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      setSlides(prev => prev.filter((_, i) => i !== index))
      if (editingIndex === index) {
        setEditingIndex(null)
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1)
      }
    }
  }

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === slides.length - 1) return

    setSlides(prev => {
      const updated = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
      return updated
    })
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Validate slides
    for (const slide of slides) {
      if (!slide.image || !slide.title || !slide.ctaText || !slide.ctaLink) {
        alert('Please fill in all required fields (Image, Title, CTA Text, CTA Link) for all slides.')
        setLoading(false)
        return
      }
    }

    // Save to localStorage
    localStorage.setItem('heroSlides', JSON.stringify(slides))
    
    // Dispatch custom event to update Hero component
    window.dispatchEvent(new Event('heroSlidesUpdated'))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    alert('Hero slides saved successfully! The changes will appear on the homepage.')
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
                <h1 className="text-2xl font-bold text-gray-900">Hero Slides Management</h1>
                <p className="text-sm text-gray-600">Manage the homepage hero carousel slides</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddSlide}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Slide
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">Slide {index + 1}</h2>
                  {slide.title && (
                    <span className="text-sm text-gray-500">- {slide.title}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveSlide(index, 'up')}
                    disabled={index === 0}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveSlide(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    className="px-4 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                  >
                    {editingIndex === index ? 'Collapse' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDeleteSlide(index)}
                    className="px-4 py-1 text-sm bg-red-600 text-white hover:bg-red-700 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingIndex === index && (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image URL */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={slide.image}
                        onChange={(e) => handleSlideChange(index, 'image', e.target.value)}
                        placeholder="Enter image URL (e.g., /Dealership_Photos/image.jpg or https://example.com/image.jpg)"
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can use URLs from your public folder (e.g., /Dealership_Photos/image.jpg) or external URLs
                      </p>
                      {slide.image && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={slide.image}
                              alt="Preview"
                              fill
                              className="object-cover"
                              onError={() => {
                                console.error('Image failed to load:', slide.image)
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                        placeholder="Main heading"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                        placeholder="Subheading (optional)"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={slide.description}
                        onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                        placeholder="Description text"
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>

                    {/* CTA Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Button Text <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={slide.ctaText}
                        onChange={(e) => handleSlideChange(index, 'ctaText', e.target.value)}
                        placeholder="Get Approved Now"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>

                    {/* CTA Link */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Button Link <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={slide.ctaLink}
                        onChange={(e) => handleSlideChange(index, 'ctaLink', e.target.value)}
                        placeholder="/financing"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview (when not editing) */}
              {editingIndex !== index && (
                <div className="p-6">
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {slide.image ? (
                      <Image
                        src={slide.image}
                        alt={slide.title || `Slide ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={() => {
                          console.error('Image failed to load:', slide.image)
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">{slide.title || 'No title'}</h3>
                    {slide.subtitle && (
                      <p className="text-blue-600 font-semibold">{slide.subtitle}</p>
                    )}
                    {slide.description && (
                      <p className="text-gray-600">{slide.description}</p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                        {slide.ctaText || 'No CTA'}
                      </span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
                        → {slide.ctaLink || '/'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {slides.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No slides yet. Add your first slide to get started!</p>
            <button
              onClick={handleAddSlide}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add First Slide
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

