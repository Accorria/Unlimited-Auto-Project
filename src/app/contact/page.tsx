'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    vehicleInterest: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          source: 'contact_form',
          service: formData.service,
          vehicleInterest: formData.vehicleInterest,
          consent: true
        }),
      })

      if (response.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: '',
          vehicleInterest: ''
        })
      } else {
        alert('There was an error submitting your message. Please try again or call us directly.')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      alert('There was an error submitting your message. Please try again or call us directly.')
    }
  }

  const contactInfo = [
    {
      icon: '📍',
      title: 'Address',
      details: ['24645 Plymouth Rd Unit A', 'Redford Township, MI 48239'],
      action: 'Get Directions'
    },
    {
      icon: '📞',
      title: 'Phone',
      details: ['(313) 766-4475'],
      action: 'Call Now'
    },
    {
      icon: '✉️',
      title: 'Email',
      details: ['info@unlimitedauto.com'],
      action: 'Send Email'
    },
    {
      icon: '🕒',
      title: 'Hours',
      details: [
        'Mon-Fri: 9AM-7PM',
        'Saturday: 9AM-6PM',
        'Sunday: 12PM-5PM'
      ],
      action: 'View Hours'
    }
  ]

  const services = [
    'Vehicle Sales',
    'Auto Repair',
    'Collision Repair',
    'Vehicle Detailing',
    'Window Tinting',
    'Vehicle Wrapping',
    'Financing',
    'Other'
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Get in touch with us today! We're here to help with all your automotive needs. 
              Call, visit, or send us a message - we'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Interested In</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle of Interest (if applicable)</label>
                <input
                  type="text"
                  name="vehicleInterest"
                  value={formData.vehicleInterest}
                  onChange={handleInputChange}
                  placeholder="e.g., 2020 Honda Civic"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us how we can help you..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{info.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">{detail}</p>
                        ))}
                      </div>
                      <button className="mt-3 text-blue-600 hover:text-blue-800 font-semibold">
                        {info.action} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Map */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Find Us</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2948.123456789!2d-83.296234!3d42.376234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b2c1234567890%3A0x1234567890abcdef!2s24645%20Plymouth%20Rd%20Unit%20A%2C%20Redford%20Township%2C%20MI%2048239!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Unlimited Auto Location"
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://www.google.com/maps/dir//24645+Plymouth+Rd+Unit+A,+Redford+Township,+MI+48239"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Get Directions →
                </a>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/inventory"
                  className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Browse Inventory
                </Link>
                <Link
                  href="/financing"
                  className="block w-full border-2 border-blue-600 text-blue-600 text-center py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold"
                >
                  Get Pre-Approved
                </Link>
                <a
                  href="tel:+13137664475"
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Call Now: (313) 766-4475
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Do you offer financing?</h3>
                <p className="text-gray-600">Yes! We work with multiple lenders and can help you get approved regardless of your credit situation.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">What are your business hours?</h3>
                <p className="text-gray-600">We're open Monday-Friday 9AM-7PM, Saturday 9AM-6PM, and Sunday 12PM-5PM.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Do you offer warranties?</h3>
                <p className="text-gray-600">All our vehicles come with a 30-day warranty, and we offer extended warranty options.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Can I schedule a test drive?</h3>
                <p className="text-gray-600">Absolutely! Call us or fill out the contact form to schedule a test drive at your convenience.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Do you accept trade-ins?</h3>
                <p className="text-gray-600">Yes, we accept trade-ins and will give you a fair market value for your vehicle.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">What services do you offer?</h3>
                <p className="text-gray-600">We offer auto repair, collision repair, detailing, window tinting, vehicle wrapping, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
