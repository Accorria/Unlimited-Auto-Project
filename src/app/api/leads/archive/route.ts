import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get request body
    const body = await req.json()
    const { leadIds, archive = true } = body

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'Lead IDs are required' }, { status: 400 })
    }

    // Get the dealer ID
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // First, check if archived_leads table exists, if not create it
    const { error: tableCheck } = await supabase.rpc('check_table_exists', { table_name: 'archived_leads' })
    
    // If table doesn't exist, create it
    if (tableCheck) {
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.archived_leads (
            LIKE public.leads INCLUDING ALL
          );
        `
      })

      if (createError) {
        console.log('Note: archived_leads table may already exist or needs manual creation')
      }
    }

    // Fetch leads to archive
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds)
      .eq('dealer_id', dealer.id)

    if (fetchError) {
      console.error('Error fetching leads:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads found to archive' }, { status: 404 })
    }

    if (archive) {
      // Insert into archived_leads table
      const { error: archiveError } = await supabase
        .from('archived_leads')
        .insert(leads)

      if (archiveError) {
        console.error('Error archiving leads:', archiveError)
        // If table doesn't exist, return error with instructions
        if (archiveError.message.includes('does not exist')) {
          return NextResponse.json({
            error: 'archived_leads table does not exist. Please create it first using SQL Editor in Supabase.',
            sql: `
CREATE TABLE IF NOT EXISTS public.archived_leads (
  LIKE public.leads INCLUDING ALL
);
            `
          }, { status: 500 })
        }
        return NextResponse.json({ error: 'Failed to archive leads' }, { status: 500 })
      }

      // Delete from main leads table
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in('id', leadIds)
        .eq('dealer_id', dealer.id)

      if (deleteError) {
        console.error('Error deleting leads:', deleteError)
        return NextResponse.json({ error: 'Failed to delete leads after archiving' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully archived ${leads.length} lead(s)`,
        archived: leads.length
      })
    } else {
      // Just delete without archiving
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .in('id', leadIds)
        .eq('dealer_id', dealer.id)

      if (deleteError) {
        console.error('Error deleting leads:', deleteError)
        return NextResponse.json({ error: 'Failed to delete leads' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${leads.length} lead(s)`,
        deleted: leads.length
      })
    }
  } catch (error) {
    console.error('Error archiving leads:', error)
    return NextResponse.json({ error: 'Failed to archive leads' }, { status: 500 })
  }
}

