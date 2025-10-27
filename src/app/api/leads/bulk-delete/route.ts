import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: NextRequest) {
  try {
    const { leadIds } = await req.json()
    
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided' }, { status: 400 })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    )
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', leadIds)
    
    if (error) {
      console.error('Error bulk deleting leads:', error)
      return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${leadIds.length} leads deleted successfully` 
    })
    
  } catch (error: any) {
    console.error('Bulk delete leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
