import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing dealer lookup...')
    
    // Use service role client to bypass RLS
    const supabase = createServerClient()
    
    // Test dealer lookup
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, slug, name, is_active')
      .eq('slug', 'unlimited-auto')
      .single()

    console.log('Dealer lookup result:', { dealer, dealerError })

    if (dealerError) {
      return NextResponse.json({ 
        error: 'Dealer lookup failed', 
        details: dealerError 
      }, { status: 500 })
    }

    if (!dealer) {
      return NextResponse.json({ 
        error: 'Dealer not found' 
      }, { status: 404 })
    }

    // Test vehicles lookup
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, year, make, model, dealer_id')
      .eq('dealer_id', dealer.id)

    console.log('Vehicles lookup result:', { vehicles, vehiclesError })

    return NextResponse.json({
      success: true,
      dealer,
      vehicleCount: vehicles?.length || 0,
      vehicles: vehicles || []
    })

  } catch (error: any) {
    console.error('Test API error:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}
