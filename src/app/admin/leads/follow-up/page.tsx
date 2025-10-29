'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface IncompleteLead {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  created_at: string
  notes: string
  formStep: string
  fieldsCompleted: string[]
  lastActivity: string
  source: string
}

export default function FollowUpPage() {
  const [leads, setLeads] = useState<IncompleteLead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchIncompleteLeads()
  }, [])

  const fetchIncompleteLeads = async () => {
    try {
      const response = await fetch('/api/leads?status=incomplete')
      const data = await response.json()
      
      if (data.success) {
        setLeads(data.leads)
      } else {
        console.error('Error fetching incomplete leads:', data.error)
      }
    } catch (error) {
      console.error('Error fetching incomplete leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeSinceLastActivity = (lastActivity: string) => {
    const now = new Date()
    const activity = new Date(lastActivity)
    const diffInHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} days ago`
  }

  const getPriorityLevel = (lead: IncompleteLead) => {
    const now = new Date()
    const activity = new Date(lead.lastActivity)
    const diffInHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60))
    
    // High priority: Has contact info and stopped recently
    if ((lead.phone || lead.email) && diffInHours < 2) return 'high'
    
    // Medium priority: Has contact info and stopped within 24 hours
    if ((lead.phone || lead.email) && diffInHours < 24) return 'medium'
    
    // Low priority: Older than 24 hours or no contact info
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormStepLabel = (formStep: string) => {
    switch (formStep) {
      case 'started': return 'Started Form'
      case 'contact_info': return 'Contact Info'
      case 'financial_info': return 'Financial Info'
      case 'vehicle_selection': return 'Vehicle Selection'
      case 'review': return 'Review Step'
      default: return formStep
    }
  }

  const filteredLeads = leads.filter(lead => {
    if (filter === 'high') return getPriorityLevel(lead) === 'high'
    if (filter === 'medium') return getPriorityLevel(lead) === 'medium'
    if (filter === 'low') return getPriorityLevel(lead) === 'low'
    if (filter === 'has_contact') return lead.phone || lead.email
    if (filter === 'no_contact') return !lead.phone && !lead.email
    return true
  })

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id))
    }
  }

  const generateFollowUpMessage = (lead: IncompleteLead) => {
    const name = lead.name || 'there'
    const formType = lead.source.includes('finance') ? 'financing application' : 
                    lead.source.includes('credit') ? 'credit application' : 'inquiry'
    
    return `Hi ${name}! I noticed you started filling out our ${formType} but didn't complete it. I'd love to help you finish the process and get you into the perfect vehicle! Give me a call at (313) 766-4475 or reply to this message.`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Message copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incomplete leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Follow-Up Leads</h1>
              <p className="text-gray-600 mt-2">Incomplete applications that need follow-up</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/leads"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                ← Back to Leads
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'high' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              High Priority ({leads.filter(l => getPriorityLevel(l) === 'high').length})
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Medium Priority ({leads.filter(l => getPriorityLevel(l) === 'medium').length})
            </button>
            <button
              onClick={() => setFilter('has_contact')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'has_contact' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Has Contact Info ({leads.filter(l => l.phone || l.email).length})
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl">📞</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incomplete</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl">🔴</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{leads.filter(l => getPriorityLevel(l) === 'high').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl">📧</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Contact Info</p>
                <p className="text-2xl font-bold text-green-600">{leads.filter(l => l.phone || l.email).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl">⏰</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
                <p className="text-2xl font-bold text-blue-600">{leads.filter(l => {
                  const hours = Math.floor((new Date().getTime() - new Date(l.lastActivity).getTime()) / (1000 * 60 * 60))
                  return hours < 24
                }).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Incomplete Leads</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedLeads.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedLeads.length} selected
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => {
                  const priority = getPriorityLevel(lead)
                  const fieldsCompleted = JSON.parse(lead.notes).fieldsCompleted || []
                  
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name || 'No name provided'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.phone && <div>📞 {lead.phone}</div>}
                            {lead.email && <div>📧 {lead.email}</div>}
                            {!lead.phone && !lead.email && <div className="text-red-500">No contact info</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getFormStepLabel(lead.formStep)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {fieldsCompleted.length} fields completed
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(priority)}`}>
                          {priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getTimeSinceLastActivity(lead.lastActivity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Call
                            </a>
                          )}
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Email
                            </a>
                          )}
                          <button
                            onClick={() => copyToClipboard(generateFollowUpMessage(lead))}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Copy Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incomplete leads found</h3>
            <p className="text-gray-500">Great job! All your leads are completing their applications.</p>
          </div>
        )}
      </div>
    </div>
  )
}
