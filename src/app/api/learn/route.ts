import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

// Store for learned entries (in production, this would be in a database)
let learnedEntries = {
  trims: new Set<string>(),
  engines: new Set<string>(),
  colors: new Set<string>(),
  features: new Set<string>()
}

export async function POST(req: NextRequest) {
  try {
    const { type, value, make, model } = await req.json()
    
    if (!type || !value) {
      return NextResponse.json({ error: 'Type and value are required' }, { status: 400 })
    }

    // Add to learned entries
    if (learnedEntries[type as keyof typeof learnedEntries]) {
      learnedEntries[type as keyof typeof learnedEntries].add(value)
      console.log(`Learned new ${type}: ${value} for ${make} ${model}`)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Learned new ${type}: ${value}`,
      learnedCount: learnedEntries[type as keyof typeof learnedEntries].size
    })

  } catch (error: any) {
    console.error('Error learning entry:', error)
    return NextResponse.json({ error: 'Failed to learn entry' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    
    if (!type || !learnedEntries[type as keyof typeof learnedEntries]) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const entries = Array.from(learnedEntries[type as keyof typeof learnedEntries])
    
    return NextResponse.json({ 
      entries,
      count: entries.length
    })

  } catch (error: any) {
    console.error('Error getting learned entries:', error)
    return NextResponse.json({ error: 'Failed to get learned entries' }, { status: 500 })
  }
}
