'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [localInput, setLocalInput] = useState('')
  const [localMessages, setLocalMessages] = useState<Array<{ id: string; role: string; content: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const chatHook = useChat({
    api: '/api/chat',
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
      // Call the API directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...localMessages, userMessage].map(m => ({ role: m.role, content: m.content }))
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

  // Auto-open chatbot on first visit (after 3 seconds)
  useEffect(() => {
    // Check if user has already seen the auto-popup (stored in sessionStorage)
    const hasSeenPopup = sessionStorage.getItem('chatbot_auto_opened')
    
    if (!hasSeenPopup && !isOpen) {
      const autoOpenTimer = setTimeout(() => {
        setIsOpen(true)
        setHasAutoOpened(true)
        sessionStorage.setItem('chatbot_auto_opened', 'true')
      }, 3000) // Auto-open after 3 seconds
      
      return () => clearTimeout(autoOpenTimer)
    }
  }, [])

  // Auto-greet when chat opens for the first time
  useEffect(() => {
    if (isOpen && displayMessages.length === 0 && !displayLoading) {
      // Add greeting message after a short delay
      const greetingTimer = setTimeout(() => {
        const greetingMessage = {
          id: 'greeting-' + Date.now(),
          role: 'assistant',
          content: "Hey, can I help you? 👋 I'm here to help you find the perfect vehicle. What are you looking for today?"
        }
        setLocalMessages([greetingMessage])
      }, 500) // Small delay to make it feel natural
      
      return () => clearTimeout(greetingTimer)
    }
  }, [isOpen, displayMessages.length, displayLoading])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages])

  const handleScheduleAppointment = async (vehicleInfo?: string) => {
    // Collect customer info and create lead
    const name = prompt('What\'s your name?')
    if (!name) return

    const phone = prompt('What\'s your phone number?')
    if (!phone) return

    const email = prompt('What\'s your email address?')
    if (!email) return

    const appointmentDate = prompt('What date would you like to schedule? (e.g., 2024-01-15)')
    const appointmentTime = prompt('What time? (e.g., 14:00)')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          message: `Interested in scheduling appointment${vehicleInfo ? ` for ${vehicleInfo}` : ''}`,
          source: 'chatbot',
          appointmentDate: appointmentDate || undefined,
          appointmentTime: appointmentTime || undefined,
        }),
      })

      if (response.ok) {
        alert('Appointment request submitted! We\'ll contact you soon to confirm.')
        setIsOpen(false)
      } else {
        alert('Failed to submit appointment request. Please try again or contact us through our contact form.')
      }
    } catch (error) {
      console.error('Error submitting appointment:', error)
      alert('Failed to submit appointment request. Please try again or call us directly.')
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white rounded-full p-3 sm:p-4 shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 hover:scale-110 active:scale-95 z-50 touch-manipulation"
          aria-label="Open chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-8rem)] sm:h-[600px] max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Unlimited Auto Chat</h3>
              <p className="text-sm text-blue-100">We're here to help!</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
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
            {displayMessages.length === 0 && !displayLoading && (
              <div className="text-center text-gray-500 pt-8">
                <p className="font-semibold mb-2">👋 Hello! I'm here to help you find the perfect vehicle.</p>
                <p className="text-sm">Ask me about:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Available vehicles</li>
                  <li>• Pricing and financing</li>
                  <li>• Scheduling a test drive</li>
                  <li>• Our services</li>
                </ul>
              </div>
            )}

            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}

            {displayLoading && (
              <div className="flex justify-start">
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

          {/* Quick Actions */}
          {displayMessages.length === 0 && (
            <div className="px-4 py-2 border-t border-gray-200 bg-white">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const message = 'Show me available vehicles'
                    if (setInput) {
                      setInput(message)
                    } else {
                      setLocalInput(message)
                    }
                    // Auto-submit after setting input
                    setTimeout(() => {
                      const form = document.querySelector('form') as HTMLFormElement
                      if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                      }
                    }, 100)
                  }}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition-colors"
                >
                  View Inventory
                </button>
                <button
                  onClick={() => handleScheduleAppointment()}
                  className="text-xs bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 transition-colors"
                >
                  Schedule Test Drive
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
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
      )}
    </>
  )
}

