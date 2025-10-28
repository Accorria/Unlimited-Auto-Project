'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

interface SmartSelectProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  options: string[]
  placeholder?: string
  className?: string
  learnType?: 'trims' | 'engines' | 'colors' | 'features'
  make?: string
  model?: string
  required?: boolean
}

export default function SmartSelect({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select or type...',
  className = '',
  learnType,
  make,
  model,
  required = false
}: SmartSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [learnedOptions, setLearnedOptions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load learned options
  useEffect(() => {
    if (learnType) {
      fetch(`/api/learn?type=${learnType}`)
        .then(res => res.json())
        .then(data => {
          if (data.entries) {
            setLearnedOptions(data.entries)
          }
        })
        .catch(console.error)
    }
  }, [learnType])

  // Combine original options with learned options (memoized to prevent infinite loops)
  const allOptions = useMemo(() => {
    return [...new Set([...options, ...learnedOptions])].sort()
  }, [options, learnedOptions])

  // Filter options based on input
  useEffect(() => {
    if (value) {
      const filtered = allOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(allOptions)
    }
  }, [value, allOptions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e)
    setIsOpen(true)
  }

  const handleOptionSelect = (option: string) => {
    const syntheticEvent = {
      target: {
        name,
        value: option
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && !allOptions.includes(value)) {
      // Learn new entry
      if (learnType) {
        fetch('/api/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: learnType,
            value,
            make,
            model
          })
        })
        .then(() => {
          console.log(`Learned new ${learnType}: ${value}`)
          // Refresh learned options
          fetch(`/api/learn?type=${learnType}`)
            .then(res => res.json())
            .then(data => {
              if (data.entries) {
                setLearnedOptions(data.entries)
              }
            })
        })
        .catch(console.error)
      }
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionSelect(option)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900 font-medium"
              >
                {option}
                {learnedOptions.includes(option) && (
                  <span className="ml-2 text-xs text-green-600">(learned)</span>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Press Enter to add "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
