'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AppointmentScheduler from './AppointmentScheduler'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim?: string
  price?: number
  miles?: number
  coverPhoto?: string
  photos?: Array<{
    id: string
    angle: string
    file_path: string
    public_url: string
  }>
  vehicle_photos?: Array<{
    id: string
    angle: string
    file_path: string
    public_url: string
  }>
  downPayment?: number
  down_payment?: number
}

interface TalkToSalesAgentProps {
  vehicle: Vehicle
  onClose: () => void
}

export default function TalkToSalesAgent({ vehicle, onClose }: TalkToSalesAgentProps) {
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false)
  const [showPreApproval, setShowPreApproval] = useState(false)

  // Get vehicle photo
  const vehiclePhoto = vehicle.vehicle_photos?.[0]?.public_url || 
                       vehicle.photos?.[0]?.public_url || 
                       vehicle.coverPhoto || 
                       'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'

  // Format price
  const displayPrice = vehicle.price 
    ? `$${vehicle.price.toLocaleString()}` 
    : vehicle.downPayment || vehicle.down_payment
    ? `$${(vehicle.downPayment || vehicle.down_payment || 999).toLocaleString()} Down`
    : 'Price on request'

  // Format vehicle name
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Talk to a Sales Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Photo */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={vehiclePhoto}
              alt={vehicleName}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Vehicle Info */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicleName}</h3>
            <p className="text-xl font-semibold text-blue-600 mb-2">{displayPrice}</p>
            {vehicle.miles && (
              <p className="text-gray-600">{vehicle.miles.toLocaleString()} miles</p>
            )}
          </div>

          {/* Greeting Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 text-center">
              Hi! Interested in this vehicle? I can help you:
            </p>
          </div>

          {/* Action Buttons */}
          {!showAppointmentScheduler && !showPreApproval && (
            <div className="space-y-4">
              <button
                onClick={() => setShowAppointmentScheduler(true)}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Schedule Test Drive
              </button>
              
              <Link
                href={`/credit-application?vehicle=${vehicle.id}`}
                onClick={onClose}
                className="block w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg text-center"
              >
                Get Pre-Approved
              </Link>
            </div>
          )}

          {/* Appointment Scheduler */}
          {showAppointmentScheduler && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Test Drive</h3>
                <button
                  onClick={() => setShowAppointmentScheduler(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AppointmentScheduler
                defaultType="test_drive"
                vehicleId={vehicle.id}
                vehicleInterest={vehicleName}
                source="talk_to_sales_agent"
              />
            </div>
          )}

          {/* Contact Info */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-center text-gray-600 text-sm">
              Or call us: <a href="tel:+13137664475" className="text-blue-600 hover:text-blue-800 font-semibold">(313) 766-4475</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

