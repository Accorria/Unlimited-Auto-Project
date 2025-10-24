import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing direct Supabase client...')
    
    // Create client directly with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!,
      { auth: { persistSession: false } }
    )
    
    // Test dealer lookup
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, slug, name, is_active')
      .eq('slug', 'unlimited-auto')
      .single()

    console.log('Direct client result:', { dealer, dealerError })

    if (dealerError) {
      return NextResponse.json({ 
        error: 'Dealer lookup failed', 
        details: dealerError 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      dealer
    })

  } catch (error: any) {
    console.error('Simple test error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}
