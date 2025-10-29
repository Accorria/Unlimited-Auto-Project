import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get all tables by trying to query them
    const tablesToCheck = [
      'dealers', 'users', 'vehicles', 'leads', 'appointments', 'messages', 
      'documents', 'activity_logs', 'tracking_events', 'vehicle_photos',
      'user_performance', 'rdr_tracking', 'communication_quality', 'performance_trends'
    ]
    
    const schemaInfo = {}
    
    for (const table of tablesToCheck) {
      try {
        // Try to get table structure by selecting one row
        const { data, error } = await supabase.from(table).select('*').limit(1)
        
        if (!error) {
          // Table exists, get column info
          const { data: columns } = await supabase
            .from(table)
            .select('*')
            .limit(0)
          
          schemaInfo[table] = {
            exists: true,
            columns: columns ? Object.keys(columns) : [],
            sampleData: data?.[0] || null
          }
        } else {
          schemaInfo[table] = {
            exists: false,
            error: error.message
          }
        }
      } catch (e) {
        schemaInfo[table] = {
          exists: false,
          error: e.message
        }
      }
    }

    return NextResponse.json({
      success: true,
      schemaInfo
    })

  } catch (error: any) {
    console.error('Schema check error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}


