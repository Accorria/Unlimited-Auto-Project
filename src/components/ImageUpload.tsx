'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  existingImages?: string[]
  maxImages?: number
}

export default function ImageUpload({ onImagesChange, existingImages = [], maxImages = 20 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const compressImage = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 2, // Compress to max 2MB
        maxWidthOrHeight: 1920, // Max width or height
        useWebWorker: true,
        fileType: 'image/jpeg',
        quality: 0.8
      }
      
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Image compression failed:', error)
      return file // Return original if compression fails
    }
  }

  const handleFileUpload = async (files: FileList) => {
    // Check if adding these files would exceed the maximum
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images. You currently have ${images.length} images and are trying to add ${files.length} more.`)
      return
    }

    setUploading(true)
    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        continue
      }

      // Compress image if it's too large (instead of rejecting)
      let processedFile = file
      if (file.size > 5 * 1024 * 1024) { // If larger than 5MB
        try {
          processedFile = await compressImage(file)
        } catch (error) {
          console.error('Failed to compress image:', error)
          // Continue with original file if compression fails
        }
      }

      // Convert to base64 for demo purposes
      // In production, you'd upload to a server
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        newImages.push(result)
        
        if (newImages.length === files.length) {
          const updatedImages = [...images, ...newImages]
          setImages(updatedImages)
          onImagesChange(updatedImages)
          setUploading(false)
        }
      }
      reader.readAsDataURL(processedFile)
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
            accept="image/*"
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
            Supports JPG, PNG, WebP. Large images will be automatically compressed.
            {images.length >= maxImages && (
              <span className="block text-red-600 font-medium mt-1">
                Maximum of {maxImages} photos reached. Remove some photos to add more.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`Vehicle image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Main Image Indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    Main Photo
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            <p>• First image will be used as the main photo</p>
            <p>• Drag and drop to reorder images</p>
            <p>• Click the × to remove images</p>
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
            onImagesChange([...images, ...urls])
          }}
        />
        <p className="text-sm text-gray-500 mt-1">
          If you prefer to use external image URLs, paste them here (one per line)
        </p>
      </div>
    </div>
  )
}
