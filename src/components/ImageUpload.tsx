'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  existingImages?: string[]
  maxImages?: number
}

export default function ImageUpload({ onImagesChange, existingImages = [], maxImages = 20 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width/height)
        const maxSize = 1920
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', 0.8)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const convertHeicToJpeg = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw the image on canvas
        ctx?.drawImage(img, 0, 0)
        
        // Convert to JPEG blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with JPEG extension
            const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
            const jpegFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(jpegFile)
          } else {
            reject(new Error('Failed to convert HEIC to JPEG'))
          }
        }, 'image/jpeg', 0.9) // High quality JPEG
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load HEIC image'))
      }
      
      // Try to load the HEIC file
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (files: FileList) => {
    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images. You currently have ${images.length} images and are trying to add ${files.length} more.`)
      return
    }

    setUploading(true)
    const newImages: string[] = []
    const totalFiles = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type - accept HEIC files from iPhone
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      const isValidImage = validTypes.includes(file.type.toLowerCase()) || 
                          file.name.toLowerCase().endsWith('.heic') || 
                          file.name.toLowerCase().endsWith('.heif')
      
      if (!isValidImage) {
        alert(`${file.name} is not a supported image file. Please use JPEG, PNG, WebP, or HEIC files.`)
        continue
      }

      // Update progress
      setUploadProgress(prev => ({ ...prev, [i]: 0 }))

      try {
        // Always convert HEIC files to JPEG
        let processedFile = file
        if (file.type.toLowerCase() === 'image/heic' || 
            file.type.toLowerCase() === 'image/heif' || 
            file.name.toLowerCase().endsWith('.heic') || 
            file.name.toLowerCase().endsWith('.heif')) {
          
          // Convert HEIC to JPEG
          processedFile = await convertHeicToJpeg(file)
        } else if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
          // Compress other image types if too large
          processedFile = await compressImage(file)
        }

        // Update progress
        setUploadProgress(prev => ({ ...prev, [i]: 50 }))

        // Convert to base64
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          newImages.push(result)
          
          // Update progress
          setUploadProgress(prev => ({ ...prev, [i]: 100 }))
          
          // Check if all files are processed
          if (newImages.length === totalFiles) {
            const updatedImages = [...images, ...newImages]
            setImages(updatedImages)
            onImagesChange(updatedImages)
            setUploading(false)
            setUploadProgress({})
          }
        }
        reader.readAsDataURL(processedFile)
      } catch (error) {
        console.error('Error processing image:', error)
        alert(`Failed to process ${file.name}. Please try converting it to JPEG format first.`)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images]
    const [movedImage] = updatedImages.splice(fromIndex, 1)
    updatedImages.splice(toIndex, 0, movedImage)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading images...' : 'Upload Vehicle Photos'}
            </p>
            <p className="text-gray-600">
              Drag and drop images here, or click to select files
            </p>
            <p className="text-sm text-blue-600 font-medium mt-2">
              {images.length} / {maxImages} photos uploaded
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*,.heic,.heif"
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors ${
              uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : images.length >= maxImages ? 'Maximum Reached' : 'Choose Files'}
          </label>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, WebP, HEIC (iPhone photos). Large images will be automatically compressed and HEIC files will be converted to JPEG.
            {images.length >= maxImages && (
              <span className="block text-red-600 font-medium mt-1">
                Maximum of {maxImages} photos reached. Remove some photos to add more.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Upload Progress</h4>
          {Object.entries(uploadProgress).map(([index, progress]) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>Image {parseInt(index) + 1}</span>
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

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                  <img
                    src={image}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                </div>
                
                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 shadow-lg"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 shadow-lg"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Main Image Indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg">
                    Main Photo
                  </div>
                )}

                {/* Image Number */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">📋 Instructions:</p>
            <p>• First image will be used as the main photo</p>
            <p>• Drag and drop to reorder images</p>
            <p>• Click the × to remove images</p>
            <p>• Use arrow buttons to move images left/right</p>
          </div>
        </div>
      )}

      {/* Alternative: URL Input */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Alternative: Add Image URLs
        </h3>
        <textarea
          placeholder="Enter image URLs, one per line..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          onChange={(e) => {
            const urls = e.target.value.split('\n').filter(url => url.trim())
            if (urls.length > 0) {
              const updatedImages = [...images, ...urls]
              setImages(updatedImages)
              onImagesChange(updatedImages)
              e.target.value = '' // Clear the textarea
            }
          }}
        />
        <p className="text-sm text-gray-500 mt-1">
          If you prefer to use external image URLs, paste them here (one per line)
        </p>
      </div>
    </div>
  )
}