'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TrackingEvent {
  id: string
  event_type: string
  source: string
  vehicle_name?: string
  session_id: string
  created_at: string
  ip_address?: string
}

interface AnalyticsData {
  total_events: number
  phone_clicks: number
  email_clicks: number
  form_submissions: number
  page_views: number
  vehicle_interests: number
  events_by_source: Record<string, number>
  events_by_hour: Record<string, number>
  recent_events: TrackingEvent[]
  top_vehicles: Array<{ vehicle_name: string; count: number }>
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchAnalytics()
    } else {
      router.push('/admin/login')
    }
  }, [router, timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else {
        console.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const eventTypeLabels = {
    'phone_click': '📞 Phone Clicks',
    'email_click': '📧 Email Clicks',
    'form_submit': '📝 Form Submissions',
    'page_view': '👁️ Page Views',
    'vehicle_interest': '🚗 Vehicle Interests'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Funnel Analytics</h1>
              <p className="text-gray-600 mt-2">Track every customer interaction and lead source</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📊</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.total_events}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📞</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Phone Clicks</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.phone_clicks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📧</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Email Clicks</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.email_clicks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📝</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Form Submissions</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.form_submissions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="text-3xl">🚗</div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vehicle Interests</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.vehicle_interests}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Events by Source */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Events by Source</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.events_by_source).map(([source, count]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 capitalize">{source.replace('_', ' ')}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / analytics.total_events) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Vehicles */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Vehicles</h3>
                <div className="space-y-3">
                  {analytics.top_vehicles.slice(0, 5).map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 truncate">{vehicle.vehicle_name}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(vehicle.count / Math.max(...analytics.top_vehicles.map(v => v.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{vehicle.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.recent_events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(event.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {eventTypeLabels[event.event_type as keyof typeof eventTypeLabels] || event.event_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {event.source.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {event.vehicle_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {event.session_id.slice(-8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}