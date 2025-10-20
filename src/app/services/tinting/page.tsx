'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TintingPage() {
  const services = [
    {
      title: '3M Window Films',
      description: 'Premium 3M window films for superior quality and performance.',
      icon: '🪟',
      features: ['UV Protection', 'Heat Reduction', 'Glare Reduction', 'Privacy Enhancement']
    },
    {
      title: 'Ceramic Tinting',
      description: 'Advanced ceramic tinting technology for maximum performance.',
      icon: '🔬',
      features: ['Superior Heat Rejection', 'Crystal Clear Visibility', 'No Signal Interference', 'Long-lasting']
    },
    {
      title: 'Security Film',
      description: 'Protect your vehicle with security window film.',
      icon: '🛡️',
      features: ['Break-in Protection', 'Shatter Resistance', 'Privacy Enhancement', 'UV Protection']
    }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/services" className="text-blue-600 hover:text-blue-800">Services</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Window Tinting</span>
          </nav>
        </div>
      </div>

      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Window Tinting</h1>
              <p className="text-xl text-blue-100 mb-6">
                Professional window tinting for style, protection, and comfort. Legal compliance guaranteed with lifetime warranty.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Get Quote
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
                alt="Window Tinting Services"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Tinting Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional window tinting with premium materials and expert installation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      <Footer />
    </main>
  )
}
