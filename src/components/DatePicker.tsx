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
  const [month, setMonth] = useState<string>('')
  const [day, setDay] = useState<string>('')
  const [year, setYear] = useState<string>('')

  // Parse existing value or set defaults
  useEffect(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00')
      if (!isNaN(date.getTime())) {
        setMonth(String(date.getMonth() + 1).padStart(2, '0'))
        setDay(String(date.getDate()).padStart(2, '0'))
        setYear(String(date.getFullYear()))
      }
    } else {
      setMonth('')
      setDay('')
      setYear('')
    }
  }, [value])

  // Generate date string when components change
  useEffect(() => {
    if (month && day && year) {
      const dateStr = `${year}-${month}-${day}`
      const date = new Date(dateStr + 'T00:00:00')
      
      // Validate date
      if (!isNaN(date.getTime())) {
        const checkMonth = String(date.getMonth() + 1).padStart(2, '0')
        const checkDay = String(date.getDate()).padStart(2, '0')
        const checkYear = String(date.getFullYear())
        
        // Make sure the date is valid (handles leap years, etc.)
        if (checkMonth === month && checkDay === day && checkYear === year) {
          // Check max date
          if (maxDate && dateStr > maxDate) {
            return
          }
          // Check min date
          if (minDate && dateStr < minDate) {
            return
          }
          onChange(dateStr)
        }
      }
    }
  }, [month, day, year, onChange, maxDate, minDate])

  // Generate year options (last 100 years to current year)
  const currentYear = new Date().getFullYear()
  const startYear = maxDate ? new Date(maxDate + 'T00:00:00').getFullYear() : currentYear
  const minYear = minDate ? new Date(minDate + 'T00:00:00').getFullYear() : currentYear - 100
  const years = Array.from({ length: 100 }, (_, i) => startYear - i).filter(y => y >= minYear)

  // Generate month options
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  // Get days in month
  const getDaysInMonth = (month: string, year: string) => {
    if (!month || !year) return 31
    try {
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      if (isNaN(monthNum) || isNaN(yearNum)) return 31
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate()
      return daysInMonth
    } catch {
      return 31
    }
  }

  const daysInMonth = getDaysInMonth(month, year)
  const days = (month && month !== '' && year && year !== '') ? Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1
    return String(dayNum).padStart(2, '0')
  }) : []

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* Month Dropdown */}
        <select
          value={month}
          onChange={(e) => {
            const newMonth = e.target.value
            setMonth(newMonth)
            // Reset day if it's invalid for the new month
            if (day && year) {
              const newDaysInMonth = getDaysInMonth(newMonth, year)
              if (parseInt(day) > newDaysInMonth) {
                setDay(String(newDaysInMonth).padStart(2, '0'))
              } else if (!day) {
                // If day was empty, keep it empty
                setDay('')
              }
            } else {
              // Clear day if month changed but year not set
              setDay('')
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
          required={required}
        >
          <option value="">Month</option>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Day Dropdown - Simple 1-31 dropdown */}
        <select
          value={day}
          onChange={(e) => {
            setDay(e.target.value)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
          required={required && month && year}
        >
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => {
            const dayNum = i + 1
            const dayStr = String(dayNum).padStart(2, '0')
            return (
              <option key={dayNum} value={dayStr}>
                {dayNum}
              </option>
            )
          })}
        </select>

        {/* Year Dropdown */}
        <select
          value={year}
          onChange={(e) => {
            const newYear = e.target.value
            setYear(newYear)
            // Reset day if it's invalid for the new year (leap year)
            if (day && month) {
              const newDaysInMonth = getDaysInMonth(month, newYear)
              if (parseInt(day) > newDaysInMonth) {
                setDay(String(newDaysInMonth).padStart(2, '0'))
              } else if (!day) {
                // If day was empty, keep it empty
                setDay('')
              }
            } else {
              // Clear day if year changed but month not set
              setDay('')
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer"
          required={required}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

