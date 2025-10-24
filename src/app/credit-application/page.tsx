'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CreditApplicationForm from '@/components/CreditApplicationForm'

export default function CreditApplicationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Credit Application
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get pre-approved for your next vehicle with our comprehensive credit application. 
              We work with multiple lenders to find the best rates for your situation.
            </p>
          </div>
          
          <CreditApplicationForm />
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
