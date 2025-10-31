import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const trim = searchParams.get('trim')

    if (!year || !make || !model) {
      return NextResponse.json({ error: 'Year, make, and model are required' }, { status: 400 })
    }

    // Try Google Custom Search API first (if configured)
    const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY
    const googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID

    if (googleApiKey && googleCx) {
      try {
        // Build search query
        let searchQuery = `${year} ${make} ${model}`
        if (trim) {
          searchQuery += ` ${trim}`
        }
        searchQuery += ' specifications engine mpg'

        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(searchQuery)}`
        
        const response = await fetch(searchUrl)
        const data = await response.json()

        if (data.items && data.items.length > 0) {
          // Parse search results to extract vehicle specs
          const firstResult = data.items[0]
          const snippet = firstResult.snippet || firstResult.htmlSnippet || ''

          // Extract engine information
          const enginePatterns = [
            /(\d+\.?\d*)\s*L\s*(?:Turbo\s*)?(?:I-?)?4[- ]?(?:Cylinder|cyl|Engine)/i,
            /(\d+\.?\d*)\s*L\s*(?:Turbo\s*)?V6/i,
            /(\d+\.?\d*)\s*L\s*(?:Turbo\s*)?V8/i,
            /(\d+\.?\d*)\s*L\s*(?:Turbo\s*)?(?:I-?)?6/i
          ]

          let engine = null
          for (const pattern of enginePatterns) {
            const match = snippet.match(pattern)
            if (match) {
              engine = `${match[1]}L ${match[0].includes('V6') ? 'V6' : match[0].includes('V8') ? 'V8' : match[0].includes('4') ? '4-Cylinder' : 'Engine'}`
              break
            }
          }

          // Extract MPG information
          const mpgPattern = /(\d+)\s*(?:city|mpg|City)\s*\/\s*(\d+)\s*(?:highway|Highway|hwy)/i
          const mpgMatch = snippet.match(mpgPattern)
          const mpg = mpgMatch ? `${mpgMatch[1]} City / ${mpgMatch[2]} Highway` : null

          const specs = {
            engine: engine,
            mpg: mpg,
            transmission: snippet.includes('automatic') || snippet.includes('Automatic') ? 'Automatic' : 
                          snippet.includes('manual') || snippet.includes('Manual') ? 'Manual' : null,
            drivetrain: snippet.includes('AWD') || snippet.includes('all-wheel') ? 'AWD' :
                       snippet.includes('FWD') || snippet.includes('front-wheel') ? 'FWD' :
                       snippet.includes('RWD') || snippet.includes('rear-wheel') ? 'RWD' : null,
            source: 'google_custom_search'
          }

          return NextResponse.json({ success: true, specs })
        }
      } catch (error) {
        console.error('Google Custom Search API error:', error)
        // Fall through to fallback
      }
    }

    // Fallback: Use suggested specs based on make/model
    const suggestedSpecs = getSuggestedSpecs(make, model, trim)
    return NextResponse.json({ 
      success: true, 
      specs: suggestedSpecs,
      source: 'fallback',
      note: googleApiKey ? 'Google API failed, using suggested values.' : 'Configure GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID for live search results.'
    })

  } catch (error: any) {
    console.error('Vehicle search error:', error)
    return NextResponse.json({ 
      error: 'Failed to search vehicle information',
      details: error.message 
    }, { status: 500 })
  }
}

// Fallback function to suggest specs based on make/model
function getSuggestedSpecs(make: string, model: string, trim: string | null) {
  // Common engine specs by make/model
  const engineMap: Record<string, Record<string, string[]>> = {
    'Chevrolet': {
      'Cruze': ['1.4L Turbo 4-Cylinder', '1.8L 4-Cylinder', '1.6L Turbo Diesel'],
      'Malibu': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder'],
      'Camaro': ['2.0L Turbo 4-Cylinder', '3.6L V6', '6.2L V8'],
      'Equinox': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder']
    },
    'Honda': {
      'Civic': ['2.0L 4-Cylinder', '1.5L Turbo 4-Cylinder'],
      'Accord': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder']
    },
    'Toyota': {
      'Camry': ['2.5L 4-Cylinder', '3.5L V6'],
      'Corolla': ['1.8L 4-Cylinder', '2.0L 4-Cylinder']
    }
  }

  // Common MPG ranges
  const mpgMap: Record<string, Record<string, string>> = {
    'Chevrolet': {
      'Cruze': '28 City / 40 Highway',
      'Malibu': '29 City / 36 Highway',
      'Camaro': '20 City / 30 Highway',
      'Equinox': '26 City / 31 Highway'
    },
    'Honda': {
      'Civic': '32 City / 42 Highway',
      'Accord': '30 City / 38 Highway'
    },
    'Toyota': {
      'Camry': '28 City / 39 Highway',
      'Corolla': '30 City / 38 Highway'
    }
  }

  const engines = engineMap[make]?.[model] || ['2.0L 4-Cylinder']
  const mpg = mpgMap[make]?.[model] || '25 City / 32 Highway'

  return {
    engine: engines[0],
    mpg: mpg,
    transmission: 'Automatic',
    drivetrain: model.includes('SUV') || model.includes('Truck') ? 'AWD' : 'FWD'
  }
}

