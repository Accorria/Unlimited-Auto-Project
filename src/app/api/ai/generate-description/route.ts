import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { year, make, model, trim, miles, price, condition, features, engine, color, transmission, drivetrain } = await req.json()

    if (!year || !make || !model) {
      return NextResponse.json({ 
        error: 'Year, make, and model are required' 
      }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY in your environment variables'
      }, { status: 500 })
    }

    // Build vehicle information string
    let vehicleInfo = `${year} ${make} ${model}`
    if (trim) vehicleInfo += ` ${trim}`
    
    let details = []
    if (condition) details.push(`Condition: ${condition}`)
    if (miles) details.push(`Mileage: ${miles.toLocaleString()} miles`)
    if (price) details.push(`Price: $${price.toLocaleString()}`)
    if (engine) details.push(`Engine: ${engine}`)
    if (color) details.push(`Color: ${color}`)
    if (transmission) details.push(`Transmission: ${transmission}`)
    if (drivetrain) details.push(`Drivetrain: ${drivetrain}`)
    if (features && Array.isArray(features) && features.length > 0) {
      details.push(`Features: ${features.join(', ')}`)
    }

    const vehicleDetails = details.join('\n')

    // Generate description using OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Write a compelling 2-3 sentence description for a used car listing. Be professional, highlight key features, and make it appealing to potential buyers. Keep it concise and sales-focused.

Vehicle: ${vehicleInfo}
${vehicleDetails ? `\nDetails:\n${vehicleDetails}` : ''}

Write a professional, engaging description that would attract buyers:`,
      maxTokens: 200,
      temperature: 0.7,
    })

    return NextResponse.json({
      success: true,
      description: text.trim()
    })

  } catch (error: any) {
    console.error('AI description generation error:', error)
    
    // Check if it's an API key error
    if (error.message?.includes('API key') || error.message?.includes('401')) {
      return NextResponse.json({ 
        error: 'OpenAI API key invalid or missing',
        details: 'Please check your OPENAI_API_KEY environment variable'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      error: 'Failed to generate description',
      details: error.message || 'Unknown error occurred'
    }, { status: 500 })
  }
}

