import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { LeadTask } from '@/lib/types'

// GET /api/leads/tasks?leadId=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
    }

    const { data: tasks, error } = await supabase
      .from('lead_tasks')
      .select(`
        *,
        owner:users!lead_tasks_owner_id_fkey(id, name, email),
        created_by_user:users!lead_tasks_created_by_fkey(id, name, email)
      `)
      .eq('lead_id', leadId)
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error: any) {
    console.error('Error in GET /api/leads/tasks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/leads/tasks
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { leadId, title, dueAt, ownerId, notes, dealerId } = body

    if (!leadId || !title || !dealerId) {
      return NextResponse.json(
        { error: 'leadId, title, and dealerId are required' },
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

    const taskData: any = {
      lead_id: leadId,
      dealer_id: dealerId,
      title,
      due_at: dueAt || null,
      owner_id: ownerId || null,
      notes: notes || null,
      status: 'open',
      created_by: userRecord?.id || null
    }

    const { data: task, error } = await supabase
      .from('lead_tasks')
      .insert(taskData)
      .select(`
        *,
        owner:users!lead_tasks_owner_id_fkey(id, name, email),
        created_by_user:users!lead_tasks_created_by_fkey(id, name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error in POST /api/leads/tasks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/leads/tasks
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { taskId, status, title, dueAt, ownerId, notes } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (title !== undefined) updateData.title = title
    if (dueAt !== undefined) updateData.due_at = dueAt
    if (ownerId !== undefined) updateData.owner_id = ownerId
    if (notes !== undefined) updateData.notes = notes
    updateData.updated_at = new Date().toISOString()

    const { data: task, error } = await supabase
      .from('lead_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        owner:users!lead_tasks_owner_id_fkey(id, name, email),
        created_by_user:users!lead_tasks_created_by_fkey(id, name, email)
      `)
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('Error in PATCH /api/leads/tasks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/leads/tasks?taskId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('lead_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/leads/tasks:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

