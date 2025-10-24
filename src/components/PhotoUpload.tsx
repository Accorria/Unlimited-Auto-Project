'use client'

import { useState, useRef } from 'react'

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void
  vehicleData?: {
    year?: string
    make?: string
    model?: string
  }
}

export default function PhotoUpload({ onPhotosChange, vehicleData }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File, index: number): Promise<string | null> => {
    try {
      setUploadProgress(prev => ({ ...prev, [index]: 25 }))
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', file.name)
      
      // Add vehicle data if available
      if (vehicleData?.year) {
        formData.append('year', vehicleData.year)
      }
      if (vehicleData?.make) {
        formData.append('make', vehicleData.make)
      }
      if (vehicleData?.model) {
        formData.append('model', vehicleData.model)
      }
      
      setUploadProgress(prev => ({ ...prev, [index]: 50 }))
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      setUploadProgress(prev => ({ ...prev, [index]: 75 }))
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const result = await response.json()
      setUploadProgress(prev => ({ ...prev, [index]: 100 }))
      
      return result.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(prev => ({ ...prev, [index]: 0 }))
      return null
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return
    
    // Check if vehicle data is available
    if (!vehicleData?.year || !vehicleData?.make || !vehicleData?.model) {
      alert('Please fill in the vehicle details (Year, Make, Model) before uploading photos.')
      return
    }
    
    setUploading(true)
    const newPhotos: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(prev => ({ ...prev, [i]: 0 }))
      
      const uploadedUrl = await uploadFile(file, i)
      if (uploadedUrl) {
        newPhotos.push(uploadedUrl)
      }
    }
    
    if (newPhotos.length > 0) {
      const updatedPhotos = [...photos, ...newPhotos]
      setPhotos(updatedPhotos)
      onPhotosChange(updatedPhotos)
    }
    
    setUploading(false)
    setUploadProgress({})
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    onPhotosChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="text-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="photo-input"
          disabled={uploading || (!vehicleData?.year || !vehicleData?.make || !vehicleData?.model)}
        />
        <label
          htmlFor="photo-input"
          className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
            uploading || (!vehicleData?.year || !vehicleData?.make || !vehicleData?.model) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? '📤 Uploading...' : '📸 Select Photos'}
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Supports JPG, PNG, WebP, HEIC. Photos will be uploaded to the server.
        </p>
        {(!vehicleData?.year || !vehicleData?.make || !vehicleData?.model) && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Please fill in Year, Make, and Model above before uploading photos.
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            📤 Uploading Photos...
          </h4>
          {Object.entries(uploadProgress).map(([index, progress]) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>Photo {parseInt(index) + 1}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo List with Previews */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Uploaded Photos ({photos.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photoUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={photoUrl}
                    alt={`Vehicle photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log(`Image ${index + 1} failed to load`)
                      // Show a placeholder for broken images
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
                
                {/* Main Photo Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
                
                {/* Photo Number */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">📋 Instructions:</p>
            <p>• <strong>First photo</strong> will be used as the main photo</p>
            <p>• <strong>Click ×</strong> to remove photos</p>
            <p>• Photos are automatically uploaded to the server</p>
          </div>
        </div>
      )}
    </div>
  )
}
