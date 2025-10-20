'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoleBasedNav from '@/components/RoleBasedNav'
import { Dealer } from '@/lib/types'

// Sample dealers data - in production, this would come from Supabase
const sampleDealers: Dealer[] = [
  {
    id: 'dealer-1',
    slug: 'unlimited-auto',
    name: 'Unlimited Auto',
    address: '24645 Plymouth Rd, Redford, MI 48239',
    phone: '(313) 766-4475',
    email: 'info@unlimitedauto.com',
    website: 'https://unlimitedauto.com',
    hours: {
      monday: '9AM-7PM',
      tuesday: '9AM-7PM',
      wednesday: '9AM-7PM',
      thursday: '9AM-7PM',
      friday: '9AM-7PM',
      saturday: '9AM-6PM',
      sunday: '12PM-5PM'
    },
    social_media: {
      facebook: 'https://facebook.com/unlimitedauto',
      instagram: '',
      twitter: '',
      google: ''
    },
    seo_settings: {
      metaTitle: 'Unlimited Auto - Redford\'s Easiest Credit Approval',
      metaDescription: 'Quality used cars with guaranteed financing. Bad credit? No credit? No problem! Drive home today.',
      keywords: 'used cars, auto financing, bad credit, Redford, Michigan'
    },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'dealer-2',
    slug: 'metro-auto',
    name: 'Metro Auto Sales',
    address: '123 Main St, Detroit, MI 48201',
    phone: '(313) 555-0123',
    email: 'info@metroauto.com',
    website: 'https://metroauto.com',
    hours: {
      monday: '8AM-8PM',
      tuesday: '8AM-8PM',
      wednesday: '8AM-8PM',
      thursday: '8AM-8PM',
      friday: '8AM-8PM',
      saturday: '9AM-7PM',
      sunday: '10AM-6PM'
    },
    social_media: {
      facebook: 'https://facebook.com/metroauto',
      instagram: 'https://instagram.com/metroauto',
      twitter: '',
      google: ''
    },
    seo_settings: {
      metaTitle: 'Metro Auto Sales - Detroit\'s Premier Used Car Dealer',
      metaDescription: 'Best selection of used cars in Detroit. Competitive prices and financing available.',
      keywords: 'used cars, Detroit, auto sales, financing'
    },
    is_active: false,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
]

export default function DealersManagement() {
  const { user, signOut } = useAuth()
  const [dealers, setDealers] = useState<Dealer[]>(sampleDealers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)
  const [dealerForm, setDealerForm] = useState({
    slug: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    is_active: true
  })

  const handleLogout = async () => {
    await signOut()
  }

  const handleCreateDealer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newDealer: Dealer = {
      id: `dealer-${Date.now()}`,
      slug: dealerForm.slug,
      name: dealerForm.name,
      address: dealerForm.address,
      phone: dealerForm.phone,
      email: dealerForm.email,
      website: dealerForm.website,
      hours: {},
      social_media: {},
      seo_settings: {},
      is_active: dealerForm.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setDealers([...dealers, newDealer])
    setShowCreateModal(false)
    setDealerForm({ slug: '', name: '', address: '', phone: '', email: '', website: '', is_active: true })
  }

  const handleEditDealer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDealer) return
    
    const updatedDealer = {
      ...selectedDealer,
      ...dealerForm,
      updated_at: new Date().toISOString()
    }
    
    setDealers(dealers.map(d => d.id === selectedDealer.id ? updatedDealer : d))
    setShowEditModal(false)
    setSelectedDealer(null)
  }

  const handleToggleActive = (dealerId: string) => {
    setDealers(dealers.map(d => 
      d.id === dealerId ? { ...d, is_active: !d.is_active, updated_at: new Date().toISOString() } : d
    ))
  }

  const handleDeleteDealer = (dealerId: string) => {
    if (confirm('Are you sure you want to delete this dealer? This action cannot be undone.')) {
      setDealers(dealers.filter(d => d.id !== dealerId))
    }
  }

  const openEditModal = (dealer: Dealer) => {
    setSelectedDealer(dealer)
    setDealerForm({
      slug: dealer.slug,
      name: dealer.name,
      address: dealer.address || '',
      phone: dealer.phone || '',
      email: dealer.email || '',
      website: dealer.website || '',
      is_active: dealer.is_active
    })
    setShowEditModal(true)
  }

  return (
    <ProtectedRoute requiredRoles={['super_admin']}>
      <div className="min-h-screen bg-gray-50">
        <RoleBasedNav user={user} />
        
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dealers Management</h1>
                <p className="text-gray-600">Manage all dealerships on the platform</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Dealer
                </button>
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
          {/* Dealers Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Dealers ({dealers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {dealers.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                          <div className="text-sm text-gray-500">/{dealer.slug}</div>
                          {dealer.website && (
                            <div className="text-sm text-blue-600">
                              <a href={dealer.website} target="_blank" rel="noopener noreferrer">
                                {dealer.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {dealer.address && (
                            <div className="text-sm text-gray-900">{dealer.address}</div>
                          )}
                          {dealer.phone && (
                            <div className="text-sm text-gray-500">{dealer.phone}</div>
                          )}
                          {dealer.email && (
                            <div className="text-sm text-gray-500">{dealer.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          dealer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {dealer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dealer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(dealer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(dealer.id)}
                          className={`${
                            dealer.is_active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {dealer.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteDealer(dealer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create Dealer Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Dealer</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateDealer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.slug}
                        onChange={(e) => setDealerForm({ ...dealerForm, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="dealer-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.name}
                        onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Dealer Name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={dealerForm.address}
                      onChange={(e) => setDealerForm({ ...dealerForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={dealerForm.phone}
                        onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={dealerForm.email}
                        onChange={(e) => setDealerForm({ ...dealerForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="info@dealer.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={dealerForm.website}
                      onChange={(e) => setDealerForm({ ...dealerForm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://dealer.com"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={dealerForm.is_active}
                      onChange={(e) => setDealerForm({ ...dealerForm, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active (license enabled)
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create Dealer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Dealer Modal */}
        {showEditModal && selectedDealer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Dealer</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleEditDealer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.slug}
                        onChange={(e) => setDealerForm({ ...dealerForm, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={dealerForm.name}
                        onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={dealerForm.address}
                      onChange={(e) => setDealerForm({ ...dealerForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={dealerForm.phone}
                        onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={dealerForm.email}
                        onChange={(e) => setDealerForm({ ...dealerForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={dealerForm.website}
                      onChange={(e) => setDealerForm({ ...dealerForm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edit_is_active"
                      checked={dealerForm.is_active}
                      onChange={(e) => setDealerForm({ ...dealerForm, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit_is_active" className="ml-2 block text-sm text-gray-900">
                      Active (license enabled)
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Update Dealer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
