import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { ReplyMacro } from '@/lib/types'

// GET /api/reply-macros?dealerId=xxx&category=xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const dealerId = searchParams.get('dealerId')
    const category = searchParams.get('category')
    const channel = searchParams.get('channel')

    if (!dealerId) {
      return NextResponse.json(
        { error: 'dealerId is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('reply_macros')
      .select('*')
      .eq('dealer_id', dealerId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }
    if (channel) {
      query = query.eq('channel', channel)
    }

    const { data: macros, error } = await query

    if (error) {
      console.error('Error fetching reply macros:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ macros: macros || [] })
  } catch (error: any) {
    console.error('Error in GET /api/reply-macros:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/reply-macros
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { dealerId, name, subject, body: bodyText, channel, category } = body

    if (!dealerId || !name || !bodyText || !channel) {
      return NextResponse.json(
        { error: 'dealerId, name, body, and channel are required' },
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

    const macroData: any = {
      dealer_id: dealerId,
      name,
      subject: subject || null,
      body: bodyText,
      channel,
      category: category || null,
      is_active: true,
      created_by: userRecord?.id || null
    }

    const { data: macro, error } = await supabase
      .from('reply_macros')
      .insert(macroData)
      .select()
      .single()

    if (error) {
      console.error('Error creating reply macro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ macro })
  } catch (error: any) {
    console.error('Error in POST /api/reply-macros:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/reply-macros
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await req.json()

    const { macroId, name, subject, body: bodyText, channel, category, isActive } = body

    if (!macroId) {
      return NextResponse.json({ error: 'macroId is required' }, { status: 400 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    if (name !== undefined) updateData.name = name
    if (subject !== undefined) updateData.subject = subject
    if (bodyText !== undefined) updateData.body = bodyText
    if (channel !== undefined) updateData.channel = channel
    if (category !== undefined) updateData.category = category
    if (isActive !== undefined) updateData.is_active = isActive

    const { data: macro, error } = await supabase
      .from('reply_macros')
      .update(updateData)
      .eq('id', macroId)
      .select()
      .single()

    if (error) {
      console.error('Error updating reply macro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ macro })
  } catch (error: any) {
    console.error('Error in PATCH /api/reply-macros:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/reply-macros?macroId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const macroId = searchParams.get('macroId')

    if (!macroId) {
      return NextResponse.json({ error: 'macroId is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('reply_macros')
      .delete()
      .eq('id', macroId)

    if (error) {
      console.error('Error deleting reply macro:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/reply-macros:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

