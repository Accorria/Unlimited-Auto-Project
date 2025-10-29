'use client'

import { useState, useRef } from 'react'

interface DocumentUploadProps {
  onDocumentsChange: (documents: DocumentFile[]) => void
  leadId?: string
}

export interface DocumentFile {
  id: string
  type: 'drivers_license' | 'pay_stub_1' | 'pay_stub_2' | 'bank_statement' | 'other'
  file: File
  preview?: string
  uploaded?: boolean
  url?: string
}

const documentTypes = [
  { value: 'drivers_license', label: 'Driver\'s License', required: true },
  { value: 'pay_stub_1', label: 'Pay Stub #1 (Most Recent)', required: true },
  { value: 'pay_stub_2', label: 'Pay Stub #2 (Previous)', required: true },
  { value: 'bank_statement', label: 'Bank Statement (Optional)', required: false },
  { value: 'other', label: 'Other Document', required: false },
]

export default function DocumentUpload({ onDocumentsChange, leadId }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const handleFileSelect = async (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Prevent any form submission or validation triggers
    event.preventDefault()
    event.stopPropagation()

    // Clear any previous errors
    setError(null)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only JPG, PNG, or PDF files')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB. Please compress your image or choose a smaller file.')
      return
    }

    const newDocument: DocumentFile = {
      id: `${type}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as DocumentFile['type'],
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }

    const updatedDocuments = [...documents.filter(doc => doc.type !== type), newDocument]
    setDocuments(updatedDocuments)
    
    // Use setTimeout to prevent immediate state updates that might trigger form validation
    setTimeout(() => {
      onDocumentsChange(updatedDocuments)
    }, 0)
    
    // Clear any previous errors when successfully adding a document
    setError(null)
    setSuccess(null)

    // Auto-upload the document
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      if (leadId) formData.append('leadId', leadId)

      const response = await fetch('/api/upload/document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()
      const uploadedDoc = { ...newDocument, uploaded: true, url: result.url }
      const finalDocuments = updatedDocuments.map(doc => doc.id === newDocument.id ? uploadedDoc : doc)
      setDocuments(finalDocuments)
      onDocumentsChange(finalDocuments)
      
      // Show success message
      const docTypeLabel = documentTypes.find(dt => dt.value === type)?.label || 'Document'
      setSuccess(`${docTypeLabel} uploaded successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id)
    setDocuments(updatedDocuments)
    onDocumentsChange(updatedDocuments)
  }

  const uploadDocuments = async () => {
    if (documents.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = documents.map(async (doc) => {
        const formData = new FormData()
        formData.append('file', doc.file)
        formData.append('type', doc.type)
        if (leadId) formData.append('leadId', leadId)

        const response = await fetch('/api/upload/document', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')

        const result = await response.json()
        return { ...doc, uploaded: true, url: result.url }
      })

      const uploadedDocs = await Promise.all(uploadPromises)
      setDocuments(uploadedDocs)
      onDocumentsChange(uploadedDocs)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload documents. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getDocumentForType = (type: string) => {
    return documents.find(doc => doc.type === type)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
        <p className="text-sm text-gray-600 mb-6">
          Please upload the following documents for your credit application:
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccess(null)}
                className="text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {documentTypes.map((docType) => {
          const existingDoc = getDocumentForType(docType.value)
          
          return (
            <div key={docType.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {docType.label}
                  {docType.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {existingDoc && (
                  <button
                    onClick={() => removeDocument(existingDoc.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              {existingDoc ? (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  {existingDoc.preview ? (
                    <img
                      src={existingDoc.preview}
                      alt={docType.label}
                      className="w-16 h-16 object-cover rounded border mx-auto sm:mx-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center mx-auto sm:mx-0">
                      <span className="text-xs text-gray-500">PDF</span>
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-900 break-all">{existingDoc.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(existingDoc.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {existingDoc.uploaded && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Uploaded
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={(el) => (fileInputRefs.current[docType.value] = el)}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileSelect(docType.value, e)}
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      fileInputRefs.current[docType.value]?.click()
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  >
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Click to upload {docType.label.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, or PDF up to 5MB
                    </p>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>


      <div className="text-xs text-gray-500">
        <p>• All documents are securely stored and encrypted</p>
        <p>• Required documents must be uploaded to complete your application</p>
        <p>• Documents will be reviewed within 24 hours</p>
      </div>
    </div>
  )
}
