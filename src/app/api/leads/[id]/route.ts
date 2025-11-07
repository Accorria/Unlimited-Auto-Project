import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    console.log('Updating lead:', id, body)
    
    // Use service role client to bypass RLS
    const supabase = createServerClient()
    
    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Update status if provided
    if (body.status) {
      updateData.status = body.status
      updateData.status_updated_at = new Date().toISOString()
    }

    // Update other fields if provided
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.message !== undefined) updateData.message = body.message
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.vehicle_id !== undefined) updateData.vehicle_id = body.vehicle_id
    if (body.source !== undefined) updateData.source = body.source
    if (body.follow_up_date !== undefined) updateData.follow_up_date = body.follow_up_date
    if (body.follow_up_notes !== undefined) updateData.follow_up_notes = body.follow_up_notes
    if (body.last_contact_date !== undefined) updateData.last_contact_date = body.last_contact_date
    if (body.close_date !== undefined) updateData.close_date = body.close_date
    if (body.close_amount !== undefined) updateData.close_amount = body.close_amount
    if (body.commission_amount !== undefined) updateData.commission_amount = body.commission_amount

    // Update the lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating lead:', updateError)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      lead: updatedLead,
      message: 'Lead updated successfully' 
    })
    
  } catch (error: any) {
    console.error('Update lead API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    
    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('dealer_id', dealer.id)
    
    if (error) {
      console.error('Error deleting lead:', error)
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead deleted successfully' 
    })
    
  } catch (error: any) {
    console.error('Delete lead API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
