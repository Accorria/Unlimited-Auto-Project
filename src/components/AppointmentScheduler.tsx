'use client'

import { useState } from 'react'

interface AppointmentSchedulerProps {
  defaultType?: 'test_drive' | 'service' | 'consultation'
  vehicleInterest?: string
  vehicleId?: string
  source?: string
  leadId?: string
}

export default function AppointmentScheduler({
  defaultType = 'test_drive',
  vehicleInterest,
  vehicleId,
  source = 'contact_form',
  leadId
}: AppointmentSchedulerProps) {
  const [showScheduler, setShowScheduler] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    type: defaultType,
    name: '',
    email: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Get tomorrow's date as minimum date (you can't book same day)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Time slots (business hours)
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointmentData,
          vehicleInterest,
          vehicleId,
          source,
          leadId
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(result.message || 'Appointment requested successfully!')
        // Reset form
        setAppointmentData({
          appointmentDate: '',
          appointmentTime: '',
          type: defaultType,
          name: '',
          email: '',
          phone: ''
        })
        // Hide scheduler after 3 seconds
        setTimeout(() => {
          setShowScheduler(false)
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Failed to schedule appointment. Please try again.')
      }
    } catch (error) {
      console.error('Appointment submission error:', error)
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showScheduler) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowScheduler(true)}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-base"
        >
          📅 Schedule an Appointment
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 border-2 border-green-500 rounded-lg bg-green-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Schedule Appointment</h3>
        <button
          type="button"
          onClick={() => {
            setShowScheduler(false)
            setSubmitStatus('idle')
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitMessage}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type *</label>
          <select
            value={appointmentData.type}
            onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value as any })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="test_drive">Test Drive</option>
            <option value="service">Service/Repair</option>
            <option value="consultation">Consultation</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={appointmentData.appointmentDate}
              onChange={(e) => setAppointmentData({ ...appointmentData, appointmentDate: e.target.value })}
              min={minDate}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
            <select
              value={appointmentData.appointmentTime}
              onChange={(e) => setAppointmentData({ ...appointmentData, appointmentTime: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
          <input
            type="text"
            value={appointmentData.name}
            onChange={(e) => setAppointmentData({ ...appointmentData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={appointmentData.email}
              onChange={(e) => setAppointmentData({ ...appointmentData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              value={appointmentData.phone}
              onChange={(e) => setAppointmentData({ ...appointmentData, phone: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Scheduling...' : 'Request Appointment'}
        </button>
      </form>
    </div>
  )
}

