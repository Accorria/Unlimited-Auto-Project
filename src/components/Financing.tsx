import Link from 'next/link'

export default function Financing() {
  const benefits = [
    { icon: '✅', text: 'Competitive Rates' },
    { icon: '⏱️', text: 'Quick Approval' },
    { icon: '🤝', text: 'All Credit Types' },
    { icon: '💰', text: 'Flexible Terms' },
  ]

  return (
    <section className="py-20 bg-linear-to-br from-blue-800 to-blue-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Flexible Financing Options
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            We work with a variety of lenders to ensure you get the best rates and terms for your next vehicle.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-blue-700/50 p-6 rounded-lg shadow-lg flex items-center space-x-4">
                <div className="text-4xl shrink-0">{benefit.icon}</div>
                <p className="text-lg font-semibold text-left">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financing Partners */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold mb-8">Trusted Financing Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">
              <span className="text-gray-700 font-semibold">Westlake Financial</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">
              <span className="text-gray-700 font-semibold">Credit Acceptance</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">
              <span className="text-gray-700 font-semibold">UACC</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">
              <span className="text-gray-700 font-semibold">Santander</span>
            </div>
          </div>
        </div>

        <div className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">Redford's Easiest Credit Approval!</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We work with ALL credit types - good, bad, or no credit. Get approved in minutes, not days!
              </p>
              
              {/* Document Checklist */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-green-800 mb-3">What You Need:</h4>
                <ul className="space-y-1 text-green-700 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Valid Driver's License
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Proof of Income (2 recent pay stubs)
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Proof of Residence
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Down Payment (varies by credit)
                  </li>
                </ul>
              </div>

              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  No impact on credit score
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Multiple lender options
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Same-day approval available
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  Bad credit? No problem!
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <Link
                href="/credit-application"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Apply for Financing
              </Link>
              <Link
                href="/contact"
                className="block w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-center py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Get Pre-Approved
              </Link>
              <p className="text-sm text-gray-500 text-center">
                Questions? Call us at{' '}
                <a href="tel:+13137664475" className="text-blue-600 hover:underline">
                  (313) 766-4475
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
