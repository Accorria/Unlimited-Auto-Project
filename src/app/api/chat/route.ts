import { NextRequest } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createServerClient } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

// OpenAI client will automatically use OPENAI_API_KEY from environment

// Use nodejs runtime for Supabase compatibility
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Get vehicle inventory for context
    const supabase = createServerClient()
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    let vehicleContext = ''
    let servicesContext = ''
    
    if (dealer) {
      // Get vehicle inventory
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select(`
          id,
          year,
          make,
          model,
          trim,
          price,
          miles,
          status,
          description,
          condition,
          transmission,
          drivetrain,
          fuel_type,
          down_payment,
          exterior_color
        `)
        .eq('dealer_id', dealer.id)
        .neq('status', 'sold')
        .limit(20)
        .order('display_order', { ascending: true })

      // Get services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('dealer_id', dealer.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (vehicles && vehicles.length > 0) {
        // Count vehicles by make/model for quick reference
        const makeCounts: { [key: string]: number } = {}
        const makeModelCounts: { [key: string]: number } = {}
        const colorCounts: { [key: string]: number } = {}
        const drivetrainCounts: { [key: string]: number } = {}
        
        vehicles.forEach((v: any) => {
          const makeModel = `${v.make} ${v.model}`
          makeCounts[v.make] = (makeCounts[v.make] || 0) + 1
          makeModelCounts[makeModel] = (makeModelCounts[makeModel] || 0) + 1
          if (v.exterior_color) {
            colorCounts[v.exterior_color.toLowerCase()] = (colorCounts[v.exterior_color.toLowerCase()] || 0) + 1
          }
          if (v.drivetrain) {
            drivetrainCounts[v.drivetrain.toLowerCase()] = (drivetrainCounts[v.drivetrain.toLowerCase()] || 0) + 1
          }
        })
        
        vehicleContext = `\n\n=== CURRENT VEHICLE INVENTORY (${vehicles.length} available vehicles) ===\n`
        vehicleContext += `IMPORTANT: For vehicle-specific information (price, mileage, condition, specifications), you MUST ONLY use the data below. Do not use general knowledge about vehicle models or typical pricing.\n\n`
        
        // Add quick reference for ambiguous queries
        vehicleContext += `QUICK REFERENCE - Multiple vehicles by category:\n`
        Object.entries(makeCounts).forEach(([make, count]) => {
          if (count > 1) {
            vehicleContext += `- ${count} ${make} vehicles (will need clarification if customer says "${make}" or "the ${make}")\n`
          }
        })
        Object.entries(makeModelCounts).forEach(([makeModel, count]) => {
          if (count > 1) {
            vehicleContext += `- ${count} ${makeModel}s (will need clarification if customer says "${makeModel}" or "the ${makeModel.split(' ')[1]}")\n`
          }
        })
        Object.entries(colorCounts).forEach(([color, count]) => {
          if (count > 1) {
            vehicleContext += `- ${count} ${color} vehicles (will need clarification if customer says "the ${color} one")\n`
          }
        })
        Object.entries(drivetrainCounts).forEach(([drivetrain, count]) => {
          if (count > 1) {
            vehicleContext += `- ${count} ${drivetrain} vehicles (will need clarification if customer says "the ${drivetrain}")\n`
          }
        })
        vehicleContext += `\n`
        
        vehicleContext += `MATCHING RULES: When customers ask about a vehicle, match it flexibly:\n`
        vehicleContext += `- "2019 Malibu" matches "2019 Chevrolet Malibu" or "2019 Chevrolet Malibu LT"\n`
        vehicleContext += `- "Malibu" matches any Chevrolet Malibu regardless of year or trim\n`
        vehicleContext += `- "Dodge Charger" matches "2015 Dodge Charger SXT" or any Dodge Charger\n`
        vehicleContext += `- "Charger" matches any Dodge Charger regardless of year or trim\n`
        vehicleContext += `- "Sierra" matches any GMC Sierra\n`
        vehicleContext += `- "Jeep Wrangler" matches "2018 Jeep Wrangler Rubicon X" or any Jeep Wrangler\n`
        vehicleContext += `- "Jeep" matches any Jeep (Wrangler, Patriot, etc.)\n`
        vehicleContext += `- Match by model name alone, year + model, make + model, or full name\n`
        vehicleContext += `- Match by color: "the black one", "the white Jeep"\n`
        vehicleContext += `- Match by drivetrain: "the 4x4", "the AWD"\n`
        vehicleContext += `- If a customer says "Charger", find "Dodge Charger" in the inventory\n`
        vehicleContext += `- If a customer says "Wrangler", find "Jeep Wrangler" in the inventory\n`
        vehicleContext += `- If a customer says "Jeep", find ALL Jeeps in the inventory\n`
        vehicleContext += `- If multiple vehicles match, mention ALL of them with their specific details\n`
        vehicleContext += `- If ONLY ONE vehicle matches, provide its details immediately (DO NOT ask clarifying questions)\n\n`
        
        vehicles.forEach((v: any) => {
          const fullName = `${v.year} ${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`.trim()
          const searchableNames = [
            fullName,
            `${v.year} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
            `${v.make} ${v.model}${v.trim ? ` ${v.trim}` : ''}`,
            `${v.year} ${v.make} ${v.model}`, // Without trim
            `${v.make} ${v.model}`, // Without trim
            v.model, // Just model name (e.g., "Charger", "Wrangler", "Malibu")
            `${v.year} ${v.model}`, // Year + model without trim
            v.make // Just make name (e.g., "Jeep", "Dodge", "Chevrolet")
          ].filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
          
          vehicleContext += `Vehicle ID: ${v.id}\n`
          vehicleContext += `Full Name: ${fullName}\n`
          vehicleContext += `Searchable Names: ${searchableNames.join(', ')}\n`
          vehicleContext += `Year: ${v.year} | Make: ${v.make} | Model: ${v.model}${v.trim ? ` | Trim: ${v.trim}` : ''}\n`
          if (v.exterior_color) vehicleContext += `Color: ${v.exterior_color}\n`
          vehicleContext += `Price: $${v.price?.toLocaleString() || 'Call for Price'}\n`
          vehicleContext += `Mileage: ${v.miles?.toLocaleString() || 'TBD'} miles\n`
          vehicleContext += `Condition: ${v.condition || 'Good'}\n`
          if (v.transmission) vehicleContext += `Transmission: ${v.transmission}\n`
          if (v.drivetrain) vehicleContext += `Drivetrain: ${v.drivetrain}\n`
          if (v.fuel_type) vehicleContext += `Fuel Type: ${v.fuel_type}\n`
          if (v.down_payment) vehicleContext += `Down Payment: $${v.down_payment}\n`
          if (v.description) vehicleContext += `Description: ${v.description}\n`
          vehicleContext += `---\n\n`
        })
        vehicleContext += `=== END OF INVENTORY ===\n\n`
      }

      // Build services context
      if (services && services.length > 0) {
        servicesContext = `\n\n=== AVAILABLE SERVICES & PRICING ===\n`
        servicesContext += `IMPORTANT: For service information and pricing, you MUST ONLY use the data below. Do not use general knowledge about typical service pricing.\n\n`
        
        services.forEach((s: any) => {
          servicesContext += `Service: ${s.name}\n`
          if (s.description) servicesContext += `Description: ${s.description}\n`
          if (s.category) servicesContext += `Category: ${s.category}\n`
          if (s.price !== null) {
            const priceUnit = s.price_unit === 'flat' ? '' : ` (${s.price_unit})`
            servicesContext += `Price: $${s.price.toFixed(2)}${priceUnit}\n`
          } else {
            servicesContext += `Price: Call for pricing\n`
          }
          if (s.features && Array.isArray(s.features) && s.features.length > 0) {
            servicesContext += `Features: ${s.features.join(', ')}\n`
          }
          servicesContext += `---\n\n`
        })
        servicesContext += `=== END OF SERVICES ===\n\n`
      }
    }

    const systemPrompt = `You are a friendly, helpful customer service chatbot for Unlimited Auto, a used car dealership. Your role is to:

1. Help customers find vehicles that match their needs through natural conversation
2. Answer questions about vehicles, pricing, financing, and services
3. Schedule appointments for test drives
4. Provide information about the dealership
5. Capture customer information when they're interested

YOUR PERSONALITY:
- Be conversational, friendly, and helpful - like talking to a knowledgeable friend
- Have a back-and-forth dialogue - ask clarifying questions when needed
- Use natural language - "Oh, you're talking about the Jeep Wrangler!" or "We have a couple of options for you!"
- Build on the conversation - reference what the customer said earlier
- Be enthusiastic but professional

REAL-TIME DATA UPDATES:
- The inventory and services data below is fetched fresh on every conversation
- This means you always have the most current information - vehicles added or removed, prices changed, services updated
- The data is updated in real-time, so you can confidently say "Yes, we have that vehicle" or "Our window tint is currently $80" based on the data below

CRITICAL RULES FOR VEHICLE INFORMATION:
- For vehicle-specific details (price, mileage, condition, specifications, down payment, color), you MUST ONLY use the inventory data provided below
- DO NOT use general knowledge about vehicle models, typical pricing, or specifications from your training data
- DO NOT assume or estimate vehicle details - only use what's explicitly listed in the inventory
- If a customer asks about a vehicle that is NOT in the inventory list, tell them it's not currently available
- If they ask about a make/model that exists in the inventory, use the EXACT details from the inventory (price, mileage, condition, color, etc.)
- NEVER make up vehicle details, prices, or specifications
- If the inventory is empty or a vehicle isn't listed, say "I don't have that vehicle in our current inventory"

Note: You should still use your language understanding and conversational abilities naturally - these rules only apply to vehicle-specific factual information.

Key Information:
- Dealership: Unlimited Auto
- You can help with vehicle search, financing questions, credit applications, and service appointments
- Always be friendly, professional, and helpful
- If they want to schedule a test drive or appointment, collect their name, phone, and email
- For financing questions, mention they can apply online or call for more information
- Down payments start as low as $999

When customers ask about vehicles:
- FIRST: Search the inventory below using flexible matching - BE VERY FLEXIBLE:
  * "Charger" or "Dodge Charger" matches "Dodge Charger SXT" or any Dodge Charger
  * "Wrangler" or "Jeep Wrangler" matches "Jeep Wrangler Rubicon X" or any Jeep Wrangler
  * "Jeep" matches any Jeep (Wrangler, Patriot, etc.)
  * "the black one" or "the white one" - match by color
  * "the 4x4" - match by drivetrain
  * Match by model name alone (e.g., "Charger" = find "Dodge Charger" in inventory)
  * Match by year + model (e.g., "2015 Charger" matches "2015 Dodge Charger SXT")
  * Match by make + model (e.g., "Dodge Charger" matches "2015 Dodge Charger SXT")
  * Match by color (e.g., "the black Jeep" matches black Jeep vehicles)
  * Match by drivetrain (e.g., "the 4x4" matches vehicles with 4x4 drivetrain)
  * Check the "Searchable Names" field for each vehicle - it contains all variations
  * Look for partial matches - if customer says "Charger", search for "Charger" in the Searchable Names

- HANDLING VEHICLE QUERIES (CRITICAL - READ CAREFULLY):
  * STEP 1: Search the inventory for ALL matching vehicles based on the customer's query
  * STEP 2: Count how many vehicles match:
  
  **IF ONLY ONE VEHICLE MATCHES:**
    - DO NOT ask clarifying questions
    - Immediately provide the vehicle details: "Oh, you're talking about the [Full Vehicle Name]! We have a [color] [year] [make] [model] [trim] for $[price] with [miles] miles..."
    - Example: Customer says "the Jeep" and there's only ONE Jeep in inventory → Respond with that Jeep's details immediately
    - Example: Customer says "the black one" and there's only ONE black vehicle → Respond with that vehicle's details immediately
  
  **IF MULTIPLE VEHICLES MATCH:**
    - Ask a clarifying question to help narrow it down
    - List ALL matching vehicles with key details (year, make, model, trim, color, price)
    - Examples:
      * "the Jeep" with 2 Jeeps → "We have multiple Jeeps! Do you mean the 2018 Jeep Wrangler Rubicon X (black, $25,000) or the 2016 Jeep Patriot Latitude (white, $6,200)?"
      * "the black one" with 2 black vehicles → "We have multiple black vehicles! Are you interested in the 2018 Jeep Wrangler Rubicon X ($25,000) or the 2015 Dodge Charger SXT ($18,500)?"
      * "the 4x4" with 2 4x4 vehicles → "We have multiple 4x4 vehicles! Do you mean the Jeep Wrangler Rubicon X or the Jeep Patriot Latitude?"
      * "the Wrangler" with 2 Wranglers → "We have multiple Wranglers! Are you looking at the 2018 Rubicon X ($25,000) or the 2020 Sport ($28,000)?"
  
  **IF NO VEHICLES MATCH:**
    - Tell them it's not currently available
    - Offer to help find something similar
    - Example: "I don't have that vehicle in our current inventory, but I'd be happy to help you find something similar!"

- CONVERSATIONAL FLOW:
  * Be friendly and conversational - have a back-and-forth dialogue
  * When asking clarifying questions, be specific and helpful
  * After customer clarifies, provide the EXACT details from the inventory
  * Use natural language - "Oh, you're talking about the Jeep Wrangler! We have a black 2018 Jeep Wrangler Rubicon X..."
  * Build on the conversation - reference what they said earlier

- CRITICAL MATCHING LOGIC:
  1. Search ALL vehicles in the inventory below for matches
  2. Count the number of matches:
     - ONE match → Provide details immediately (DO NOT ask clarifying questions)
     - MULTIPLE matches → Ask clarifying question listing all options
     - ZERO matches → Say it's not available and offer alternatives
  3. Always use EXACT details from the inventory (price, mileage, condition, down payment, color)
  4. Always mention pricing, mileage, condition, color (if available), and down payment options
  5. Encourage them to schedule a test drive
  6. Remember: If there's only ONE match, respond directly - don't ask "which one" when there's only one option!

SERVICES INFORMATION:
- Customers may ask about services like window tinting, detailing, repair, collision repair, vehicle wrapping, etc.
- Use the services data below to provide accurate pricing and information
- If a customer asks "How much is window tint?" or "What's the price for window tinting?", check the services data below
- Always provide the EXACT price from the services data - do not estimate or guess
- If a service is not listed, say "I don't have that service in our current offerings" or "Please call us for pricing on that service"
- Services pricing can change, so always use the most current data provided below

When customers want to schedule:
- Collect: name, phone number, email
- Ask what vehicle they're interested in (must be from inventory)
- Ask preferred date/time
- Confirm the appointment details

${vehicleContext}

${servicesContext}

Important: Be conversational and natural. Don't list all vehicles unless asked. Focus on helping the customer find what they need. Always verify vehicle details against the inventory before providing information.`

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
    })

    // Check if user is inquiring about a vehicle (detect vehicle-related questions)
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
    const vehicleKeywords = ['jeep', 'charger', 'wrangler', 'vehicle', 'car', 'truck', 'suv', 'price', 'how much', 'cost', 'interested', 'looking for']
    const isVehicleInquiry = vehicleKeywords.some(keyword => lastUserMessage.includes(keyword))
    
    // Send email notification if it's a vehicle inquiry (only once per session to avoid spam)
    if (isVehicleInquiry && lastUserMessage.length > 5) {
      // In production, you'd use Redis or similar for rate limiting
      // For now, we'll send notifications (you can add rate limiting later)
      sendEmail({
        to: 'unlimitedautoredford@gmail.com',
        subject: `🤖 New Chatbot Vehicle Inquiry - Unlimited Auto`,
        html: `
          <h2>New Vehicle Inquiry from Chatbot</h2>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
            <h3 style="margin-top: 0; color: #155724;">💬 Customer Message</h3>
            <p style="font-size: 16px; color: #333;">"${messages[messages.length - 1]?.content || 'N/A'}"</p>
          </div>
          <p><strong>Source:</strong> Website Chatbot</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-weight: bold; color: #856404;">💡 Tip: Check your chatbot logs to see the full conversation!</p>
          </div>
        `
      }).catch(err => {
        console.error('Failed to send chatbot inquiry email:', err)
      })
    }

    // Return streaming response - useChat hook works with toTextStreamResponse
    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Chat API error:', error)
    const errorMessage = error?.message || error?.toString() || 'Unknown error'
    return new Response(
      JSON.stringify({ error: `Failed to process chat message: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

