import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const leadId = formData.get('leadId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Create unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const uniqueFileName = `${type}_${timestamp}.${extension}`

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filePath = join(uploadDir, uniqueFileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/documents/${uniqueFileName}`

    // TODO: Save document metadata to database
    // This would link the document to the lead in your Supabase database

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      type,
      leadId,
      size: file.size,
      mimeType: file.type
    })

  } catch (error: any) {
    console.error('Document upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
