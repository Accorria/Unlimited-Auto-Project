'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminNavigationProps {
  onLogout: () => void
}

export default function AdminNavigation({ onLogout }: AdminNavigationProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/leads', label: 'Leads', icon: '👥' },
    { href: '/admin/inventory', label: 'Inventory', icon: '🚗' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/users', label: 'Users', icon: '👤' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="bg-white shadow-lg border-r border-gray-200 w-64 min-h-screen hidden lg:block">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            U
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="text-lg mr-3">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
