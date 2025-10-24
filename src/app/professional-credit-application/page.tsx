'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfessionalCreditApplicationForm from '@/components/ProfessionalCreditApplicationForm'

export default function ProfessionalCreditApplicationPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-8">
        <ProfessionalCreditApplicationForm />
      </div>
      
      <Footer />
    </main>
  )
}
