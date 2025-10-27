import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    )
    
    // Get all lead IDs first
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('id')
    
    if (fetchError) {
      console.error('Error fetching leads:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
    
    if (!leads || leads.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No leads to clear' 
      })
    }
    
    // Delete all leads by ID
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', leads.map(lead => lead.id))
    
    if (error) {
      console.error('Error clearing leads:', error)
      return NextResponse.json({ error: 'Failed to clear leads' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'All leads cleared successfully' 
    })
    
  } catch (error: any) {
    console.error('Clear leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
