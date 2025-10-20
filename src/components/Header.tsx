'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>24645 Plymouth Rd, Redford, MI 48239</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>(313) 766-4475</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>🕒 Mon-Fri: 9AM-7PM | Sat: 9AM-6PM | Sun: 12PM-5PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">UNLIMITED</div>
              <div className="text-lg font-semibold text-blue-600">AUTO</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/inventory" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-semibold uppercase transition-colors">
              Inventory
            </Link>
            <Link href="/financing" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-semibold uppercase transition-colors">
              Financing
            </Link>
            <Link href="/services" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-semibold uppercase transition-colors">
              Services
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-semibold uppercase transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-semibold uppercase transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Get Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <Link href="/inventory" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Inventory
              </Link>
              <Link href="/financing" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Financing
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Services
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
                Contact
              </Link>
              <div className="pt-4">
                <Link
                  href="/contact"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors block text-center"
                >
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
