import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check what tables exist by trying to query them
    const knownTables = ['dealers', 'users', 'vehicles', 'leads', 'appointments', 'messages', 'documents', 'activity_logs', 'tracking_events', 'vehicle_photos']
    const tableStatus = {}
    
    for (const table of knownTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        tableStatus[table] = { exists: !error, error: error?.message }
      } catch (e) {
        tableStatus[table] = { exists: false, error: e.message }
      }
    }

    // Check dealers table specifically
    const { data: dealers, error: dealersError } = await supabase
      .from('dealers')
      .select('*')

    return NextResponse.json({
      success: true,
      tableStatus,
      dealers: dealers || [],
      dealersError: dealersError
    })

  } catch (error: any) {
    console.error('Database check error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
