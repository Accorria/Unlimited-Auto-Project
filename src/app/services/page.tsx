'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const services = [
  {
    id: 'sales',
    title: 'Car Sales',
    description: 'Quality used cars with comprehensive inspections and warranties',
    icon: '🚗',
    image: '/Dealership_Photos/Unlimited_Auto_Front.png',
    features: [
      'Quality Used Vehicles',
      'Comprehensive Inspections',
      'Vehicle History Reports',
      'Financing Available',
      'Warranty Coverage',
      'Test Drive Available',
      'Trade-in Appraisals',
      'All Credit Types Welcome'
    ],
    benefits: [
      'No Hidden Fees',
      'Transparent Pricing',
      'Easy Financing',
      'Customer Satisfaction Guarantee'
    ]
  },
  {
    id: 'repair',
    title: 'Auto Repair',
    description: 'Professional mechanical services for all makes and models',
    icon: '🔧',
    image: '/Dealership_Photos/Complete_Auto_Services.jpg',
    features: [
      'Engine Diagnostics & Repair',
      'Transmission Service',
      'Brake System Service',
      'Suspension & Steering',
      'Electrical System Repair',
      'AC & Heating Service',
      'Oil Changes & Maintenance',
      'Tire Service & Alignment'
    ],
    benefits: [
      'ASE Certified Technicians',
      'Latest Diagnostic Equipment',
      'Quality Parts & Warranties',
      'Competitive Pricing'
    ]
  },
  {
    id: 'collision',
    title: 'Collision Repair',
    description: 'Expert body work and paint services to restore your vehicle',
    icon: '💥',
    image: '/Dealership_Photos/Before_and_After.jpg',
    features: [
      'Auto Body Repair',
      'Paint Matching & Refinishing',
      'Frame Straightening',
      'Dent Removal',
      'Bumper Repair',
      'Glass Replacement',
      'Insurance Claims Assistance',
      'Rental Car Coordination'
    ],
    benefits: [
      'Insurance Approved',
      'Color Match Guarantee',
      'Lifetime Paint Warranty',
      'Free Estimates'
    ]
  },
  {
    id: 'detailing',
    title: 'Vehicle Detailing',
    description: 'Premium cleaning and detailing services for your vehicle',
    icon: '✨',
    image: '/Dealership_Photos/Complete_Auto_Services.jpg',
    features: [
      'Interior Deep Cleaning',
      'Exterior Wash & Wax',
      'Paint Correction',
      'Ceramic Coating',
      'Leather Conditioning',
      'Carpet Shampooing',
      'Engine Bay Cleaning',
      'Headlight Restoration'
    ],
    benefits: [
      'Professional Grade Products',
      'Mobile Service Available',
      'Satisfaction Guaranteed',
      'Regular Maintenance Plans'
    ]
  },
  {
    id: 'tinting',
    title: 'Window Tinting',
    description: 'Professional window tinting for style and protection',
    icon: '🪟',
    image: '/Dealership_Photos/Complete_Auto_Services.jpg',
    features: [
      '3M Window Films',
      'UV Protection',
      'Heat Reduction',
      'Privacy Enhancement',
      'Glare Reduction',
      'Security Film',
      'Ceramic Tinting',
      'Lifetime Warranty'
    ],
    benefits: [
      'Legal Compliance',
      'Professional Installation',
      'Lifetime Warranty',
      'Free Estimates'
    ]
  },
  {
    id: 'wrapping',
    title: 'Vehicle Wrapping',
    description: 'Custom vinyl wraps and graphics for your vehicle',
    icon: '🎨',
    image: '/Dealership_Photos/Complete_Auto_Services.jpg',
    features: [
      'Full Vehicle Wraps',
      'Partial Wraps',
      'Commercial Graphics',
      'Color Change Wraps',
      'Matte & Gloss Finishes',
      'Chrome & Metallic Options',
      'Design Services',
      'Installation & Removal'
    ],
    benefits: [
      'Custom Design',
      'High-Quality Materials',
      'Professional Installation',
      'Protective Coating'
    ]
  }
]

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Complete Auto Services</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              From sales to service, we handle all your automotive needs at one location. Professional service with a personal touch.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">ASE Certified</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">Insurance Approved</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">Quality Guarantee</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">Competitive Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer comprehensive automotive services to keep your vehicle running smoothly and looking great.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                href={service.id === 'sales' ? '/inventory' : `/services/${service.id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="relative h-48">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="text-green-600 mr-2">✓</span>
                        {feature}
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <div className="text-sm text-blue-600 font-medium">
                        +{service.features.length - 3} more services
                      </div>
                    )}
                  </div>
                  
                  <div className="text-blue-600 font-semibold group-hover:text-blue-700">
                    Learn More →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Unlimited Auto?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;ve been serving the Redford community for years with quality service and honest pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Work</h3>
              <p className="text-gray-600">ASE certified technicians with years of experience</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600">Competitive rates with no hidden fees</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Service</h3>
              <p className="text-gray-600">Fast turnaround times to get you back on the road</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Warranty</h3>
              <p className="text-gray-600">All work backed by our satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Service Areas</h2>
            <p className="text-xl text-gray-600">
              We proudly serve the greater Detroit area
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['Redford', 'Detroit', 'Livonia', 'Westland', 'Dearborn', 'Garden City', 'Inkster', 'Plymouth'].map((city) => (
              <div key={city} className="bg-white p-4 rounded-lg shadow-sm">
                <span className="font-medium text-gray-900">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Schedule Service?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us today for a free estimate or to schedule your appointment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Get Free Estimate
            </Link>
            <a
              href="tel:+13137664475"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Call: (313) 766-4475
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
