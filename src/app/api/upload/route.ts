import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const year = formData.get('year') as string
    const make = formData.get('make') as string
    const model = formData.get('model') as string
    
    // Debug: Log received form data
    console.log('Upload request for:', fileName, 'Vehicle:', year, make, model)

    if (!file || !fileName) {
      return NextResponse.json({ error: 'File and fileName are required' }, { status: 400 })
    }

    // Create a unique filename
    const timestamp = Date.now()
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `${timestamp}_${fileName}`
    
    // Upload to Supabase Storage
    const supabase = createServerClient()
    
    // Check if bucket exists first
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json({ 
        error: 'Failed to access storage',
        details: listError.message,
        hint: 'Check if Supabase Storage is properly configured'
      }, { status: 500 })
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'vehicle-images')
    
    if (!bucketExists) {
      console.error('Storage bucket "vehicle-images" does not exist')
      return NextResponse.json({ 
        error: 'Storage bucket not found',
        details: 'The "vehicle-images" bucket does not exist in Supabase Storage',
        hint: 'Please create the "vehicle-images" bucket in your Supabase dashboard: Storage → New Bucket → Name: "vehicle-images" → Make it Public'
      }, { status: 500 })
    }
    
    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      console.error('Error code:', error.statusCode)
      console.error('Error message:', error.message)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload to storage'
      let errorDetails = error.message
      
      if (error.statusCode === '409' || error.message?.includes('already exists')) {
        errorMessage = 'File already exists'
        errorDetails = 'A file with this name already exists in storage'
      } else if (error.statusCode === '413' || error.message?.includes('too large')) {
        errorMessage = 'File too large'
        errorDetails = 'The file exceeds the maximum allowed size'
      } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        errorMessage = 'Storage bucket not found'
        errorDetails = 'The "vehicle-images" bucket does not exist. Please create it in Supabase Storage.'
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'Storage permission denied'
        errorDetails = 'Check storage bucket policies in Supabase dashboard'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorDetails,
        code: error.statusCode || error.code,
        hint: 'Check Supabase Storage settings and bucket policies'
      }, { status: 500 })
    }

    // Get public URL from Supabase Storage
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(uniqueFileName)

    return NextResponse.json({
      success: true,
      publicUrl,
      fileName: uniqueFileName,
      originalName: fileName,
      size: file.size,
      type: file.type,
      vehicle: {
        year: year,
        make: make,
        model: model
      }
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' }, 
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}