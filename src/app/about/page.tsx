'use client'

import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const values = [
    {
      title: 'Quality Service',
      description: 'We provide top-quality automotive services with attention to detail and customer satisfaction.',
      icon: '🏆'
    },
    {
      title: 'Honest Pricing',
      description: 'Transparent pricing with no hidden fees. What you see is what you pay.',
      icon: '💰'
    },
    {
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We treat every customer like family.',
      icon: '❤️'
    },
    {
      title: 'Community Focused',
      description: 'Proudly serving the Redford community for years with local expertise.',
      icon: '🏘️'
    }
  ]

  const team = [
    {
      name: 'Mike Johnson',
      position: 'Owner & General Manager',
      experience: '15+ years in automotive industry',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Sarah Williams',
      position: 'Service Manager',
      experience: '10+ years automotive service',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'David Brown',
      position: 'Lead Technician',
      experience: 'ASE Certified, 12+ years',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    }
  ]

  const stats = [
    { number: '500+', label: 'Happy Customers' },
    { number: '15+', label: 'Years Experience' },
    { number: '100%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Customer Support' }
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Unlimited Auto</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your trusted automotive partner in Redford, Michigan. We've been serving the community with quality cars and professional service for over 15 years.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2008, Unlimited Auto has grown from a small family business to Redford's premier automotive destination. 
                  What started as a simple used car lot has evolved into a full-service automotive center offering everything from 
                  quality pre-owned vehicles to comprehensive repair services.
                </p>
                <p>
                  Our founder, Mike Johnson, began with a simple mission: to provide honest, reliable automotive services to the 
                  Redford community. Over the years, we've expanded our services to include auto repair, collision repair, 
                  detailing, window tinting, and vehicle wrapping - all while maintaining our commitment to quality and customer satisfaction.
                </p>
                <p>
                  Today, we're proud to serve hundreds of satisfied customers throughout the greater Detroit area. Our team of 
                  ASE-certified technicians and experienced sales professionals work together to ensure every customer drives 
                  away happy with their purchase or service.
                </p>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src="/Dealership_Photos/Unlimited Auto Front.png"
                alt="Unlimited Auto Dealership"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Services Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600">
              Comprehensive automotive solutions under one roof
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vehicle Sales</h3>
              <p className="text-gray-600 mb-4">Quality used cars with comprehensive inspections and warranties</p>
              <Link href="/inventory" className="text-blue-600 hover:text-blue-800 font-semibold">
                Browse Inventory →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auto Repair</h3>
              <p className="text-gray-600 mb-4">Professional mechanical services for all makes and models</p>
              <Link href="/services/repair" className="text-blue-600 hover:text-blue-800 font-semibold">
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">💥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collision Repair</h3>
              <p className="text-gray-600 mb-4">Expert body work and paint services to restore your vehicle</p>
              <Link href="/services/collision" className="text-blue-600 hover:text-blue-800 font-semibold">
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Detailing</h3>
              <p className="text-gray-600 mb-4">Premium cleaning and detailing services for your vehicle</p>
              <Link href="/services/detailing" className="text-blue-600 hover:text-blue-800 font-semibold">
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">🪟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Window Tinting</h3>
              <p className="text-gray-600 mb-4">Professional window tinting for style and protection</p>
              <Link href="/services/tinting" className="text-blue-600 hover:text-blue-800 font-semibold">
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vehicle Wrapping</h3>
              <p className="text-gray-600 mb-4">Custom vinyl wraps and graphics for your vehicle</p>
              <Link href="/services/wrapping" className="text-blue-600 hover:text-blue-800 font-semibold">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of satisfied customers who trust Unlimited Auto for all their automotive needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inventory"
              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Browse Our Inventory
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Contact Us Today
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
