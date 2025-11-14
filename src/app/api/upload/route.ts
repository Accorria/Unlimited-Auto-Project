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
    
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('Supabase not configured - missing NEXT_PUBLIC_SUPABASE_URL')
      return NextResponse.json({ 
        error: 'Storage not configured',
        details: 'NEXT_PUBLIC_SUPABASE_URL environment variable is missing',
        hint: 'Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables'
      }, { status: 500 })
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE) {
      console.warn('SUPABASE_SERVICE_ROLE not set - using regular client (may have permission issues)')
    }
    
    // Check if bucket exists first
    let buckets, listError
    try {
      const bucketResult = await supabase.storage.listBuckets()
      buckets = bucketResult.data
      listError = bucketResult.error
    } catch (storageError: any) {
      console.error('Error accessing Supabase storage:', storageError)
      return NextResponse.json({ 
        error: 'Failed to access storage',
        details: storageError.message || 'Unable to connect to Supabase storage',
        hint: 'Check if Supabase Storage is enabled and accessible. Verify your Supabase URL and keys are correct.'
      }, { status: 500 })
    }
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return NextResponse.json({ 
        error: 'Failed to access storage',
        details: listError.message || 'Unable to list storage buckets',
        hint: 'Check if Supabase Storage is properly configured and the storage bucket exists'
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
    
    // Attempt upload with better error handling
    let uploadResult
    try {
      uploadResult = await supabase.storage
        .from('vehicle-images')
        .upload(uniqueFileName, file, {
          cacheControl: '3600',
          upsert: false
        })
    } catch (uploadException: any) {
      console.error('Exception during Supabase upload:', uploadException)
      console.error('Exception type:', uploadException?.name)
      console.error('Exception message:', uploadException?.message)
      console.error('Exception stack:', uploadException?.stack)
      
      // Check if it's a fetch/network error
      if (uploadException?.message?.includes('fetch') || 
          uploadException?.name === 'TypeError' ||
          uploadException?.message?.includes('Failed to fetch') ||
          uploadException?.message?.includes('NetworkError')) {
        return NextResponse.json({ 
          error: 'Failed to connect to Supabase storage',
          details: 'Unable to reach Supabase storage service. This could be due to network issues, incorrect Supabase URL, or storage service being unavailable.',
          hint: 'Check:\n- NEXT_PUBLIC_SUPABASE_URL is correct\n- SUPABASE_SERVICE_ROLE is set\n- Your internet connection\n- Supabase service status'
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: 'Upload failed',
        details: uploadException?.message || 'Unknown error during upload',
        hint: 'Check server logs for more details'
      }, { status: 500 })
    }

    const { data, error } = uploadResult

    if (error) {
      console.error('Supabase upload error:', error)
      console.error('Error code:', error.statusCode)
      console.error('Error message:', error.message)
      console.error('Error name:', error.name)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload to storage'
      let errorDetails = error.message
      let errorHint = 'Check Supabase Storage settings and bucket policies'
      
      if (error.statusCode === '409' || error.message?.includes('already exists')) {
        errorMessage = 'File already exists'
        errorDetails = 'A file with this name already exists in storage'
        errorHint = 'Try uploading with a different filename'
      } else if (error.statusCode === '413' || error.message?.includes('too large')) {
        errorMessage = 'File too large'
        errorDetails = 'The file exceeds the maximum allowed size'
        errorHint = 'Compress the image or use a smaller file'
      } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        errorMessage = 'Storage bucket not found'
        errorDetails = 'The "vehicle-images" bucket does not exist. Please create it in Supabase Storage.'
        errorHint = 'Go to Supabase Dashboard → Storage → New Bucket → Name: "vehicle-images" → Make it Public'
      } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
        errorMessage = 'Storage permission denied'
        errorDetails = 'Check storage bucket policies in Supabase dashboard'
        errorHint = 'Verify bucket policies allow uploads. Check Storage → vehicle-images → Policies'
      } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = 'Network error connecting to storage'
        errorDetails = 'Unable to reach Supabase storage service'
        errorHint = 'Check:\n- NEXT_PUBLIC_SUPABASE_URL is correct\n- SUPABASE_SERVICE_ROLE is set\n- Your internet connection'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorDetails,
        code: error.statusCode || error.code,
        hint: errorHint
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
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    
    // Provide more specific error information
    let errorMessage = 'Upload failed'
    let errorDetails = error.message || 'Unknown error occurred'
    let errorHint = 'Check server logs for more details'
    
    // Check for environment variable issues
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      errorMessage = 'Supabase not configured'
      errorDetails = 'NEXT_PUBLIC_SUPABASE_URL environment variable is missing'
      errorHint = 'Set NEXT_PUBLIC_SUPABASE_URL in your environment variables (.env.local for local dev)'
    } else if (error.message?.includes('fetch') || error.name === 'TypeError') {
      errorMessage = 'Failed to connect to storage'
      errorDetails = 'Unable to reach Supabase storage service. This could be due to:\n- Incorrect Supabase URL\n- Missing or invalid service role key\n- Network connectivity issues\n- Supabase service being unavailable'
      errorHint = 'Check:\n- NEXT_PUBLIC_SUPABASE_URL is correct\n- SUPABASE_SERVICE_ROLE is set and valid\n- Your internet connection\n- Supabase dashboard shows service is running'
    } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Network error'
      errorDetails = 'Cannot connect to Supabase services'
      errorHint = 'Check your internet connection and Supabase service status at status.supabase.com'
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      errorMessage = 'DNS resolution failed'
      errorDetails = 'Cannot resolve Supabase hostname. The NEXT_PUBLIC_SUPABASE_URL may be incorrect.'
      errorHint = 'Verify NEXT_PUBLIC_SUPABASE_URL is correct (should be https://your-project-id.supabase.co)'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        hint: errorHint
      }, 
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