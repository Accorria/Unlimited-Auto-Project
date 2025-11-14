'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { useRouter } from 'next/navigation'
import AppointmentScheduler from './AppointmentScheduler'

interface SalesAgentChatProps {
  vehicleId?: string
  vehicleName?: string
  onClose?: () => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function SalesAgentChat({ 
  vehicleId, 
  vehicleName,
  onClose,
  isOpen: controlledIsOpen,
  onOpenChange
}: SalesAgentChatProps) {
  const router = useRouter()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [localInput, setLocalInput] = useState('')
  const [localMessages, setLocalMessages] = useState<Array<{ id: string; role: string; content: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false)

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '')
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }
  
  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalIsOpen(open)
    }
  }

  const chatHook = useChat({
    api: '/api/chat',
    body: {
      sessionId,
      vehicleId
    }
  })
  
  const {
    messages = [],
    input = '',
    handleInputChange,
    handleSubmit,
    isLoading = false,
    setInput,
    append
  } = chatHook || {}
  
  // Fallback handler if useChat doesn't provide one
  const handleInputChangeFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalInput(value)
    if (handleInputChange) {
      handleInputChange(e)
    } else if (setInput) {
      setInput(value)
    }
  }
  
  // Custom submit handler as fallback
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const messageText = input || localInput
    if (!messageText.trim()) return
    
    setIsSubmitting(true)
    
    // Add user message to local messages
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    }
    setLocalMessages(prev => [...prev, userMessage])
    setLocalInput('')
    
    try {
      // Call the API directly with sessionId and vehicleId
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...localMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
          sessionId,
          vehicleId
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API error:', errorData)
        throw new Error(errorData.error || `API request failed with status ${response.status}`)
      }
      
      // Handle streaming response using AI SDK format
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let assistantMessageId = (Date.now() + 1).toString()
      
      // Add placeholder assistant message
      setLocalMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      }])
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          
          // Handle text stream format (toTextStreamResponse returns plain text chunks)
          // Each chunk is a piece of text that we append
          if (chunk) {
            assistantMessage += chunk
            // Update the assistant message in real-time
            setLocalMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: assistantMessage }
                : msg
            ))
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      const errorMessage = error?.message || 'Failed to send message. Please try again.'
      
      // Show more specific error message
      if (errorMessage.includes('API key')) {
        alert('OpenAI API key is not configured. Please check your environment variables.')
      } else {
        alert(errorMessage)
      }
      
      // Remove the user message and assistant placeholder on error
      setLocalMessages(prev => {
        const withoutLast = prev.slice(0, -1)
        // Remove assistant placeholder if it exists
        return withoutLast.filter(msg => msg.role !== 'assistant' || msg.content !== '')
      })
      setLocalInput(messageText)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Use hook messages if available, otherwise use local
  const displayMessages = messages.length > 0 ? messages : localMessages
  const displayInput = input || localInput
  const displayLoading = isLoading || isSubmitting

  const [showQuickForm, setShowQuickForm] = useState(false)
  const [quickFormData, setQuickFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  })

  // Auto-greet when chat opens for the first time
  useEffect(() => {
    if (isOpen && displayMessages.length === 0 && !displayLoading && showOptions) {
      // Add greeting message after a short delay
      const greetingTimer = setTimeout(() => {
        const greetingMessage = {
          id: 'greeting-' + Date.now(),
          role: 'assistant',
          content: vehicleName 
            ? `Hey! 👋\n\nInterested in the ${vehicleName}?\n\nWould you like to:\n🚗 Set up an appointment for a test drive?\n✅ Get pre-approved for financing?`
            : `Hey! 👋\n\nI'm here to help you find the perfect vehicle!\n\nWould you like to:\n🚗 Schedule a test drive?\n✅ Get pre-approved for financing?\n💬 Or just ask me questions?`
        }
        setLocalMessages([greetingMessage])
      }, 500) // Small delay to make it feel natural
      
      return () => clearTimeout(greetingTimer)
    }
  }, [isOpen, displayMessages.length, displayLoading, vehicleName, showOptions])

  const handleOptionClick = async (option: 'test_drive' | 'pre_approval') => {
    setShowOptions(false)
    
    if (option === 'pre_approval') {
      // Redirect to pre-approval page with vehicle info
      if (vehicleId) {
        router.push(`/credit-application?vehicle=${vehicleId}`)
        if (onClose) onClose()
      } else {
        router.push('/credit-application')
        if (onClose) onClose()
      }
      return
    }
    
    if (option === 'test_drive') {
      // Show appointment scheduler directly
      setShowAppointmentScheduler(true)
      setShowOptions(false)
      return
    }
  }


  const handleQuickFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickFormData.firstName || !quickFormData.phone) {
      alert('Please fill in at least your first name and phone number')
      return
    }

    // Send message with customer info
    const emailPart = quickFormData.email ? ` and my email is ${quickFormData.email}` : ''
    const vehiclePart = vehicleName ? `I'm interested in the ${vehicleName}.` : "I'm interested in learning more."
    const message = `Hi, my name is ${quickFormData.firstName} ${quickFormData.lastName || ''}. My phone number is ${quickFormData.phone}${emailPart}. ${vehiclePart}`
    
    setLocalInput(message)
    setShowQuickForm(false)
    
    // Auto-submit after a short delay
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }, 100)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages])

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[90vh] sm:h-[80vh] max-h-[700px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">💬 Talk to Sales Agent</h3>
            <p className="text-sm text-blue-100">
              {vehicleName ? `About: ${vehicleName}` : "We're here to help!"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-blue-200 transition-colors"
            aria-label="Close chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {displayMessages.length === 0 && !displayLoading && !showQuickForm && !showOptions && !showAppointmentScheduler && (
            <div className="text-center text-gray-500 pt-8">
              <p className="font-semibold mb-2">👋 Hello! I'm your sales agent.</p>
              <p className="text-sm">I'll help you find the perfect vehicle and answer all your questions!</p>
            </div>
          )}


          {/* Appointment Scheduler */}
          {showAppointmentScheduler && (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Test Drive</h3>
                <button
                  onClick={() => {
                    setShowAppointmentScheduler(false)
                    setShowOptions(true)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AppointmentScheduler
                defaultType="test_drive"
                vehicleId={vehicleId}
                vehicleInterest={vehicleName}
                source="sales_agent_chat"
                autoShow={true}
              />
            </div>
          )}

          {/* Quick Form */}
          {showQuickForm && (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 space-y-3">
              <h4 className="font-bold text-gray-900">Text Us</h4>
              <form onSubmit={handleQuickFormSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={quickFormData.firstName}
                    onChange={(e) => setQuickFormData({...quickFormData, firstName: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={quickFormData.lastName}
                    onChange={(e) => setQuickFormData({...quickFormData, lastName: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Mobile Number *"
                  value={quickFormData.phone}
                  onChange={(e) => setQuickFormData({...quickFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={quickFormData.email}
                  onChange={(e) => setQuickFormData({...quickFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                  <span className="text-lg">😊</span>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</div>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                  <span className="text-sm">👤</span>
                </div>
              )}
            </div>
          ))}

          {displayLoading && (
            <div className="flex justify-start items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <span className="text-lg">😊</span>
              </div>
              <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>


        {/* Quick Action Buttons - Sticky at bottom when no active forms */}
        {!showAppointmentScheduler && !showQuickForm && displayMessages.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOptionClick('test_drive')}
                className="bg-blue-600 text-white py-2 px-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-xs shadow-sm"
                title="Schedule Test Drive"
              >
                🚗 Test Drive
              </button>
              <button
                onClick={() => handleOptionClick('pre_approval')}
                className="bg-green-600 text-white py-2 px-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-xs shadow-sm"
                title="Get Pre-Approved"
              >
                ✅ Pre-Approved
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit || handleCustomSubmit}
          className="p-4 border-t border-gray-200 bg-white rounded-b-lg"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={displayInput}
              onChange={handleInputChange || handleInputChangeFallback}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
              disabled={displayLoading}
            />
            <button
              type="submit"
              disabled={displayLoading || !displayInput?.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

