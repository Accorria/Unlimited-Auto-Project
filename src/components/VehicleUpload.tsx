'use client'

import { useState, useCallback, useRef } from 'react'
import { validateFilename, parseFilename, MODEL_MAP, type AngleCode } from '@/lib/vehicleImages'
import imageCompression from 'browser-image-compression'

interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  vehicleId?: string
  publicUrl?: string
  parsed?: {
    year: number
    modelCode: string
    angle: AngleCode
    make?: string
    model?: string
  }
}

interface VehicleUploadProps {
  onUploadComplete?: (vehicles: any[]) => void
  className?: string
}

export default function VehicleUpload({ onUploadComplete, className = '' }: VehicleUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const validateAndParseFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadFile[] = []
    
    for (const file of Array.from(fileList)) {
      // Only allow images
      if (!file.type.startsWith('image/')) {
        newFiles.push({
          file,
          id: Math.random().toString(36),
          status: 'error',
          progress: 0,
          error: 'Only image files are allowed'
        })
        continue
      }

      // Validate filename format
      const validation = validateFilename(file.name)
      if (!validation.valid) {
        newFiles.push({
          file,
          id: Math.random().toString(36),
          status: 'error',
          progress: 0,
          error: validation.error
        })
        continue
      }

      // Parse filename and get vehicle info
      const parsed = parseFilename(file.name)
      const meta = MODEL_MAP[parsed.modelCode] ?? {}
      
      // Compress image if it's too large
      let processedFile = file
      if (file.size > 5 * 1024 * 1024) { // If larger than 5MB
        try {
          processedFile = await compressImage(file)
        } catch (error) {
          console.error('Failed to compress image:', error)
        }
      }
      
      newFiles.push({
        file: processedFile,
        id: Math.random().toString(36),
        status: 'pending',
        progress: 0,
        parsed: {
          ...parsed,
          make: meta.make,
          model: meta.model
        }
      })
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    await validateAndParseFiles(e.dataTransfer.files)
  }, [validateAndParseFiles])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await validateAndParseFiles(e.target.files)
    }
  }, [validateAndParseFiles])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('fileName', uploadFile.file.name)
      
      if (uploadFile.parsed) {
        formData.append('year', uploadFile.parsed.year.toString())
        formData.append('modelCode', uploadFile.parsed.modelCode)
        formData.append('angle', uploadFile.parsed.angle)
        if (uploadFile.parsed.make) formData.append('make', uploadFile.parsed.make)
        if (uploadFile.parsed.model) formData.append('model', uploadFile.parsed.model)
      }

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, progress, status: 'uploading' as const }
              : f
          ))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  status: 'success' as const, 
                  progress: 100,
                  vehicleId: response.vehicleId,
                  publicUrl: response.publicUrl
                }
              : f
          ))
          resolve()
        } else {
          const error = JSON.parse(xhr.responseText).error || 'Upload failed'
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error' as const, error }
              : f
          ))
          reject(new Error(error))
        }
      })

      xhr.addEventListener('error', () => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error' as const, error: 'Network error' }
            : f
        ))
        reject(new Error('Network error'))
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    
    try {
      // Upload files in parallel (but limit to 3 at a time to avoid overwhelming the server)
      const batchSize = 3
      for (let i = 0; i < pendingFiles.length; i += batchSize) {
        const batch = pendingFiles.slice(i, i + batchSize)
        await Promise.all(batch.map(uploadFile))
      }

      // Get successful uploads
      const successfulUploads = files.filter(f => f.status === 'success')
      if (onUploadComplete && successfulUploads.length > 0) {
        onUploadComplete(successfulUploads)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const clearAll = () => {
    setFiles([])
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const successCount = files.filter(f => f.status === 'success').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-6xl text-gray-400">📸</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Vehicle Photos
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your photos here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Files should be named: <code className="bg-gray-100 px-2 py-1 rounded">2021TB_FDS.jpg</code>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Large images will be automatically compressed for faster uploads
            </p>
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Choose Files
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Files ({files.length})
            </h4>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {successCount} success • {errorCount} errors • {pendingCount} pending
              </div>
              {files.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* File Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {file.status === 'success' ? (
                        <div className="text-green-500 text-xl">✅</div>
                      ) : file.status === 'error' ? (
                        <div className="text-red-500 text-xl">❌</div>
                      ) : (
                        <div className="text-gray-500 text-xl">📷</div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.file.name}
                        </p>
                        {file.parsed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {file.parsed.year} {file.parsed.make} {file.parsed.model} - {file.parsed.angle}
                          </span>
                        )}
                      </div>
                      
                      {file.error && (
                        <p className="text-sm text-red-600 mt-1">{file.error}</p>
                      )}
                      
                      {file.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{file.progress}% uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {pendingCount > 0 && (
            <div className="flex justify-center pt-4">
              <button
                onClick={uploadAllFiles}
                disabled={isUploading}
                className={`
                  px-8 py-3 rounded-lg font-semibold transition-colors
                  ${isUploading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }
                `}
              >
                {isUploading ? 'Uploading...' : `Upload ${pendingCount} Files`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
