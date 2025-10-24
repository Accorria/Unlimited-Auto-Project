import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'vehicles')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file to local storage
    const filePath = join(uploadDir, uniqueFileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // Create public URL
    const publicUrl = `/uploads/vehicles/${uniqueFileName}`

    // For now, return success with local file info
    // In production, you'd save this to a database
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