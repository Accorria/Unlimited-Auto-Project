'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FinancingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    employment: '',
    income: '',
    downPayment: '',
    creditScore: '',
    vehicleInterest: ''
  })

  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorData, setCalculatorData] = useState({
    vehiclePrice: 20000,
    downPayment: 2000,
    tradeValue: 0,
    loanTerm: 60,
    interestRate: 6.9
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCalculatorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCalculatorData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/financing/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setSubmitMessage(result.message || 'Application submitted successfully!')
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          employment: '',
          income: '',
          downPayment: '',
          creditScore: '',
          vehicleInterest: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Failed to submit application. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculatePayment = () => {
    const principal = calculatorData.vehiclePrice - calculatorData.downPayment - calculatorData.tradeValue
    const monthlyRate = calculatorData.interestRate / 100 / 12
    const numPayments = calculatorData.loanTerm
    
    if (monthlyRate === 0) {
      return principal / numPayments
    }
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                   (Math.pow(1 + monthlyRate, numPayments) - 1)
    
    return payment
  }

  const monthlyPayment = calculatePayment()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Fastest Financial Improvement in Redford</h1>
            <p className="text-xl text-blue-100 mb-4 max-w-3xl mx-auto">
              Redford's easiest credit approval! We work with ALL credit types - good, bad, or no credit. Get approved in minutes, not days!
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto">
              Just bring your Photo ID and we'll help you get behind the wheel today!
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">All Credit Types</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">Same-Day Approval</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">No Hidden Fees</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="font-semibold text-sm">Competitive Rates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing Partners */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Trusted Financing Partners</h2>
            <p className="text-xl text-gray-600">We work with multiple lenders to get you the best rates</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-800">Westlake Financial</h3>
              <p className="text-sm text-gray-600 mt-2">Prime & Subprime</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-800">Credit Acceptance</h3>
              <p className="text-sm text-gray-600 mt-2">All Credit Types</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-800">UACC</h3>
              <p className="text-sm text-gray-600 mt-2">Flexible Terms</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-800">Santander</h3>
              <p className="text-sm text-gray-600 mt-2">Competitive Rates</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Pre-Approved Today!</h2>
            <p className="text-gray-600 mb-4">
              Fill out this quick form and we'll get back to you within minutes with your pre-approval status.
            </p>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Need a comprehensive credit application?</strong> For detailed financing with multiple lenders, use our full credit application form.
              </p>
              <Link
                href="/credit-application"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Complete Credit Application →
              </Link>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  >
                    <option value="">Select State</option>
                    <option value="MI">Michigan</option>
                    <option value="OH">Ohio</option>
                    <option value="IN">Indiana</option>
                    <option value="IL">Illinois</option>
                    <option value="WI">Wisconsin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Status *</label>
                  <select
                    name="employment"
                    value={formData.employment}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  >
                    <option value="">Select Status</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income *</label>
                  <select
                    name="income"
                    value={formData.income}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  >
                    <option value="">Select Monthly Income</option>
                    <option value="1000">$1,000</option>
                    <option value="1500">$1,500</option>
                    <option value="2000">$2,000</option>
                    <option value="2500">$2,500</option>
                    <option value="3000">$3,000</option>
                    <option value="3500">$3,500</option>
                    <option value="4000">$4,000</option>
                    <option value="4500">$4,500</option>
                    <option value="5000">$5,000</option>
                    <option value="6000">$6,000</option>
                    <option value="7000">$7,000</option>
                    <option value="8000">$8,000</option>
                    <option value="9000">$9,000</option>
                    <option value="10000">$10,000+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
                  <select
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  >
                    <option value="">Select Down Payment</option>
                    <option value="1000">$1,000</option>
                    <option value="1500">$1,500</option>
                    <option value="2000">$2,000</option>
                    <option value="2500">$2,500</option>
                    <option value="3000">$3,000</option>
                    <option value="3500">$3,500</option>
                    <option value="4000">$4,000</option>
                    <option value="4500">$4,500</option>
                    <option value="5000">$5,000</option>
                    <option value="6000">$6,000</option>
                    <option value="7000">$7,000</option>
                    <option value="8000">$8,000</option>
                    <option value="9000">$9,000</option>
                    <option value="10000">$10,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credit Score (Optional)</label>
                  <select
                    name="creditScore"
                    value={formData.creditScore}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  >
                    <option value="">Select Range</option>
                    <option value="excellent">750+ (Excellent)</option>
                    <option value="good">700-749 (Good)</option>
                    <option value="fair">650-699 (Fair)</option>
                    <option value="poor">600-649 (Poor)</option>
                    <option value="very-poor">Below 600 (Very Poor)</option>
                    <option value="no-credit">No Credit History</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle of Interest</label>
                <select
                  name="vehicleInterest"
                  value={formData.vehicleInterest}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Vehicle</option>
                  <option value="2021 Subaru Impreza Sport">2021 Subaru Impreza Sport</option>
                  <option value="2020 Subaru Outback Limited">2020 Subaru Outback Limited</option>
                  <option value="2019 Lexus ES 350">2019 Lexus ES 350</option>
                  <option value="2020 Lincoln Navigator">2020 Lincoln Navigator</option>
                  <option value="2021 Chevrolet Silverado 1500">2021 Chevrolet Silverado 1500</option>
                  <option value="2019 Infiniti Q50">2019 Infiniti Q50</option>
                  <option value="2020 Chevrolet Camaro SS">2020 Chevrolet Camaro SS</option>
                  <option value="2018 Audi A4">2018 Audi A4</option>
                  <option value="2021 Hyundai Elantra">2021 Hyundai Elantra</option>
                  <option value="2019 Volkswagen Jetta">2019 Volkswagen Jetta</option>
                  <option value="2020 Mazda CX-5">2020 Mazda CX-5</option>
                  <option value="2017 Audi A6">2017 Audi A6</option>
                  <option value="2021 Honda Civic">2021 Honda Civic</option>
                  <option value="2019 Kia Optima">2019 Kia Optima</option>
                  <option value="2018 Infiniti QX60">2018 Infiniti QX60</option>
                  <option value="2020 Jeep Grand Cherokee">2020 Jeep Grand Cherokee</option>
                  <option value="2019 Ram 1500">2019 Ram 1500</option>
                  <option value="2021 Chevrolet Equinox">2021 Chevrolet Equinox</option>
                  <option value="2020 Chevrolet Malibu">2020 Chevrolet Malibu</option>
                  <option value="Other">Other (Specify in Comments)</option>
                </select>
              </div>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Success!</p>
                  <p>{submitMessage}</p>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">Error</p>
                  <p>{submitMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>

          {/* Benefits & Calculator */}
          <div className="space-y-8">
            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Financing?</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">All Credit Types Welcome</h3>
                    <p className="text-gray-600 text-sm">Good, bad, or no credit - we have options for everyone</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Quick Approval Process</h3>
                    <p className="text-gray-600 text-sm">Get approved in minutes, not days</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Competitive Interest Rates</h3>
                    <p className="text-gray-600 text-sm">We shop multiple lenders to get you the best rate</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Flexible Terms</h3>
                    <p className="text-gray-600 text-sm">Choose from 36 to 84 month terms</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">No Hidden Fees</h3>
                    <p className="text-gray-600 text-sm">Transparent pricing with no surprises</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Calculator */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Calculator</h2>
                <button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {showCalculator ? 'Hide' : 'Show'} Calculator
                </button>
              </div>
              
              {showCalculator && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Price</label>
                    <input
                      type="number"
                      name="vehiclePrice"
                      value={calculatorData.vehiclePrice}
                      onChange={handleCalculatorChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
                      <input
                        type="number"
                        name="downPayment"
                        value={calculatorData.downPayment}
                        onChange={handleCalculatorChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trade-In Value</label>
                      <input
                        type="number"
                        name="tradeValue"
                        value={calculatorData.tradeValue}
                        onChange={handleCalculatorChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (months)</label>
                      <select
                        name="loanTerm"
                        value={calculatorData.loanTerm}
                        onChange={handleCalculatorChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      >
                        <option value="36">36 months</option>
                        <option value="48">48 months</option>
                        <option value="60">60 months</option>
                        <option value="72">72 months</option>
                        <option value="84">84 months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                      <input
                        type="number"
                        name="interestRate"
                        value={calculatorData.interestRate}
                        onChange={handleCalculatorChange}
                        step="0.1"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-center">
                      <p className="text-gray-600 mb-2">Estimated Monthly Payment</p>
                      <p className="text-3xl font-bold text-blue-600">${monthlyPayment.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 mt-2">*Actual payment may vary based on credit approval</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Need</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">✓</div>
                  <span className="text-gray-700">Valid Driver's License</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">✓</div>
                  <span className="text-gray-700">Proof of Income (2 recent pay stubs)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">✓</div>
                  <span className="text-gray-700">Proof of Residence (utility bill, lease, etc.)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">✓</div>
                  <span className="text-gray-700">Down Payment (varies by credit)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">✓</div>
                  <span className="text-gray-700">Insurance Information</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Drive Home Today?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Don't let credit concerns stop you from getting the car you want. We make it easy!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inventory"
              className="bg-white text-blue-800 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Browse Inventory
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white hover:text-blue-800 transition-colors"
            >
              Call Now: (313) 766-4475
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
