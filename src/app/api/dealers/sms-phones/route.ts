import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('sms_phone_numbers')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ 
        error: 'Dealer not found' 
      }, { status: 404 })
    }

    const phoneNumbers = Array.isArray(dealer.sms_phone_numbers) 
      ? dealer.sms_phone_numbers 
      : []

    return NextResponse.json({ phoneNumbers })
  } catch (error: any) {
    console.error('Error fetching SMS phone numbers:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phoneNumbers } = body

    if (!Array.isArray(phoneNumbers)) {
      return NextResponse.json({ 
        error: 'phoneNumbers must be an array' 
      }, { status: 400 })
    }

    const supabase = createServerClient()
    
    const { error: updateError } = await supabase
      .from('dealers')
      .update({ sms_phone_numbers: phoneNumbers })
      .eq('slug', 'unlimited-auto')

    if (updateError) {
      console.error('Error updating SMS phone numbers:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update phone numbers' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Phone numbers updated successfully' 
    })
  } catch (error: any) {
    console.error('Error updating SMS phone numbers:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

