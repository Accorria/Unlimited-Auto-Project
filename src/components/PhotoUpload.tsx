'use client'

import { useState, useRef, useEffect } from 'react'
import imageCompression from 'browser-image-compression'

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Reset photos when component mounts (fresh start for new vehicle)
  useEffect(() => {
    setPhotos([])
    onPhotosChange([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to clear any stale photos

  const uploadFile = async (file: File, index: number): Promise<string | null> => {
    try {
      setUploadProgress(prev => ({ ...prev, [index]: 10 }))
      
      // Compress image to reduce file size
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 2, // Maximum 2MB
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true,
        fileType: 'image/jpeg'
      })
      
      setUploadProgress(prev => ({ ...prev, [index]: 25 }))
      
      const formData = new FormData()
      formData.append('file', compressedFile)
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
      
      let response
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          throw new Error('Upload can only be performed in browser environment')
        }

        // Verify the API route exists by checking if we can reach it
        const apiUrl = '/api/upload'
        
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
        
        try {
          response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            // Don't set Content-Type header - browser will set it with boundary for FormData
          })
        } finally {
          clearTimeout(timeoutId)
        }
      } catch (fetchError: any) {
        // Check for specific error types
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
          throw new Error(`Upload timeout: The request took too long\n💡 Check your internet connection and try again`)
        }
        
        if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          // This usually means the server isn't running or the route doesn't exist
          throw new Error(`Failed to connect to upload server\n💡 Make sure:\n   - The development server is running (npm run dev)\n   - The /api/upload route is accessible\n   - Check browser console for CORS errors`)
        }
        
        if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
          throw new Error(`Network error: Unable to reach the server\n💡 Check:\n   - Is the dev server running? (npm run dev)\n   - Is the server accessible at http://localhost:3000?\n   - Check browser console for detailed error messages`)
        }
        
        throw new Error(`Upload failed: ${fetchError.message || 'Unknown network error'}\n💡 Check your internet connection and make sure the server is running`)
      }
      
      setUploadProgress(prev => ({ ...prev, [index]: 75 }))
      
      if (!response.ok) {
        let errorData
        try {
          const text = await response.text()
          try {
            errorData = JSON.parse(text)
          } catch {
            // If JSON parse fails, use the text as error message
            throw new Error(`Upload failed (${response.status}): ${text || response.statusText}`)
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          throw new Error(`Upload failed: ${response.status} ${response.statusText}\n💡 Server returned an error but couldn't parse the response`)
        }
        
        const errorMessage = errorData.error || 'Upload failed'
        const errorDetails = errorData.details || errorData.message || ''
        const errorHint = errorData.hint || ''
        
        // Create a more informative error message
        let fullErrorMessage = errorMessage
        if (errorDetails && errorDetails !== errorMessage) {
          fullErrorMessage += `\n\n${errorDetails}`
        }
        if (errorHint) {
          fullErrorMessage += `\n\n💡 ${errorHint}`
        }
        
        throw new Error(fullErrorMessage)
      }
      
      const result = await response.json()
      setUploadProgress(prev => ({ ...prev, [index]: 100 }))
      
      return result.publicUrl
    } catch (error: any) {
      // Filter out DOM events (image load errors) - these are not upload errors
      if (error && typeof error === 'object' && error.type === 'error' && error.target) {
        // This is a DOM event, not an upload error - silently ignore
        setUploadProgress(prev => ({ ...prev, [index]: 0 }))
        return null
      }
      
      // Only handle actual Error objects with messages
      if (error instanceof Error || (error?.message && typeof error.message === 'string' && error.message.length > 0)) {
        const errorMessage = error.message || 'Unknown upload error'
        console.error('Upload error:', errorMessage)
        
        // Try to extract more detailed error info if it's a formatted error message
        let displayMessage = errorMessage
        if (errorMessage.includes('💡')) {
          // Error already has helpful hints, use it as-is
          displayMessage = errorMessage
        } else {
          // Add generic troubleshooting tips
          displayMessage = `${errorMessage}\n\n💡 Troubleshooting:\n- Check your internet connection\n- Verify the server is running (npm run dev)\n- Ensure Supabase storage is configured\n- Check browser console for detailed errors`
        }
        
        alert(`Photo upload failed: ${displayMessage}`)
      }
      // Otherwise silently ignore (likely a DOM event or non-error object)
      
      setUploadProgress(prev => ({ ...prev, [index]: 0 }))
      return null
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return
    
    // Check total files limit
    const MAX_PHOTOS_PER_VEHICLE = 20
    const currentPhotoCount = photos.length
    const newFileCount = files.length
    
    if (currentPhotoCount + newFileCount > MAX_PHOTOS_PER_VEHICLE) {
      const remainingSlots = MAX_PHOTOS_PER_VEHICLE - currentPhotoCount
      alert(`⚠️ Photo limit reached!\n\nYou can only add ${remainingSlots} more photo(s). Maximum allowed is ${MAX_PHOTOS_PER_VEHICLE} photos per vehicle.\n\nPlease select fewer photos or remove some existing ones.`)
      return
    }

    // Check file sizes before uploading
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const oversizedFiles: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_FILE_SIZE) {
        const fileSizeMB = (files[i].size / (1024 * 1024)).toFixed(2)
        oversizedFiles.push(`${files[i].name} (${fileSizeMB}MB)`)
      }
    }

    if (oversizedFiles.length > 0) {
      alert(`⚠️ Some files are too large!\n\nMaximum file size is 5MB per photo.\n\nOversized files:\n${oversizedFiles.join('\n')}\n\nPlease compress these images before uploading.`)
      return
    }
    
    setUploading(true)
    const newPhotos: string[] = []
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(prev => ({ ...prev, [i]: 0 }))
        
        try {
          const uploadedUrl = await uploadFile(file, i)
          if (uploadedUrl) {
            newPhotos.push(uploadedUrl)
          }
        } catch (uploadError: any) {
          // Only log actual upload errors, not image load errors
          if (uploadError?.message && !uploadError?.type) {
            console.error(`Upload failed for file ${i + 1}:`, uploadError.message)
          }
          // Continue with other files even if one fails
        }
      }
      
      if (newPhotos.length > 0) {
        const updatedPhotos = [...photos, ...newPhotos]
        setPhotos(updatedPhotos)
        onPhotosChange(updatedPhotos)
      }
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    onPhotosChange(newPhotos)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggedIndex]
    
    // Remove the dragged photo
    newPhotos.splice(draggedIndex, 1)
    
    // Insert it at the new position
    newPhotos.splice(dropIndex, 0, draggedPhoto)
    
    setPhotos(newPhotos)
    onPhotosChange(newPhotos)
    setDraggedIndex(null)
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
          disabled={uploading}
        />
        <label
          htmlFor="photo-input"
          className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? '📤 Uploading...' : '📸 Select Photos'}
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Supports JPG, PNG, WebP, HEIC. Max 5MB per photo, 20 photos per vehicle.
        </p>
        {photos.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {photos.length} / 20 photos uploaded
          </p>
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
          <p className="text-sm text-gray-500">💡 Drag and drop photos to reorder them. The first photo will be used as the main image.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photoUrl, index) => (
              <div 
                key={index} 
                className={`relative group cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <img
                    src={photoUrl}
                    alt={`Vehicle photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Silently handle image load errors - show placeholder
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
                      // Stop event propagation and prevent default to avoid bubbling
                      e.stopPropagation()
                      e.preventDefault()
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
            <p>• Photos are automatically compressed and uploaded</p>
            <p>• <strong>Limit:</strong> {photos.length} / 20 photos (max 5MB each)</p>
            {photos.length >= 18 && (
              <p className="text-orange-600 font-medium mt-2">⚠️ Approaching photo limit!</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
