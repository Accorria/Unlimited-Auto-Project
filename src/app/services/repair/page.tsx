'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AutoRepairPage() {
  const services = [
    {
      title: 'Engine Diagnostics & Repair',
      description: 'Complete engine diagnostics using state-of-the-art equipment to identify and fix any issues.',
      icon: '🔧',
      features: ['Computer Diagnostics', 'Engine Tune-ups', 'Timing Belt Replacement', 'Head Gasket Repair']
    },
    {
      title: 'Transmission Service',
      description: 'Expert transmission repair and maintenance for all types of vehicles.',
      icon: '⚙️',
      features: ['Transmission Rebuild', 'Fluid Service', 'Clutch Replacement', 'CV Joint Repair']
    },
    {
      title: 'Brake System Service',
      description: 'Complete brake system inspection, repair, and replacement services.',
      icon: '🛑',
      features: ['Brake Pad Replacement', 'Rotor Resurfacing', 'Brake Line Repair', 'ABS System Service']
    },
    {
      title: 'Suspension & Steering',
      description: 'Professional suspension and steering system repair and alignment.',
      icon: '🚗',
      features: ['Shock & Strut Replacement', 'Wheel Alignment', 'Tie Rod Replacement', 'Ball Joint Service']
    },
    {
      title: 'Electrical System Repair',
      description: 'Complete electrical system diagnostics and repair services.',
      icon: '⚡',
      features: ['Battery Service', 'Alternator Repair', 'Starter Replacement', 'Wiring Repair']
    },
    {
      title: 'AC & Heating Service',
      description: 'HVAC system repair and maintenance to keep you comfortable year-round.',
      icon: '❄️',
      features: ['AC Recharge', 'Compressor Repair', 'Heater Core Service', 'Blower Motor Replacement']
    }
  ]

  const testimonials = [
    {
      name: 'Mike Johnson',
      rating: 5,
      text: 'Great service! They fixed my transmission issue quickly and at a fair price. Highly recommend!'
    },
    {
      name: 'Sarah Williams',
      rating: 5,
      text: 'Professional and honest. They explained everything clearly and didn\'t try to upsell unnecessary services.'
    },
    {
      name: 'David Brown',
      rating: 5,
      text: 'Fast turnaround time and quality work. My car runs better than ever after their service.'
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
            <span className="text-gray-600">Auto Repair</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Auto Repair Services</h1>
              <p className="text-xl text-blue-100 mb-6">
                Professional mechanical services for all makes and models. Our ASE certified technicians use the latest diagnostic equipment to keep your vehicle running smoothly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Schedule Service
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
                src="/Dealership_Photos/Complete Auto Services.jpg"
                alt="Auto Repair Services"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Auto Repair Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive auto repair services to keep your vehicle in top condition.
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

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Auto Repair?</h2>
            <p className="text-xl text-gray-600">
              We're committed to providing quality service with honest pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">ASE Certified</h3>
              <p className="text-gray-600">Our technicians are ASE certified and continuously trained</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Latest Equipment</h3>
              <p className="text-gray-600">State-of-the-art diagnostic equipment for accurate repairs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600">Competitive rates with no hidden fees or surprises</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Warranty</h3>
              <p className="text-gray-600">All repairs backed by our satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Auto Repair Service?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Schedule your appointment today and experience the difference quality service makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Schedule Service
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
