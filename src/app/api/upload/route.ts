import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { parseFilename, MODEL_MAP, type AngleCode } from '@/lib/vehicleImages'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const year = formData.get('year') as string
    const modelCode = formData.get('modelCode') as string
    const angle = formData.get('angle') as string
    const make = formData.get('make') as string
    const model = formData.get('model') as string

    if (!file || !fileName) {
      return NextResponse.json({ error: 'File and fileName are required' }, { status: 400 })
    }

    // Parse filename if not provided
    let parsedData
    if (year && modelCode && angle) {
      parsedData = {
        year: parseInt(year),
        modelCode,
        angle: angle as AngleCode,
        make: make || null,
        model: model || null
      }
    } else {
      parsedData = parseFilename(fileName)
      const meta = MODEL_MAP[parsedData.modelCode] ?? {}
      parsedData.make = meta.make || null
      parsedData.model = meta.model || null
    }

    const s = supabaseServer()

    // 1) Ensure vehicle exists (upsert by year + model_code for now)
    const { data: vData, error: vErr } = await s
      .from('vehicles')
      .upsert({
        year: parsedData.year,
        make: parsedData.make,
        model: parsedData.model,
        model_code: parsedData.modelCode,
        dealer_id: 'unlimited-auto'
      }, { 
        onConflict: 'year,model_code,dealer_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (vErr) {
      console.error('Vehicle upsert error:', vErr)
      throw vErr
    }

    const vehicleId = vData.id

    // 2) Upload file to Supabase Storage
    const fileExt = fileName.split('.').pop()
    const storagePath = `${vehicleId}/${Date.now()}_${fileName}`
    
    const { data: uploadData, error: uploadErr } = await s.storage
      .from('vehicle-images')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600' // Cache for 1 hour
      })

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr)
      throw uploadErr
    }

    // 3) Get public URL
    const { data: urlData } = s.storage
      .from('vehicle-images')
      .getPublicUrl(storagePath)

    const publicUrl = urlData.publicUrl

    // 4) Insert photo record
    const { error: photoErr } = await s
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        angle: parsedData.angle,
        file_path: storagePath,
        public_url: publicUrl
      })

    if (photoErr) {
      console.error('Photo insert error:', photoErr)
      // Clean up uploaded file if database insert fails
      await s.storage.from('vehicle-images').remove([storagePath])
      throw photoErr
    }

    return NextResponse.json({
      success: true,
      vehicleId,
      publicUrl,
      storagePath,
      vehicle: vData,
      parsed: parsedData
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
