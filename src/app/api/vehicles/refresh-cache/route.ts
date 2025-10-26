import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // This endpoint can be used to trigger cache invalidation
    // For now, we'll just return success since we're using cache-busting timestamps
    return NextResponse.json({ 
      success: true, 
      message: 'Cache refresh triggered' 
    })
  } catch (error: any) {
    console.error('Cache refresh error:', error)
    return NextResponse.json({ 
      error: 'Cache refresh failed' 
    }, { status: 500 })
  }
}
