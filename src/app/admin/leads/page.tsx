'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { Lead, LeadStatus } from '@/lib/types'

// Sample leads data - fallback if API fails
const sampleLeads: Lead[] = [
  {
    id: '1',
    dealer_id: 'unlimited-auto',
    vehicle_id: '1',
    assigned_to: 'user-1',
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john@example.com',
    message: 'Interested in the 2021 Trailblazer',
    source: 'website',
    agent: 'mo',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'spring-sale',
    status: 'new',
    consent: true,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    status_updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    dealer_id: 'unlimited-auto',
    vehicle_id: '2',
    assigned_to: 'user-2',
    name: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'sarah@example.com',
    message: 'Looking for financing options',
    source: 'facebook',
    agent: 'fred',
    utm_source: 'facebook',
    utm_medium: 'social',
    utm_campaign: 'financing',
    status: 'set',
    consent: true,
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    status_updated_at: '2024-01-14T16:45:00Z'
  },
  {
    id: '3',
    dealer_id: 'unlimited-auto',
    vehicle_id: '3',
    assigned_to: 'user-1',
    name: 'Mike Davis',
    phone: '(555) 456-7890',
    email: 'mike@example.com',
    message: 'Scheduled test drive for tomorrow',
    source: 'website',
    agent: 'rio',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: '',
    status: 'show',
    consent: true,
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T11:30:00Z',
    status_updated_at: '2024-01-13T11:30:00Z'
  }
]

const statusColors: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  set: 'bg-yellow-100 text-yellow-800',
  show: 'bg-green-100 text-green-800',
  close: 'bg-gray-100 text-gray-800'
}

const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  set: 'Set',
  show: 'Show',
  close: 'Close'
}

export default function LeadsManagement() {
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all')
  const [filterSource, setFilterSource] = useState<string>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Check admin authentication
  useEffect(() => {
    const userData = localStorage.getItem('adminUser')
    const isLoggedIn = localStorage.getItem('adminAuth')
    
    if (isLoggedIn === 'true' && userData) {
      try {
        if (userData.startsWith('{')) {
          setUser(JSON.parse(userData))
        } else {
          setUser({
            id: 1,
            email: 'admin@unlimitedauto.com',
            name: 'Admin User',
            role: 'admin'
          })
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/admin/login')
      }
    } else {
      router.push('/admin/login')
    }
  }, [router])

  // Fetch leads from API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/leads')
        if (response.ok) {
          const data = await response.json()
          setLeads(data.leads || [])
        } else {
          console.error('Failed to fetch leads, using sample data')
          setLeads(sampleLeads)
        }
      } catch (error) {
        console.error('Error fetching leads:', error)
        setLeads(sampleLeads)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, status: newStatus, status_updated_at: new Date().toISOString() }
        : lead
    ))
  }

  const handleAssignLead = (leadId: string, userId: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId 
        ? { ...lead, assigned_to: userId }
        : lead
    ))
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLeads(leads.filter(lead => lead.id !== leadId))
        setSelectedLeads(prev => {
          const newSet = new Set(prev)
          newSet.delete(leadId)
          return newSet
        })
      } else {
        alert('Failed to delete lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Error deleting lead')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select leads to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} leads? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/leads/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Array.from(selectedLeads) })
      })

      if (response.ok) {
        setLeads(leads.filter(lead => !selectedLeads.has(lead.id)))
        setSelectedLeads(new Set())
      } else {
        alert('Failed to delete leads')
      }
    } catch (error) {
      console.error('Error bulk deleting leads:', error)
      alert('Error deleting leads')
    } finally {
      setDeleting(false)
    }
  }

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev)
      if (newSet.has(leadId)) {
        newSet.delete(leadId)
      } else {
        newSet.add(leadId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)))
    }
  }

  // Filter leads based on user role and filters
  const filteredLeads = leads.filter(lead => {
    // Role-based filtering
    if (user?.role === 'sales_rep') {
      // SR can only see their assigned leads
      if (lead.assigned_to !== user.id) return false
    }
    
    // Status filter
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false
    
    // Source filter
    if (filterSource !== 'all' && lead.source !== filterSource) return false
    
    return true
  })

  const canAssignLeads = user?.role === 'super_admin' || user?.role === 'dealer_admin' || user?.role === 'sales_manager'
  const canUpdateStatus = user?.role === 'super_admin' || user?.role === 'dealer_admin' || user?.role === 'sales_manager' || 
    (user?.role === 'sales_rep' && selectedLead?.assigned_to === user.id)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leads...</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
                <p className="text-gray-600">Manage customer leads and track progress</p>
              </div>
              <div className="flex items-center space-x-4">
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
          {/* Filters */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as LeadStatus | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="set">Set</option>
                    <option value="show">Show</option>
                    <option value="close">Close</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="facebook">Facebook</option>
                    <option value="sms">SMS</option>
                    <option value="craigslist">Craigslist</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterStatus('all')
                      setFilterSource('all')
                    }}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.size > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-yellow-800">
                    {selectedLeads.size} lead{selectedLeads.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedLeads(new Set())}
                    className="text-sm text-yellow-600 hover:text-yellow-800 underline"
                  >
                    Clear Selection
                  </button>
                </div>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : `Delete ${selectedLeads.size} Lead${selectedLeads.size !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}

          {/* Leads Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Leads ({filteredLeads.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.phone}</div>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.source}</div>
                        {lead.agent && (
                          <div className="text-sm text-gray-500">Agent: {lead.agent}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.assigned_to ? `User ${lead.assigned_to}` : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                        {canUpdateStatus && (
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="new">New</option>
                            <option value="set">Set</option>
                            <option value="show">Show</option>
                            <option value="close">Close</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lead Detail Modal */}
          {selectedLead && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Basic Contact Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <p className="text-sm text-gray-900">{selectedLead.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-sm text-gray-900">{selectedLead.phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-900">{selectedLead.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Source</label>
                          <p className="text-sm text-gray-900">{selectedLead.source}</p>
                        </div>
                      </div>
                    </div>

                    {/* Credit Application Details */}
                    {selectedLead.notes && (() => {
                      try {
                        const notes = JSON.parse(selectedLead.notes);
                        return (
                          <div className="space-y-4">
                            {/* Applicant Information */}
                            {notes.applicant && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.firstName} {notes.applicant.middleInitial} {notes.applicant.lastName} {notes.applicant.srJr ? `(${notes.applicant.srJr})` : ''}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.dateOfBirth ? new Date(notes.applicant.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.age || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">SSN (Last 4)</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.socialSecurityNumber ? `****-****-${notes.applicant.socialSecurityNumber}` : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Housing Status</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.housingStatus || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Payment</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.monthlyPayment || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">How Long at Address</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.howLongYears || '0'} years, {notes.applicant.howLongMonths || '0'} months</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Employment Information */}
                            {notes.applicant && (
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Employer</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.employerName || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Position</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.positionTitle || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Work Phone</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.workPhone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Employer Address</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.employerAddress || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">How Long Employed</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.employerHowLongYears || '0'} years, {notes.applicant.employerHowLongMonths || '0'} months</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Gross Annual Salary</label>
                                    <p className="text-sm text-gray-900">{notes.applicant.grossAnnualSalary || 'Not provided'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Vehicle Information */}
                            {notes.vehicle && (
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                                    <p className="text-sm text-gray-900">{notes.vehicle.year} {notes.vehicle.make} {notes.vehicle.model}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                                    <p className="text-sm text-gray-900">{notes.vehicle.condition || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">VIN</label>
                                    <p className="text-sm text-gray-900">{notes.vehicle.vin || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Mileage</label>
                                    <p className="text-sm text-gray-900">{notes.vehicle.mileage || 'Not provided'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Financing Information */}
                            {notes.financing && (
                              <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Financing Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Sales Price</label>
                                    <p className="text-sm text-gray-900">{notes.financing.salesPrice || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Down Payment</label>
                                    <p className="text-sm text-gray-900">{notes.financing.downPayment || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Net Trade</label>
                                    <p className="text-sm text-gray-900">{notes.financing.netTrade || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount Financed</label>
                                    <p className="text-sm text-gray-900">{notes.financing.amountFinanced || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Term (Months)</label>
                                    <p className="text-sm text-gray-900">{notes.financing.termMonths || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Program</label>
                                    <p className="text-sm text-gray-900">{notes.financing.program || 'Not provided'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Joint Applicant Information */}
                            {notes.jointApplicant && (
                              <div className="bg-orange-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Joint Applicant Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.firstName} {notes.jointApplicant.middleInitial} {notes.jointApplicant.lastName} {notes.jointApplicant.srJr ? `(${notes.jointApplicant.srJr})` : ''}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.dateOfBirth ? new Date(notes.jointApplicant.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.age || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">SSN (Last 4)</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.socialSecurityNumber ? `****-****-${notes.jointApplicant.socialSecurityNumber}` : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.homePhone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Employer</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.employerName || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Position</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.positionTitle || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Gross Annual Salary</label>
                                    <p className="text-sm text-gray-900">{notes.jointApplicant.grossAnnualSalary || 'Not provided'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Signatures */}
                            {notes.signatures && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Applicant Signature</label>
                                    <p className="text-sm text-gray-900">{notes.signatures.applicantSignatureName || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">Signature Date</label>
                                    <p className="text-sm text-gray-900">{notes.signatures.applicantSignatureDate || 'Not provided'}</p>
                                  </div>
                                  {notes.signatures.jointApplicantSignatureName && (
                                    <>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Joint Applicant Signature</label>
                                        <p className="text-sm text-gray-900">{notes.signatures.jointApplicantSignatureName}</p>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700">Joint Applicant Date</label>
                                        <p className="text-sm text-gray-900">{notes.signatures.jointApplicantSignatureDate || 'Not provided'}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } catch (error) {
                        return (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-red-900 mb-2">Error Parsing Application Data</h4>
                            <p className="text-sm text-red-700">Unable to parse the detailed application information.</p>
                            <details className="mt-2">
                              <summary className="text-sm text-red-600 cursor-pointer">View Raw Data</summary>
                              <pre className="text-xs text-red-500 mt-2 bg-red-100 p-2 rounded overflow-auto">{selectedLead.notes}</pre>
                            </details>
                          </div>
                        );
                      }
                    })()}

                    {/* Basic Lead Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Message</label>
                          <p className="text-sm text-gray-900">{selectedLead.message}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Agent</label>
                          <p className="text-sm text-gray-900">{selectedLead.agent || 'None'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created</label>
                          <p className="text-sm text-gray-900">{new Date(selectedLead.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <p className="text-sm text-gray-900">{selectedLead.status}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedLead.utm_source && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">UTM Tracking</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">UTM Source</label>
                            <p className="text-sm text-gray-900">{selectedLead.utm_source}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">UTM Medium</label>
                            <p className="text-sm text-gray-900">{selectedLead.utm_medium}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">UTM Campaign</label>
                            <p className="text-sm text-gray-900">{selectedLead.utm_campaign}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
