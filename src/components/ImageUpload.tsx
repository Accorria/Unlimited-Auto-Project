'use client'

import { useState, useEffect } from 'react'

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [currentFile, setCurrentFile] = useState<string>('')

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image && image.startsWith('blob:')) {
          URL.revokeObjectURL(image)
        }
      })
    }
  }, [])

  // Image compression function
  const compressImage = (file: File, maxSizeMB: number = 1, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const maxDimension = 1200 // Max width or height
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = URL.createObjectURL(file)
    })
  }

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      console.log('Starting HEIC conversion for:', file.name, 'Size:', file.size)
      
      // Dynamic import of heic2any to avoid SSR issues
      const heic2any = (await import('heic2any')).default
      
      // Convert HEIC to JPEG
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8 // Slightly lower quality for better compatibility
      }) as Blob
      
      console.log('HEIC conversion successful. New blob size:', convertedBlob.size)
      
      // Create new file with JPEG extension
      const newFileName = file.name.replace(/\.(heic|heif)$/i, '.jpg')
      const jpegFile = new File([convertedBlob], newFileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      })
      
      console.log('Created JPEG file:', jpegFile.name, 'Size:', jpegFile.size, 'Type:', jpegFile.type)
      
      return jpegFile
    } catch (error) {
      console.error('HEIC conversion failed:', error)
      throw new Error('Failed to convert HEIC file. Please try converting to JPEG manually.')
    }
  }

  const handleFileUpload = async (files: FileList) => {
    console.log('🚀 Starting NEW upload process with', files.length, 'files')
    
    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images. You currently have ${images.length} images and are trying to add ${files.length} more.`)
      return
    }

    setUploading(true)
    const newImages: string[] = []
    const totalFiles = files.length
    
    console.log('📁 Processing', totalFiles, 'files...')

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileSizeMB = Math.round(file.size / 1024 / 1024 * 100) / 100
      console.log(`📸 Processing file ${i + 1}/${files.length}: ${file.name} (${fileSizeMB}MB)`)
      setCurrentFile(file.name)
      
      // Update progress
      setUploadProgress(prev => ({ ...prev, [i]: 0 }))
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
      const isValidImage = validTypes.includes(file.type.toLowerCase()) || 
                          file.name.toLowerCase().endsWith('.heic') || 
                          file.name.toLowerCase().endsWith('.heif')
      
      if (!isValidImage) {
        console.error('❌ Invalid file type:', file.name, file.type)
        alert(`${file.name} is not a supported image file. Please use JPEG, PNG, WebP, or HEIC files.`)
        setUploadProgress(prev => ({ ...prev, [i]: 0 }))
        continue
      }

      try {
        let processedFile = file
        
        // Step 1: Convert HEIC if needed (25% progress)
        if (file.type.toLowerCase() === 'image/heic' || 
            file.type.toLowerCase() === 'image/heif' || 
            file.name.toLowerCase().endsWith('.heic') || 
            file.name.toLowerCase().endsWith('.heif')) {
          
          console.log('🔄 Converting HEIC to JPEG...')
          setUploadProgress(prev => ({ ...prev, [i]: 25 }))
          
          processedFile = await convertHeicToJpeg(file)
          console.log('✅ HEIC conversion complete')
        }
        
        // Step 2: Compress if file is large (50% progress)
        if (processedFile.size > 1024 * 1024) { // 1MB
          console.log(`🗜️ Compressing large file: ${processedFile.name} (${Math.round(processedFile.size / 1024 / 1024)}MB)`)
          setUploadProgress(prev => ({ ...prev, [i]: 50 }))
          
          try {
            const compressedFile = await compressImage(processedFile, 1, 0.7)
            const originalSize = Math.round(processedFile.size / 1024 / 1024 * 100) / 100
            const compressedSize = Math.round(compressedFile.size / 1024 / 1024 * 100) / 100
            console.log(`✅ Compressed ${processedFile.name}: ${originalSize}MB → ${compressedSize}MB`)
            processedFile = compressedFile
          } catch (compressionError) {
            console.warn('⚠️ Compression failed, using original file:', compressionError)
          }
        }
        
        // Step 3: Create object URL (75% progress)
        setUploadProgress(prev => ({ ...prev, [i]: 75 }))
        const objectUrl = URL.createObjectURL(processedFile)
        newImages.push(objectUrl)
        console.log(`✅ Successfully processed image ${i + 1}: ${processedFile.name}`)
        
        // Step 4: Complete (100% progress)
        setUploadProgress(prev => ({ ...prev, [i]: 100 }))
        
      } catch (error) {
        console.error('❌ Error processing image:', error)
        setUploadProgress(prev => ({ ...prev, [i]: 0 }))
        
        if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
          alert(`Failed to convert ${file.name} from HEIC format. Please try:\n1. Converting to JPEG on your phone first\n2. Using a different image\n3. Taking a new photo in JPEG format`)
        } else {
          alert(`Failed to process ${file.name}. Please try a different image file.`)
        }
      }
    }
    
    // Final step: Update images state
    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      console.log('🎉 All files processed successfully!')
    }
    
    setUploading(false)
    setUploadProgress({})
    setCurrentFile('')
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    // Clean up object URL if it exists
    const imageToRemove = images[index]
    if (imageToRemove && imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove)
    }
    
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

  // Drag and drop reordering
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
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
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
        onDrop={handleFileDrop}
        onDragOver={handleFileDragOver}
        onDragLeave={handleFileDragLeave}
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
            Supports JPG, PNG, WebP, HEIC (iPhone photos). Large files are automatically compressed for faster uploads.
            {images.length >= maxImages && (
              <span className="block text-red-600 font-medium mt-1">
                Maximum of {maxImages} photos reached. Remove some photos to add more.
              </span>
            )}
          </p>
          <p className="text-xs text-green-600 mt-2">
            🚀 NEW: Large files (1MB+) are automatically compressed to prevent upload hangs!
          </p>
          {images.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                🔍 Debug: {images.length} images uploaded. Check browser console for details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            📸 Processing Images...
            {currentFile && (
              <span className="text-xs text-blue-600 block mt-1">
                Currently processing: {currentFile}
              </span>
            )}
          </h4>
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
              {progress === 25 && (
                <div className="text-xs text-blue-600 mt-1">Converting HEIC...</div>
              )}
              {progress === 50 && (
                <div className="text-xs text-blue-600 mt-1">Compressing large file...</div>
              )}
              {progress === 75 && (
                <div className="text-xs text-blue-600 mt-1">Creating preview...</div>
              )}
              {progress === 100 && (
                <div className="text-xs text-green-600 mt-1">✅ Complete!</div>
              )}
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
              <div 
                key={index} 
                className={`relative group cursor-move transition-all duration-200 ${
                  draggedIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-blue-400 transition-colors">
                  <img
                    src={image}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                    onLoad={() => {
                      console.log(`Image ${index + 1} loaded successfully`)
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      console.warn(`Image ${index + 1} failed to display. This is usually a browser limitation with large images.`)
                      
                      // Show a placeholder that indicates the image is there but can't be displayed
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFVwbG9hZGVkPC90ZXh0Pjwvc3ZnPg=='
                    }}
                    style={{
                      backgroundColor: '#f3f4f6',
                      minHeight: '100%',
                      minWidth: '100%'
                    }}
                  />
                </div>
                
                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveImage(index, index - 1)
                        }}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 shadow-lg"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveImage(index, index + 1)
                        }}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 shadow-lg"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
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

                {/* Drag Handle */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ⋮⋮ Drag
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">📋 Instructions:</p>
            <p>• <strong>First image</strong> will be used as the main photo</p>
            <p>• <strong>Drag and drop</strong> images to reorder them</p>
            <p>• <strong>Click ×</strong> to remove images</p>
            <p>• <strong>Use arrow buttons</strong> for precise positioning</p>
            <p>• <strong>Hover over images</strong> to see controls</p>
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