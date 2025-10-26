'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminNavigation from './AdminNavigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  // Show sidebar on all admin pages except inventory
  const showSidebar = !pathname?.includes('/admin/inventory')
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {showSidebar && <AdminNavigation onLogout={handleLogout} />}
      <main className={`flex-1 overflow-auto ${showSidebar ? 'lg:ml-0' : ''}`}>
        {children}
      </main>
    </div>
  )
}
