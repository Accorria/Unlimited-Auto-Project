'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleBasedNav from '@/components/RoleBasedNav'
import { LeadAnalytics, LeadStatus, UserRole } from '@/lib/types'

// Sample analytics data - in production, this would come from Supabase
const sampleAnalytics: LeadAnalytics = {
  total_leads: 156,
  set_rate: 0.68, // 68%
  show_rate: 0.45, // 45%
  close_rate: 0.23, // 23%
  leads_by_source: {
    'website': 89,
    'facebook': 34,
    'sms': 18,
    'craigslist': 15
  },
  leads_by_agent: {
    'mo': 45,
    'fred': 38,
    'rio': 32,
    'dewey': 25,
    'unassigned': 16
  },
  leads_by_status: {
    'new': 67,
    'set': 45,
    'show': 28,
    'close': 16
  },
  recent_leads: []
}

export default function AnalyticsDashboard() {
  const { user, signOut } = useAuth()
  const [analytics, setAnalytics] = useState<LeadAnalytics>(sampleAnalytics)
  const [dateRange, setDateRange] = useState('30d')

  const handleLogout = async () => {
    await signOut()
  }

  // Calculate KPI metrics
  const kpiMetrics = [
    {
      name: 'Set Rate',
      value: `${(analytics.set_rate * 100).toFixed(1)}%`,
      description: 'Appointments Set / Total Leads',
      color: 'bg-blue-500',
      change: '+2.3%'
    },
    {
      name: 'Show Rate',
      value: `${(analytics.show_rate * 100).toFixed(1)}%`,
      description: 'Customers Showed / Appointments Set',
      color: 'bg-green-500',
      change: '+1.8%'
    },
    {
      name: 'Close Rate',
      value: `${(analytics.close_rate * 100).toFixed(1)}%`,
      description: 'Deals Closed / Total Leads',
      color: 'bg-purple-500',
      change: '+0.9%'
    },
    {
      name: 'Total Leads',
      value: analytics.total_leads.toString(),
      description: 'Leads received this period',
      color: 'bg-orange-500',
      change: '+12'
    }
  ]

  // Filter analytics based on user role
  const getFilteredAnalytics = () => {
    if (user?.role === 'sales_rep') {
      // SR only sees their own stats
      return {
        ...analytics,
        leads_by_agent: {
          [user.name.toLowerCase()]: analytics.leads_by_agent[user.name.toLowerCase()] || 0
        }
      }
    }
    return analytics
  }

  const filteredAnalytics = getFilteredAnalytics()

  return (
    <ProtectedRoute requiredRoles={['super_admin', 'dealer_admin', 'sales_manager']}>
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNav user={user} />
        
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Track performance and lead conversion metrics</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiMetrics.map((metric) => (
              <div key={metric.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center mr-4`}>
                    <span className="text-white font-bold text-lg">
                      {metric.name === 'Set Rate' ? '📅' : 
                       metric.name === 'Show Rate' ? '👥' : 
                       metric.name === 'Close Rate' ? '💰' : '📊'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-500">{metric.description}</p>
                    <p className="text-sm text-green-600">{metric.change}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leads by Source */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Leads by Source</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(filteredAnalytics.leads_by_source).map(([source, count]) => {
                    const percentage = (count / analytics.total_leads * 100).toFixed(1)
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{source}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                          <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Leads by Agent */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Leads by Agent</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(filteredAnalytics.leads_by_agent).map(([agent, count]) => {
                    const percentage = (count / analytics.total_leads * 100).toFixed(1)
                    return (
                      <div key={agent} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{agent}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                          <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Lead Status Funnel */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Lead Status Funnel</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(filteredAnalytics.leads_by_status).map(([status, count], index) => {
                    const statusLabels: Record<LeadStatus, string> = {
                      'new': 'New Leads',
                      'set': 'Appointments Set',
                      'show': 'Customers Showed',
                      'close': 'Deals Closed'
                    }
                    const statusColors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500']
                    const percentage = (count / analytics.total_leads * 100).toFixed(1)
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 ${statusColors[index]} rounded-full mr-3`}></div>
                          <span className="text-sm font-medium text-gray-900">{statusLabels[status as LeadStatus]}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                          <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Performance Summary</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-bold text-gray-900">23.0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Time to Set</span>
                    <span className="text-sm font-bold text-gray-900">2.3 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Time to Show</span>
                    <span className="text-sm font-bold text-gray-900">3.2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Time to Close</span>
                    <span className="text-sm font-bold text-gray-900">7.8 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue per Lead</span>
                    <span className="text-sm font-bold text-gray-900">$1,247</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific insights */}
          {user?.role === 'sales_rep' && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Your Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {filteredAnalytics.leads_by_agent[user.name.toLowerCase()] || 0}
                  </div>
                  <div className="text-sm text-blue-700">Leads Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">87%</div>
                  <div className="text-sm text-blue-700">Follow-up Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900">4.2</div>
                  <div className="text-sm text-blue-700">Avg. Response Time (hrs)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
