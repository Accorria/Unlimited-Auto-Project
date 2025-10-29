'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div>
                <div className="text-xl font-bold">UNLIMITED AUTO</div>
                <div className="text-lg font-semibold text-blue-400">REPAIR & COLLISION</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your trusted local auto repair and collision center. We specialize in quality used vehicles, auto repair, collision services, and more with transparent pricing and exceptional customer service.
            </p>
            <div className="text-gray-300 space-y-2">
              <p>📍 24645 Plymouth Rd Unit A, Redford Township, MI 48239</p>
              <p>
                📞                         <a
                          href="tel:+13137664475"
                          className="hover:text-white transition-colors"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              import('@/lib/tracking').then(({ trackPhoneClick }) => {
                                trackPhoneClick('(313) 766-4475', 'footer')
                              })
                            }
                          }}
                        >
                          (313) 766-4475
                        </a>
              </p>
              <p>
                📧 <a 
                  href="mailto:unlimitedautoredford@gmail.com" 
                  className="hover:text-white transition-colors"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      import('@/lib/tracking').then(({ trackEmailClick }) => {
                        trackEmailClick('unlimitedautoredford@gmail.com', 'footer')
                      })
                    }
                  }}
                >
                  unlimitedautoredford@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/inventory" className="text-gray-300 hover:text-white transition-colors">
                  Browse Inventory
                </Link>
              </li>
              <li>
                <Link href="/financing" className="text-gray-300 hover:text-white transition-colors">
                  Financing
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services/repair" className="text-gray-300 hover:text-white transition-colors">
                  Auto Repair
                </Link>
              </li>
              <li>
                <Link href="/services/collision" className="text-gray-300 hover:text-white transition-colors">
                  Collision Repair
                </Link>
              </li>
              <li>
                <Link href="/services/detailing" className="text-gray-300 hover:text-white transition-colors">
                  Detailing
                </Link>
              </li>
              <li>
                <Link href="/services/tinting" className="text-gray-300 hover:text-white transition-colors">
                  Window Tinting
                </Link>
              </li>
              <li>
                <Link href="/services/wrapping" className="text-gray-300 hover:text-white transition-colors">
                  Vehicle Wrapping
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Unlimited Auto. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact Us
              </Link>
              <Link href="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
