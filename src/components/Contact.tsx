'use client'

import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'general'
  })

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
          source: 'contact_section',
          interest: formData.interest,
          consent: true
        }),
      })

      if (response.ok) {
        alert('Thank you for contacting Unlimited Auto! We\'ll get back to you within 24 hours.')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          interest: 'general'
        })
      } else {
        alert('There was an error submitting your message. Please try again or call us directly at (313) 766-4475.')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      alert('There was an error submitting your message. Please try again or call us directly.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let formattedValue = value
    
    // Format phone number
    if (name === 'phone') {
      const phoneNumber = value.replace(/\D/g, '')
      if (phoneNumber.length <= 3) {
        formattedValue = phoneNumber
      } else if (phoneNumber.length <= 6) {
        formattedValue = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
      } else {
        formattedValue = `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
      }
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue
    })
  }

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to find your next vehicle or need service? Contact us today for personalized assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-2">
                    I'm interested in
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="vehicle">Vehicle Purchase</option>
                    <option value="financing">Financing</option>
                    <option value="service">Auto Service</option>
                    <option value="trade">Trade-In</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  How can we help you?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h4 className="font-semibold text-lg">Address</h4>
                    <p className="text-gray-300">
                      24645 Plymouth Rd<br />
                      Redford, MI 48239
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📞</div>
                  <div>
                    <h4 className="font-semibold text-lg">Phone</h4>
                    <p className="text-gray-300">
        <a
          href="tel:+13137664475"
          className="hover:text-white transition-colors"
          onClick={() => {
            if (typeof window !== 'undefined') {
              import('@/lib/tracking').then(({ trackPhoneClick }) => {
                trackPhoneClick('(313) 766-4475', 'contact_section')
              })
            }
          }}
        >
          (313) 766-4475
        </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h4 className="font-semibold text-lg">Email</h4>
                    <p className="text-gray-300">
                      <a 
                        href="mailto:unlimitedautoredford@gmail.com" 
                        className="hover:text-white transition-colors"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            import('@/lib/tracking').then(({ trackEmailClick }) => {
                              trackEmailClick('info@unlimitedautorepaircollision.com', 'contact_section')
                            })
                          }
                        }}
                      >
                        info@unlimitedautorepaircollision.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="text-2xl">🕒</div>
                  <div>
                    <h4 className="font-semibold text-lg">Business Hours</h4>
                    <div className="text-gray-300 space-y-1">
                      <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                      <p>Saturday: 9:00 AM - 6:00 PM</p>
                      <p>Sunday: 12:00 PM - 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-800 p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-3">Quick Response Guarantee</h4>
              <p className="text-blue-100">
                We respond to all inquiries within 2 hours during business hours. 
                Need immediate assistance? Call us now!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
