import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dealerSlug = searchParams.get('dealer') || 'unlimited-auto'
    const category = searchParams.get('category')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const supabase = createServerClient()

    // Get dealer ID
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', dealerSlug)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Build query
    let query = supabase
      .from('services')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: services, error } = await query

    if (error) {
      console.error('Error fetching services:', error)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    return NextResponse.json({ services: services || [] })
  } catch (error: any) {
    console.error('Services API error:', error)
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, category, price, price_unit, features, display_order, dealerSlug } = body

    if (!name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get dealer ID
    const dealerSlugToUse = dealerSlug || 'unlimited-auto'
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', dealerSlugToUse)
      .single()

    if (dealerError || !dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Insert service
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        dealer_id: dealer.id,
        name,
        description,
        category: category || null,
        price: price ? parseFloat(price) : null,
        price_unit: price_unit || 'flat',
        features: features || [],
        display_order: display_order || 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating service:', error)
      return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error: any) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: `Failed to create service: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, description, category, price, price_unit, features, display_order, is_active } = body

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Update service
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null
    if (price_unit !== undefined) updateData.price_unit = price_unit
    if (features !== undefined) updateData.features = features
    if (display_order !== undefined) updateData.display_order = display_order
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: service, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating service:', error)
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { error: `Failed to update service: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting service:', error)
      return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: `Failed to delete service: ${error.message}` },
      { status: 500 }
    )
  }
}

