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
}

export default function IncompleteLeadsPage() {
  const [leads, setLeads] = useState<IncompleteLead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

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

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map(lead => lead.id))
    }
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleBulkAction = async (action: string) => {
    if (selectedLeads.length === 0) return

    try {
      const response = await fetch('/api/leads/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadIds: selectedLeads,
          action: action
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSelectedLeads([])
        fetchIncompleteLeads() // Refresh the list
      } else {
        console.error('Error performing bulk action:', result.error)
      }
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getFormStepColor = (step: string) => {
    switch (step) {
      case 'started': return 'bg-yellow-100 text-yellow-800'
      case 'abandoned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading incomplete leads...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Incomplete Applications</h1>
          <p className="mt-2 text-gray-600">
            Track customers who started but didn't complete their finance applications
          </p>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Incomplete Applications</h3>
            <p className="text-gray-600">All applications have been completed or no one has started the process yet.</p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Select All ({selectedLeads.length}/{leads.length})
                    </span>
                  </label>
                </div>
                
                {selectedLeads.length > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('mark_contacted')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark as Contacted
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fields Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => {
                    const notes = JSON.parse(lead.notes || '{}')
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.name || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.email || 'No email'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.phone || 'No phone'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFormStepColor(notes.formStep || 'unknown')}`}>
                            {notes.formStep || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {notes.fieldsCompleted?.length || 0} fields
                          </div>
                          <div className="text-xs text-gray-500">
                            {notes.fieldsCompleted?.join(', ') || 'None'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(notes.lastActivity || lead.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/leads/${lead.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => {
                                // TODO: Implement contact action
                                console.log('Contact lead:', lead.id)
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Contact
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
