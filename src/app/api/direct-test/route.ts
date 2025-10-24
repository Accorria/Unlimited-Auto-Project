import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing direct access...')
    
    // Create client with anon key first
    const supabaseAnon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    console.log('Testing with anon key...')
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('dealers')
      .select('*')
      .limit(1)
    
    console.log('Anon result:', { anonData, anonError })
    
    // Create client with service role key
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!,
      { auth: { persistSession: false } }
    )
    
    console.log('Testing with service role key...')
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('dealers')
      .select('*')
      .limit(1)
    
    console.log('Service result:', { serviceData, serviceError })
    
    return NextResponse.json({
      anon: { data: anonData, error: anonError },
      service: { data: serviceData, error: serviceError }
    })

  } catch (error: any) {
    console.error('Direct test error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}
