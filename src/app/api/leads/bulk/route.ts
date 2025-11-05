import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// POST /api/leads/bulk
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { 
      leadIds, 
      action, 
      assignTo, 
      status, 
      priority, 
      nextActionDueAt,
      macroId 
    } = body

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'leadIds array is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user record
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Handle different actions
    switch (action) {
      case 'assign':
        if (!assignTo) {
          return NextResponse.json(
            { error: 'assignTo is required for assign action' },
            { status: 400 }
          )
        }
        updateData.assigned_to = assignTo
        break

      case 'change_status':
        if (!status) {
          return NextResponse.json(
            { error: 'status is required for change_status action' },
            { status: 400 }
          )
        }
        updateData.status = status
        updateData.status_updated_at = new Date().toISOString()
        
        // Auto-set first_response_at if changing from 'new'
        const { data: currentLeads } = await supabase
          .from('leads')
          .select('id, status')
          .in('id', leadIds)
        
        const newLeads = (currentLeads || []).filter(l => l.status === 'new')
        if (newLeads.length > 0 && status !== 'new') {
          updateData.first_response_at = new Date().toISOString()
        }
        break

      case 'set_priority':
        if (!priority) {
          return NextResponse.json(
            { error: 'priority is required for set_priority action' },
            { status: 400 }
          )
        }
        updateData.priority = priority
        break

      case 'set_next_action':
        if (!nextActionDueAt) {
          return NextResponse.json(
            { error: 'nextActionDueAt is required for set_next_action action' },
            { status: 400 }
          )
        }
        updateData.next_action_due_at = nextActionDueAt
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    // Update leads
    const { data: updatedLeads, error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .in('id', leadIds)
      .select()

    if (updateError) {
      console.error('Error updating leads:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log status changes if status was changed
    if (action === 'change_status' && userRecord) {
      const { data: currentLeads } = await supabase
        .from('leads')
        .select('id, status')
        .in('id', leadIds)

      const statusHistoryEntries = (currentLeads || []).map(lead => ({
        lead_id: lead.id,
        from_status: lead.status,
        to_status: status,
        changed_by: userRecord.id,
        notes: `Bulk action: ${action}`
      }))

      if (statusHistoryEntries.length > 0) {
        await supabase
          .from('lead_status_history')
          .insert(statusHistoryEntries)
      }
    }

    // Handle send template email if macroId provided
    if (macroId && action === 'send_template') {
      // Get macro
      const { data: macro } = await supabase
        .from('reply_macros')
        .select('*')
        .eq('id', macroId)
        .single()

      if (macro) {
        // Get leads with emails
        const { data: leadsWithEmails } = await supabase
          .from('leads')
          .select('id, email, name')
          .in('id', leadIds)
          .not('email', 'is', null)

        // Send emails (you'll need to implement email sending logic)
        // For now, we'll just log it
        console.log(`Sending template email to ${leadsWithEmails?.length || 0} leads`)
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: updatedLeads?.length || 0,
      leads: updatedLeads || []
    })
  } catch (error: any) {
    console.error('Error in POST /api/leads/bulk:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

