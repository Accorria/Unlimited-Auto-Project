'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CollisionRepairPage() {
  const services = [
    {
      title: 'Auto Body Repair',
      description: 'Expert collision repair to restore your vehicle to pre-accident condition.',
      icon: '🔨',
      features: ['Frame Straightening', 'Panel Replacement', 'Rust Repair', 'Structural Repair']
    },
    {
      title: 'Paint Matching & Refinishing',
      description: 'Professional paint services with perfect color matching.',
      icon: '🎨',
      features: ['Color Matching', 'Paint Blending', 'Clear Coat Application', 'Paint Protection']
    },
    {
      title: 'Dent Removal',
      description: 'Paintless dent repair and traditional dent removal services.',
      icon: '🔧',
      features: ['Paintless Dent Repair', 'Traditional Dent Repair', 'Hail Damage Repair', 'Door Ding Removal']
    },
    {
      title: 'Glass Replacement',
      description: 'Complete auto glass replacement and repair services.',
      icon: '🪟',
      features: ['Windshield Replacement', 'Side Window Repair', 'Rear Window Service', 'Glass Tinting']
    },
    {
      title: 'Bumper Repair',
      description: 'Professional bumper repair and replacement services.',
      icon: '🚗',
      features: ['Bumper Repair', 'Bumper Replacement', 'Paint Matching', 'Sensor Calibration']
    },
    {
      title: 'Insurance Claims',
      description: 'We work directly with insurance companies to streamline your claim.',
      icon: '📋',
      features: ['Insurance Coordination', 'Direct Billing', 'Claim Assistance', 'Rental Coordination']
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/services" className="text-blue-600 hover:text-blue-800">Services</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Collision Repair</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Collision Repair</h1>
              <p className="text-xl text-blue-100 mb-6">
                Expert body work and paint services to restore your vehicle to its original condition. Insurance approved with lifetime paint warranty.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/Dealership_Photos/Before and After.jpg"
                alt="Collision Repair Services"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Collision Repair Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive collision repair services to restore your vehicle to pre-accident condition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="text-green-600 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Insurance Approved</h2>
            <p className="text-xl text-gray-600">
              We work with all major insurance companies to make the process easy for you
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['State Farm', 'Allstate', 'Progressive', 'Geico', 'Farmers', 'USAA', 'AAA', 'Liberty Mutual'].map((company) => (
              <div key={company} className="bg-gray-50 p-6 rounded-lg text-center">
                <span className="font-semibold text-gray-800">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Warranty Promise</h2>
            <p className="text-xl text-gray-600">
              We stand behind our work with comprehensive warranties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lifetime Paint Warranty</h3>
              <p className="text-gray-600">Our paint work is guaranteed for the life of your vehicle</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Workmanship Warranty</h3>
              <p className="text-gray-600">All repair work backed by our satisfaction guarantee</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Parts Warranty</h3>
              <p className="text-gray-600">Quality parts with manufacturer warranties</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Collision Repair?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Get a free estimate and let us restore your vehicle to its original condition.
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
