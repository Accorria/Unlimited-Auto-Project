'use client'

import { useState } from 'react'
import VehicleUpload from '@/components/VehicleUpload'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function UploadPage() {
  const [uploadedVehicles, setUploadedVehicles] = useState<any[]>([])

  const handleUploadComplete = (vehicles: any[]) => {
    setUploadedVehicles(prev => [...prev, ...vehicles])
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upload Vehicle Photos
            </h1>
            <p className="text-gray-600 mb-6">
              Upload vehicle photos using the standardized naming convention. 
              Files should be named like: <code className="bg-gray-100 px-2 py-1 rounded">2021TB_FDS.jpg</code>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Naming Convention:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Format:</strong> YYYYMODEL_ANGLE.jpg</li>
                <li><strong>Example:</strong> 2021TB_FDS.jpg (2021 Trailblazer, Front Driver Side)</li>
                <li><strong>Angles:</strong> FDS, FPS, SDS, SPS, SRDS, SRPS, RDS, R, F, INT, INTB, ENG, TRK, ODOM, VIN</li>
                <li><strong>Models:</strong> TB (Trailblazer), CV (Civic), CM (Camry), NA (Altima), etc.</li>
              </ul>
            </div>
          </div>

          <VehicleUpload onUploadComplete={handleUploadComplete} />

          {uploadedVehicles.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recently Uploaded ({uploadedVehicles.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedVehicles.map((vehicle, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <div className="text-green-600 text-xl">✅</div>
                      </div>
                      <div>
                        <p className="font-medium text-green-900">
                          {vehicle.parsed?.year} {vehicle.parsed?.make} {vehicle.parsed?.model}
                        </p>
                        <p className="text-sm text-green-700">
                          {vehicle.parsed?.angle} • {vehicle.file.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
