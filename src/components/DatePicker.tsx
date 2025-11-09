'use client'

import { useState, useEffect } from 'react'

interface DatePickerProps {
  value: string // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void
  maxDate?: string // ISO date string
  minDate?: string // ISO date string
  required?: boolean
  className?: string
  label?: string
}

export default function DatePicker({
  value,
  onChange,
  maxDate,
  minDate,
  required = false,
  className = '',
  label
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={handleDateChange}
        min={minDate}
        max={maxDate}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        style={{ 
          cursor: 'pointer',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield'
        }}
        onClick={(e) => {
          // Ensure calendar opens on click
          if (e.currentTarget.showPicker) {
            e.currentTarget.showPicker()
          }
        }}
      />
    </div>
  )
}
