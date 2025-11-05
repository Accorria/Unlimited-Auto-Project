import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `
    }).catch(async () => {
      // Fallback: query directly using raw SQL
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .order('table_name')
      
      return { data, error }
    })

    if (tablesError) {
      // Try alternative approach - query pg_tables
      const { data: pgTables, error: pgError } = await supabase
        .from('pg_tables')
        .select('tablename, schemaname')
        .eq('schemaname', 'public')
        .order('tablename')

      if (pgError) {
        // If both fail, return a list based on what we know from the schema
        return NextResponse.json({
          tables: [
            { name: 'dealers', type: 'BASE TABLE' },
            { name: 'users', type: 'BASE TABLE' },
            { name: 'vehicles', type: 'BASE TABLE' },
            { name: 'vehicle_photos', type: 'BASE TABLE' },
            { name: 'leads', type: 'BASE TABLE' },
            { name: 'lead_status_history', type: 'BASE TABLE' },
            { name: 'appointments', type: 'BASE TABLE' },
            { name: 'messages', type: 'BASE TABLE' },
            { name: 'documents', type: 'BASE TABLE' },
            { name: 'tracking_events', type: 'BASE TABLE' },
          ],
          note: 'This is a fallback list based on your schema files. Some tables may not exist yet.'
        })
      }

      return NextResponse.json({
        tables: pgTables?.map(t => ({ name: t.tablename, type: 'BASE TABLE' })) || []
      })
    }

    // Get columns for each table
    const tableNames = tables?.map(t => t.table_name) || []
    const tableDetails: any[] = []

    for (const tableName of tableNames) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position')

      if (!columnsError && columns) {
        tableDetails.push({
          name: tableName,
          type: tables?.find(t => t.table_name === tableName)?.table_type || 'BASE TABLE',
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES'
          }))
        })
      } else {
        tableDetails.push({
          name: tableName,
          type: tables?.find(t => t.table_name === tableName)?.table_type || 'BASE TABLE',
          columns: []
        })
      }
    }

    return NextResponse.json({
      schema: 'public',
      table_count: tableDetails.length,
      tables: tableDetails
    })
  } catch (error) {
    console.error('Error fetching schema:', error)
    
    // Return fallback schema based on known files
    return NextResponse.json({
      schema: 'public',
      tables: [
        { name: 'dealers', type: 'BASE TABLE', columns: [] },
        { name: 'users', type: 'BASE TABLE', columns: [] },
        { name: 'vehicles', type: 'BASE TABLE', columns: [] },
        { name: 'vehicle_photos', type: 'BASE TABLE', columns: [] },
        { name: 'leads', type: 'BASE TABLE', columns: [] },
        { name: 'lead_status_history', type: 'BASE TABLE', columns: [] },
        { name: 'appointments', type: 'BASE TABLE', columns: [] },
        { name: 'messages', type: 'BASE TABLE', columns: [] },
        { name: 'documents', type: 'BASE TABLE', columns: [] },
        { name: 'tracking_events', type: 'BASE TABLE', columns: [] },
      ],
      note: 'This is a fallback list. To see actual schema, check Supabase Dashboard or use SQL Editor.'
    })
  }
}

