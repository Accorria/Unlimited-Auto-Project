import { NextRequest } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { z } from 'zod'
import { createServerClient } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { sendSMSNotificationForLead } from '@/lib/sms'

// OpenAI client will automatically use OPENAI_API_KEY from environment

// Use nodejs runtime for Supabase compatibility
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId, vehicleId } = await req.json()

    // Get vehicle inventory for context
    const supabase = createServerClient()
    const { data: dealer } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    let vehicleContext = ''
    let servicesContext = ''
    let currentVehicleContext = ''
    
    // If vehicleId is provided, fetch that specific vehicle for context
    if (vehicleId && dealer) {
      console.log('🔍 Fetching current vehicle context for vehicleId:', vehicleId)
      const { data: currentVehicle, error: vehicleError } = await supabase
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
        .eq('id', vehicleId)
        .eq('dealer_id', dealer.id)
        .single()
      
      if (vehicleError) {
        console.error('❌ Error fetching current vehicle:', vehicleError)
      }
      
      if (!currentVehicle && vehicleId) {
        console.error('❌ Vehicle not found for vehicleId:', vehicleId, 'dealerId:', dealer.id)
      }
      
      if (currentVehicle) {
        console.log('✅ Current vehicle fetched:', {
          id: currentVehicle.id,
          name: `${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}${currentVehicle.trim ? ` ${currentVehicle.trim}` : ''}`,
          price: currentVehicle.price,
          down_payment: currentVehicle.down_payment
        })
        const fullName = `${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}${currentVehicle.trim ? ` ${currentVehicle.trim}` : ''}`.trim()
        const exactPrice = currentVehicle.price ? `$${currentVehicle.price.toLocaleString()}` : 'Call for Price'
        
        currentVehicleContext = `\n\n🚨🚨🚨 CRITICAL - CUSTOMER IS CURRENTLY VIEWING THIS SPECIFIC VEHICLE 🚨🚨🚨\n`
        currentVehicleContext += `\nTHE CUSTOMER CLICKED "TALK TO SALES AGENT" FROM THE DETAIL PAGE FOR THIS EXACT VEHICLE.\n`
        currentVehicleContext += `WHEN THEY ASK ABOUT "THE NOTE", "THE PAYMENT", "HOW MUCH", "THE PRICE", "THIS VEHICLE", "THE CAR I JUST CLICKED ON", OR ANY PRICE-RELATED QUESTION, THEY ARE REFERRING TO THIS VEHICLE BELOW.\n`
        currentVehicleContext += `\nYOU MUST USE THE EXACT PRICE BELOW - DO NOT USE ANY OTHER PRICE FROM THE GENERAL INVENTORY LIST.\n`
        currentVehicleContext += `IF THE GENERAL INVENTORY SHOWS A DIFFERENT PRICE FOR A SIMILAR VEHICLE, IGNORE IT - USE ONLY THE PRICE BELOW.\n\n`
        currentVehicleContext += `Vehicle ID: ${currentVehicle.id}\n`
        currentVehicleContext += `Full Name: ${fullName}\n`
        currentVehicleContext += `Year: ${currentVehicle.year} | Make: ${currentVehicle.make} | Model: ${currentVehicle.model}${currentVehicle.trim ? ` | Trim: ${currentVehicle.trim}` : ''}\n`
        if (currentVehicle.exterior_color) currentVehicleContext += `Color: ${currentVehicle.exterior_color}\n`
        currentVehicleContext += `\n💰 PRICE: ${exactPrice} 💰\n`
        currentVehicleContext += `⚠️ THIS IS THE EXACT PRICE - USE THIS PRICE AND NO OTHER PRICE ⚠️\n`
        if (currentVehicle.down_payment) currentVehicleContext += `Down Payment: $${currentVehicle.down_payment}\n`
        currentVehicleContext += `Mileage: ${currentVehicle.miles?.toLocaleString() || 'TBD'} miles\n`
        currentVehicleContext += `Condition: ${currentVehicle.condition || 'Good'}\n`
        if (currentVehicle.transmission) currentVehicleContext += `Transmission: ${currentVehicle.transmission}\n`
        if (currentVehicle.drivetrain) currentVehicleContext += `Drivetrain: ${currentVehicle.drivetrain}\n`
        if (currentVehicle.fuel_type) currentVehicleContext += `Fuel Type: ${currentVehicle.fuel_type}\n`
        if (currentVehicle.description) currentVehicleContext += `Description: ${currentVehicle.description}\n`
        currentVehicleContext += `\nCRITICAL RULES FOR THIS VEHICLE:\n`
        currentVehicleContext += `- When customer asks about "the note", "the payment", "financing", "monthly payment", or "car note", DO NOT calculate or estimate. Instead say: "I'd need some information from you first to calculate that. Could you fill out our financing form? I can help you get pre-approved!"\n`
        currentVehicleContext += `- When customer asks about price, miles, features, or vehicle details, use the information above (Price: ${exactPrice})\n`
        currentVehicleContext += `- DO NOT ask which vehicle - they are referring to the vehicle above\n`
        currentVehicleContext += `- DO NOT search the general inventory - use only the vehicle above\n`
        currentVehicleContext += `\n=== END OF CURRENT VEHICLE ===\n\n`
      }
    }
    
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
        vehicleContext += `CRITICAL: You MUST ONLY use the EXACT data below. NEVER guess, estimate, or use general knowledge.\n`
        vehicleContext += `If a vehicle is NOT in this list, say it's not available. If it IS in the list, use the EXACT price, mileage, and details shown below.\n\n`
        
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
          
          // CRITICAL: Use EXACT price from database - no guessing
          const exactPrice = v.price ? `$${v.price.toLocaleString()}` : 'Call for Price'
          
          vehicleContext += `Vehicle ID: ${v.id}\n`
          vehicleContext += `Full Name: ${fullName}\n`
          vehicleContext += `Searchable Names: ${searchableNames.join(', ')}\n`
          vehicleContext += `Year: ${v.year} | Make: ${v.make} | Model: ${v.model}${v.trim ? ` | Trim: ${v.trim}` : ''}\n`
          if (v.exterior_color) vehicleContext += `Color: ${v.exterior_color}\n`
          vehicleContext += `Price: ${exactPrice} (EXACT - DO NOT CHANGE THIS)\n`
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

    const systemPrompt = `You are a professional sales agent for Unlimited Auto, a used car dealership. Be DIRECT and HELPFUL - get straight to the point.

YOUR ROLE AS A SALES AGENT:
1. Answer questions DIRECTLY - don't ask unnecessary questions
2. CRITICAL: If there is a "CUSTOMER IS CURRENTLY VIEWING THIS VEHICLE" section above, the customer clicked from a vehicle detail page.
   - The vehicle in that section is the ONE they're talking about - DO NOT ask which vehicle
   - Use the vehicle details (price, miles, features) from that section
   - When they ask about "the note", "the payment", "financing", or "monthly payment", DO NOT calculate it. Instead say: "I'd need some information from you first to calculate that. Could you fill out our financing form? I can help you get pre-approved!"
3. If customer asks about vehicle details (price, miles, features, condition), provide the EXACT details from inventory immediately
4. If customer asks about financing/note/payment, redirect them to fill out the form - don't try to calculate it
5. If customer provides their info (name, phone, email), acknowledge it and move forward
6. Only ask questions if you NEED the information to help them
7. Be helpful and efficient - get to the point fast

YOUR PERSONALITY - BE DIRECT AND HELPFUL:
- Be friendly but get straight to the point
- Answer questions directly without asking follow-up questions unless necessary
- If customer says "What's the price on the 2019 Malibu?" → Give them the EXACT price from inventory immediately
- If customer provides their name/phone/email → Acknowledge it: "Thanks [Name]! I have your info. What can I help you with?"
- Don't ask "What's your name?" if they already provided it
- Don't ask "What are you driving now?" unless it's relevant to help them
- Be conversational but efficient - mobile users want quick answers
- Show enthusiasm: "Great choice! The [vehicle] is $[EXACT PRICE]..."
- When you have their info, offer next steps: "I've got your info. Would you like to schedule a test drive or have questions about financing?"

INFORMATION COLLECTION - ONLY WHEN NEEDED:
- If customer provides name/phone/email in their message, acknowledge it and use it
- Don't ask for information they already provided
- Only ask for additional info if it's needed to help them (e.g., scheduling needs date/time)
- Be efficient - mobile users want to get answers fast

REAL-TIME DATA UPDATES:
- The inventory and services data below is fetched fresh on every conversation
- This means you always have the most current information - vehicles added or removed, prices changed, services updated
- The data is updated in real-time, so you can confidently say "Yes, we have that vehicle" or "Our window tint is currently $80" based on the data below

CRITICAL RULES FOR VEHICLE INFORMATION - READ CAREFULLY:
- For vehicle-specific details (price, mileage, condition, specifications, down payment, color), you MUST ONLY use the EXACT data from the inventory below
- NEVER guess, estimate, or use general knowledge about vehicle models or typical pricing
- NEVER round prices or change them - use the EXACT price shown in the inventory
- If the inventory shows "Price: $15,500" → Say "$15,500" NOT "$20,000" or "$15,000" or any other number
- If the inventory shows "Price: Call for Price" → Say "Call for Price" NOT a guessed price
- If a customer asks "What's the price on the 2019 Malibu?" → Find the 2019 Malibu in the inventory and give the EXACT price shown
- If a vehicle is NOT in the inventory list, say "I don't have that vehicle in our current inventory"
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
  IF THERE IS A "CUSTOMER IS CURRENTLY VIEWING THIS VEHICLE" SECTION ABOVE:
    - The vehicle is already identified - DO NOT ask which vehicle
    - DO NOT search the general inventory list below
    - USE ONLY the vehicle information from the "CURRENTLY VIEWING" section above
    - When customer asks about vehicle details (price, miles, features), use the info from that section
    - When customer asks about "the note", "payment", or "financing", redirect to form: "I'd need some information from you first to calculate that. Could you fill out our financing form?"
    - Skip all matching logic below - the vehicle is already identified
  
  IF THERE IS NO "CURRENTLY VIEWING" SECTION:
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

INFORMATION TO COLLECT (like a dealer service form):
- Full name (first and last)
- Phone number
- Email address
- Current vehicle (year, make, model)
- What they're looking for (needs, preferences)
- Budget/price range
- Timeline (when looking to buy)
- Trade-in vehicle (if applicable)
- Priorities (price, features, reliability, etc.)
- Vehicle interest (specific vehicle from inventory)
- Preferred appointment date/time (if scheduling)

When customers want to schedule:
- CRITICAL: You MUST collect ALL required information before creating an appointment:
  1. Full name (first and last)
  2. Phone number (REQUIRED - ask for it if not provided)
  3. Email address
  4. Appointment date (e.g., "today", "tomorrow", "2024-01-15")
  5. Appointment time (e.g., "3pm", "2:00 PM", "14:00")
  6. Vehicle interest (optional, but preferred)
- DO NOT ask "Is this the best phone number for you?" if you don't have a phone number yet - ASK FOR IT FIRST
- DO NOT create an appointment until you have: name, phone, email, date, and time
- Once you have ALL required information, use the create_appointment function to schedule it
- After creating the appointment, confirm with: "Perfect! I've scheduled your appointment for [date] at [time]. One of our sales team members will reach out to you at [phone number] to confirm. Looking forward to seeing you!"
- NEVER mention a phone number for customers to call - we will reach out to them instead

VEHICLE FEATURES - DISCUSS IN DETAIL:
- When discussing vehicles, mention specific features from the inventory:
  * Transmission type (automatic, manual, CVT)
  * Drivetrain (FWD, RWD, AWD, 4x4)
  * Fuel type (gas, diesel, hybrid, electric)
  * Exterior color
  * Condition
  * Mileage
  * Down payment options
  * Any other specifications listed
- Talk about features like a salesperson: "This one has all-wheel drive, which is great for Michigan winters!"
- Compare vehicles when relevant: "The [Vehicle A] has [feature], while the [Vehicle B] has [different feature]..."

${currentVehicleContext}

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
      tools: {
        create_appointment: {
          description: 'Create an appointment for a customer. Use this when the customer wants to schedule a test drive or appointment and you have collected all required information: name, phone, email, date, and time.',
          inputSchema: z.object({
            name: z.string().describe('Customer full name (first and last)'),
            phone: z.string().describe('Customer phone number (required)'),
            email: z.string().email().describe('Customer email address'),
            appointmentDate: z.string().describe('Appointment date in YYYY-MM-DD format (e.g., "2024-01-15"). Convert relative dates like "today" or "tomorrow" to actual dates.'),
            appointmentTime: z.string().describe('Appointment time in HH:MM format (24-hour, e.g., "14:00" for 2:00 PM). Convert times like "3pm" to "15:00".'),
            vehicleInterest: z.string().optional().describe('Vehicle the customer is interested in (optional)'),
            vehicleId: z.string().optional().describe('Vehicle ID from inventory if known (optional)'),
            type: z.enum(['test_drive', 'service']).optional().describe('Appointment type: "test_drive" or "service"')
          }),
          execute: async ({ name, phone, email, appointmentDate, appointmentTime, vehicleInterest, vehicleId, type }) => {
            try {
              // Convert relative dates to actual dates
              let actualDate = appointmentDate
              const dateLower = appointmentDate.toLowerCase().trim()
              if (dateLower === 'today') {
                const today = new Date()
                // Use local date to avoid timezone issues
                actualDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
              } else if (dateLower === 'tomorrow') {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                actualDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
              }

              // Convert time formats to HH:MM
              let actualTime = appointmentTime
              // Handle formats like "3pm", "3 PM", "2:00 PM", etc.
              const timeMatch = appointmentTime.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)?/i)
              if (timeMatch) {
                let hours = parseInt(timeMatch[1])
                const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0
                const period = timeMatch[3]?.toLowerCase()
                
                if (period === 'pm' && hours !== 12) {
                  hours += 12
                } else if (period === 'am' && hours === 12) {
                  hours = 0
                }
                
                actualTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
              }

              // Get dealer info
              const appointmentSupabase = createServerClient()
              const { data: appointmentDealer, error: dealerError } = await appointmentSupabase
                .from('dealers')
                .select('*')
                .eq('slug', 'unlimited-auto')
                .single()

              if (dealerError || !appointmentDealer) {
                return {
                  success: false,
                  error: 'Dealer not found'
                }
              }

              // Create appointment datetime
              const appointmentDateTime = new Date(`${actualDate}T${actualTime}`)
              const endDateTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration

              // Find or create the lead
              let leadId = null
              const { data: existingLead } = await appointmentSupabase
                .from('leads')
                .select('id')
                .eq('dealer_id', appointmentDealer.id)
                .or(`email.eq.${email},phone.eq.${phone}`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

              if (existingLead) {
                leadId = existingLead.id
              } else {
                // Create new lead for this appointment
                const { data: newLead, error: leadError } = await appointmentSupabase
                  .from('leads')
                  .insert({
                    dealer_id: appointmentDealer.id,
                    name: name || '',
                    email: email || '',
                    phone: phone || '',
                    source: 'chatbot',
                    status: 'new',
                    consent: true,
                    notes: JSON.stringify({
                      appointmentRequested: true,
                      vehicleInterest,
                      service: type || 'test_drive'
                    })
                  })
                  .select()
                  .single()

                if (!leadError && newLead) {
                  leadId = newLead.id
                }
              }

              // Create appointment
              const appointmentData = {
                dealer_id: appointmentDealer.id,
                lead_id: leadId,
                vehicle_id: vehicleId || null,
                type: type || 'test_drive',
                start_at: appointmentDateTime.toISOString(),
                end_at: endDateTime.toISOString(),
                status: 'scheduled',
                location: '24645 Plymouth Rd Unit A, Redford Township, MI 48239',
                notes: JSON.stringify({
                  name,
                  email,
                  phone,
                  vehicleInterest,
                  service: type || 'test_drive',
                  message: `Appointment scheduled via chatbot`
                })
              }

              const { data: appointment, error: appointmentError } = await appointmentSupabase
                .from('appointments')
                .insert(appointmentData)
                .select()
                .single()

              if (appointmentError) {
                console.error('Error creating appointment:', appointmentError)
                return {
                  success: false,
                  error: appointmentError.message || 'Failed to create appointment'
                }
              }

              // Send email notification
              try {
                const appointmentDateFormatted = appointmentDateTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
                const appointmentTimeFormatted = appointmentDateTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })

                await sendEmail({
                  to: 'unlimitedautoredford@gmail.com',
                  subject: `📅 New Appointment Request: ${name || 'Customer'}`,
                  html: `
                    <h2>New Appointment Request</h2>
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
                      <h3 style="margin-top: 0; color: #155724;">📅 Appointment Details</h3>
                      <p style="font-size: 16px; margin: 10px 0;"><strong>Date:</strong> <span style="color: #333;">${appointmentDateFormatted}</span></p>
                      <p style="font-size: 16px; margin: 10px 0;"><strong>Time:</strong> <span style="color: #333;">${appointmentTimeFormatted}</span></p>
                      <p style="font-size: 16px; margin: 10px 0;"><strong>Type:</strong> <span style="color: #333;">${type || 'Test Drive'}</span></p>
                    </div>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
                      <h3 style="margin-top: 0; color: #856404;">👤 Contact Information</h3>
                      <p style="font-size: 16px; margin: 10px 0;"><strong>Name:</strong> <span style="color: #333;">${name || 'Not provided'}</span></p>
                      <p style="font-size: 16px; margin: 10px 0;"><strong>Email:</strong> <span style="color: #333;">${email || 'Not provided'}</span></p>
                      <p style="font-size: 16px; margin: 10px 0;"><strong>Phone:</strong> <span style="color: #333;">${phone || 'Not provided'}</span></p>
                    </div>
                    ${vehicleInterest ? `<p><strong>Vehicle Interest:</strong> ${vehicleInterest}</p>` : ''}
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
                      <p style="margin: 0; font-weight: bold; color: #155724;">✅ Please confirm this appointment with the customer!</p>
                    </div>
                  `
                })

                // Also send confirmation email to customer if email provided
                if (email) {
                  await sendEmail({
                    to: email,
                    subject: `Appointment Confirmation - Unlimited Auto Repair & Collision`,
                    html: `
                      <h2>Your Appointment Has Been Requested</h2>
                      <p>Thank you for scheduling with Unlimited Auto Repair & Collision!</p>
                      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
                        <h3 style="margin-top: 0; color: #155724;">📅 Your Appointment</h3>
                        <p style="font-size: 16px; margin: 10px 0;"><strong>Date:</strong> ${appointmentDateFormatted}</p>
                        <p style="font-size: 16px; margin: 10px 0;"><strong>Time:</strong> ${appointmentTimeFormatted}</p>
                        <p style="font-size: 16px; margin: 10px 0;"><strong>Location:</strong> 24645 Plymouth Rd Unit A, Redford Township, MI 48239</p>
                      </div>
                      <p>We'll reach out to confirm your appointment. If you need to reschedule, please reply to this email or we'll contact you.</p>
                      <p>We look forward to serving you!</p>
                    `
                  })
                }

                console.log('✅ Appointment notification emails sent successfully')
              } catch (emailError: any) {
                console.error('❌ Error sending appointment emails:', emailError)
                // Don't fail the request if email fails
              }

              // Send SMS notifications to configured phone numbers
              if (leadId) {
                try {
                  const { data: lead } = await appointmentSupabase
                    .from('leads')
                    .select('*')
                    .eq('id', leadId)
                    .single()

                  if (lead) {
                    const { data: dealerWithPhones } = await appointmentSupabase
                      .from('dealers')
                      .select('sms_phone_numbers')
                      .eq('id', appointmentDealer.id)
                      .single()

                    if (dealerWithPhones?.sms_phone_numbers) {
                      const phoneNumbers = Array.isArray(dealerWithPhones.sms_phone_numbers) 
                        ? dealerWithPhones.sms_phone_numbers 
                        : []
                      
                      if (phoneNumbers.length > 0) {
                        await sendSMSNotificationForLead(lead, phoneNumbers)
                        console.log('✅ SMS notifications sent to', phoneNumbers.length, 'phone number(s)')
                      }
                    }
                  }
                } catch (smsError: any) {
                  console.error('❌ Error sending SMS notifications:', smsError)
                  // Don't fail the request if SMS fails
                }
              }

              return {
                success: true,
                appointmentId: appointment.id,
                message: 'Appointment created successfully'
              }
            } catch (error: any) {
              console.error('Error creating appointment:', error)
              return {
                success: false,
                error: error.message || 'Failed to create appointment'
              }
            }
          }
        }
      }
    })

    // Track conversation in messages table
    if (dealer && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        try {
          // Store user message in messages table
          await supabase
            .from('messages')
            .insert({
              dealer_id: dealer.id,
              channel: 'website_chat',
              direction: 'inbound',
              from_address: sessionId || 'anonymous',
              body: lastMessage.content,
              status: 'received',
              created_at: new Date().toISOString()
            })
        } catch (err) {
          console.error('Error tracking conversation:', err)
          // Don't fail the request if tracking fails
        }
      }
    }

    // Extract customer information from conversation
    const customerInfo: any = {
      name: null,
      phone: null,
      email: null,
      currentVehicle: null,
      needs: null,
      budget: null,
      timeline: null,
      tradeIn: null,
      priorities: null,
      vehicleInterest: vehicleId || null
    }

    // Try to extract information from conversation
    // Use original case for better name extraction
    const conversationText = messages.map((m: any) => m.content).join(' ')
    
    // Extract name (look for "my name is", "I'm", "call me", etc.)
    // Improved to capture full names (first + last + middle)
    const namePatterns = [
      /(?:my name is|i'm|i am|call me|this is|name is|it's|it is)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
      /name[:\s]+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i,
      /(?:^|\s)([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s|$)/, // Capitalized first and last name together
    ]
    for (const pattern of namePatterns) {
      const match = conversationText.match(pattern)
      if (match && match[1]) {
        const extractedName = match[1].trim()
        // Only use if it looks like a real name (has at least 2 characters, not just single letter)
        if (extractedName.length >= 2 && !extractedName.match(/^\d+$/)) {
          customerInfo.name = extractedName
          break
        }
      }
    }

    // Extract phone (look for phone number patterns - improved)
    // Handle various formats: (313) 766-4475, 313-766-4475, 3137664475, +13137664475, etc.
    const phonePatterns = [
      /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g, // Standard US format
      /(\d{10})/g, // 10 digits in a row
      /(?:phone|call|number)[:\s]+([\d\s\-\(\)\+]+)/i, // "phone: 313-766-4475"
    ]
    for (const pattern of phonePatterns) {
      const phoneMatch = conversationText.match(pattern)
      if (phoneMatch) {
        // Clean up the phone number
        let phone = phoneMatch[0].replace(/[-.\s()]/g, '')
        // Remove leading +1 if present, we'll add it back if needed
        if (phone.startsWith('+1')) {
          phone = phone.substring(2)
        } else if (phone.startsWith('1') && phone.length === 11) {
          phone = phone.substring(1)
        }
        // Only use if it's 10 digits
        if (phone.length === 10 && /^\d+$/.test(phone)) {
          customerInfo.phone = phone
          break
        }
      }
    }

    // Extract email
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    const emailMatch = conversationText.match(emailPattern)
    if (emailMatch) {
      customerInfo.email = emailMatch[0].trim()
      
      // If we have an email but no name, try to extract name from email
      // e.g., "mike.test@gmail.com" -> "Mike Test"
      if (!customerInfo.name && emailMatch[0]) {
        const emailLocal = emailMatch[0].split('@')[0]
        // If email has dots or underscores, try to create a name from it
        if (emailLocal.includes('.') || emailLocal.includes('_')) {
          const nameParts = emailLocal.split(/[._]/).filter((p: string) => p.length > 0)
          if (nameParts.length >= 1) {
            // Capitalize first letter of each part
            const formattedName = nameParts
              .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(' ')
            customerInfo.name = formattedName
          }
        }
      }
    }

    // Create or update lead if we have enough information
    if (dealer && (customerInfo.name || customerInfo.phone || customerInfo.email)) {
      try {
        // Check if lead already exists (by phone or email)
        let existingLead = null
        if (customerInfo.phone) {
          const { data } = await supabase
            .from('leads')
            .select('id')
            .eq('dealer_id', dealer.id)
            .eq('phone', customerInfo.phone)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          existingLead = data
        }
        
        if (!existingLead && customerInfo.email) {
          const { data } = await supabase
            .from('leads')
            .select('id')
            .eq('dealer_id', dealer.id)
            .eq('email', customerInfo.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          existingLead = data
        }

        if (existingLead) {
          // Get existing notes
          const { data: leadData } = await supabase
            .from('leads')
            .select('notes')
            .eq('id', existingLead.id)
            .single()
          
          let existingNotes: any = {}
          try {
            existingNotes = leadData?.notes ? JSON.parse(leadData.notes) : {}
          } catch {
            existingNotes = {}
          }

          // Update existing lead with new information
          await supabase
            .from('leads')
            .update({
              name: customerInfo.name || undefined,
              phone: customerInfo.phone || undefined,
              email: customerInfo.email || undefined,
              vehicle_id: customerInfo.vehicleInterest || undefined,
              notes: JSON.stringify({
                ...existingNotes,
                currentVehicle: customerInfo.currentVehicle || existingNotes?.currentVehicle,
                needs: customerInfo.needs || existingNotes?.needs,
                budget: customerInfo.budget || existingNotes?.budget,
                timeline: customerInfo.timeline || existingNotes?.timeline,
                tradeIn: customerInfo.tradeIn || existingNotes?.tradeIn,
                priorities: customerInfo.priorities || existingNotes?.priorities,
                lastChatUpdate: new Date().toISOString()
              }),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLead.id)
        } else {
          // Create new lead
          const leadData = {
            dealer_id: dealer.id,
            name: customerInfo.name || '',
            phone: customerInfo.phone || '',
            email: customerInfo.email || '',
            vehicle_id: customerInfo.vehicleInterest || null,
            source: 'sales_agent_chat',
            status: 'new',
            message: `Sales Agent Chat - ${customerInfo.needs || 'Customer inquiry'}`,
            notes: JSON.stringify({
              currentVehicle: customerInfo.currentVehicle,
              needs: customerInfo.needs,
              budget: customerInfo.budget,
              timeline: customerInfo.timeline,
              tradeIn: customerInfo.tradeIn,
              priorities: customerInfo.priorities,
              conversationSession: sessionId,
              createdFromChat: true
            }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const { data: newLead, error: insertError } = await supabase
            .from('leads')
            .insert(leadData)
            .select()
            .single()

          // Send email and SMS notifications for new lead
          if (newLead && !insertError) {
            // Send email notification
            try {
              await sendEmail({
                to: 'unlimitedautoredford@gmail.com',
                subject: `🚗 New Lead from Sales Agent Chat: ${newLead.name || 'Customer'}`,
                html: `
                  <h2>New Lead from Sales Agent Chat</h2>
                  <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
                    <h3 style="margin-top: 0; color: #856404;">👤 Contact Information</h3>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>Name:</strong> <span style="color: #333;">${newLead.name || 'Not provided'}</span></p>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>Email:</strong> <span style="color: #333;">${newLead.email || 'Not provided'}</span></p>
                    <p style="font-size: 16px; margin: 10px 0;"><strong>Phone:</strong> <span style="color: #333;">${newLead.phone || 'Not provided'}</span></p>
                  </div>
                  ${newLead.message ? `<p><strong>Message:</strong> ${newLead.message}</p>` : ''}
                  <p><strong>Source:</strong> Sales Agent Chat</p>
                  <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                  <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0; font-weight: bold; color: #155724;">✅ New lead from chatbot - follow up ASAP!</p>
                  </div>
                `
              })
              console.log('✅ Email notification sent for new lead')
            } catch (emailError: any) {
              console.error('❌ Error sending email notification:', emailError)
              // Don't fail the request if email fails
            }

            // Send SMS notification
            try {
              const { data: dealerWithPhones } = await supabase
                .from('dealers')
                .select('sms_phone_numbers')
                .eq('id', dealer.id)
                .single()

              if (dealerWithPhones?.sms_phone_numbers) {
                const phoneNumbers = Array.isArray(dealerWithPhones.sms_phone_numbers) 
                  ? dealerWithPhones.sms_phone_numbers 
                  : []
                
                if (phoneNumbers.length > 0) {
                  await sendSMSNotificationForLead(newLead, phoneNumbers)
                  console.log('✅ SMS notifications sent to', phoneNumbers.length, 'phone number(s)')
                } else {
                  console.log('⚠️ No phone numbers configured for SMS notifications')
                }
              } else {
                console.log('⚠️ No SMS phone numbers configured in dealer settings')
              }
            } catch (smsError: any) {
              console.error('❌ Error sending SMS notifications:', smsError)
              // Don't fail the request if SMS fails
            }
          }
        }
      } catch (err) {
        console.error('Error creating/updating lead:', err)
        // Don't fail the request if lead creation fails
      }
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

