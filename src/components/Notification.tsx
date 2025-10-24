'use client'

import { useState, useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export default function Notification({ message, type, duration = 3000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'info':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getTypeStyles()}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
    duration?: number
  }>>([])

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, message, type, duration }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const NotificationContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )

  return {
    addNotification,
    removeNotification,
    NotificationContainer
  }
}
