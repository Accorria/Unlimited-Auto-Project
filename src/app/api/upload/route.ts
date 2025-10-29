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
    
    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
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