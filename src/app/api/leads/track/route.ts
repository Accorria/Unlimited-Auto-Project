import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/auth'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('📥 Received incomplete lead tracking request:', {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      formStep: body.formStep,
      source: body.source
    })
    
    // Use service role client to bypass RLS
    const supabase = createServerClient()
    
    // Get dealer info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      console.error('Dealer not found:', dealerError)
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Only create incomplete lead if we have at least SOME contact information
    const hasContactInfo = (body.firstName || body.name || body.phone || body.email)
    
    if (!hasContactInfo) {
      // Don't create incomplete lead if no contact info at all
      return NextResponse.json({ 
        success: true, 
        message: 'No contact info provided - lead not tracked' 
      })
    }

    // Combine firstName and lastName if available
    const fullName = body.firstName && body.lastName 
      ? `${body.firstName} ${body.lastName}`.trim()
      : body.name || body.firstName || null

    // Check for existing incomplete lead (by name, phone, or email)
    // This prevents duplicate leads when someone fills out more info later
    let existingLead = null
    if (fullName || body.phone || body.email) {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('dealer_id', dealer.id)
        .eq('source', 'website_incomplete')
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: recentLeads, error: searchError } = await query

      if (!searchError && recentLeads && recentLeads.length > 0) {
        // Try to find matching lead by name, phone, or email
        existingLead = recentLeads.find((l: any) => {
          const leadName = l.name?.toLowerCase().trim()
          const leadPhone = l.phone?.replace(/[^0-9]/g, '')
          const leadEmail = l.email?.toLowerCase().trim()
          
          const incomingName = fullName?.toLowerCase().trim()
          const incomingPhone = body.phone?.replace(/[^0-9]/g, '')
          const incomingEmail = body.email?.toLowerCase().trim()
          
          // Match by name if provided
          if (incomingName && leadName && leadName === incomingName) {
            return true
          }
          // Match by phone if provided
          if (incomingPhone && leadPhone && leadPhone === incomingPhone) {
            return true
          }
          // Match by email if provided
          if (incomingEmail && leadEmail && leadEmail === incomingEmail) {
            return true
          }
          return false
        })

        // Also check if lead was created recently (within last hour) for same form step
        if (!existingLead && body.formStep) {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
          existingLead = recentLeads.find((l: any) => {
            const notes = l.notes ? JSON.parse(l.notes) : {}
            return notes.formStep === body.formStep && 
                   new Date(l.created_at) > new Date(oneHourAgo)
          })
        }
      }
    }

    // Prepare lead data - merge with existing if found
    const existingNotes = existingLead?.notes ? JSON.parse(existingLead.notes) : {}
    const fieldsCompleted = existingNotes.fieldsCompleted || []
    
    // Add new fields to completed list
    if (body.firstName && !fieldsCompleted.includes('firstName')) fieldsCompleted.push('firstName')
    if (body.lastName && !fieldsCompleted.includes('lastName')) fieldsCompleted.push('lastName')
    if (body.phone && !fieldsCompleted.includes('phone')) fieldsCompleted.push('phone')
    if (body.email && !fieldsCompleted.includes('email')) fieldsCompleted.push('email')

    // Track what they filled out - merge with existing
    const notesData = {
      incompleteApplication: true,
      formStep: body.formStep || existingNotes.formStep || 'unknown',
      fieldsCompleted: [...new Set(fieldsCompleted)], // Remove duplicates
      lastActivity: new Date().toISOString(),
      userAgent: req.headers.get('user-agent'),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      referer: req.headers.get('referer'),
      ...existingNotes // Preserve other existing note data
    }
    
    const leadData = {
      dealer_id: dealer.id,
      
      // Contact information - use existing or new, preferring non-null values
      name: fullName || existingLead?.name || null,
      phone: body.phone || existingLead?.phone || null,
      email: body.email || existingLead?.email || null,
      address: body.address || existingLead?.address || null,
      city: body.city || existingLead?.city || null,
      state: body.state || existingLead?.state || null,
      zip_code: body.zip || existingLead?.zip_code || null,
      message: body.message || existingLead?.message || null,
      
      // Financial information (if provided)
      income: body.income || existingLead?.income || null,
      net_monthly_income: body.income ? parseFloat(body.income.replace(/[^0-9.]/g, '')) : existingLead?.net_monthly_income || null,
      employer: body.employment || existingLead?.employer || null,
      down_payment: body.downPayment ? parseInt(body.downPayment.replace(/[^0-9]/g, '')) : existingLead?.down_payment || null,
      credit_score: body.creditScore ? parseInt(body.creditScore) : existingLead?.credit_score || null,
      
      // Attribution tracking
      source: 'website_incomplete',
      status: existingLead?.status || 'new',
      consent: false, // They didn't complete the form
      
      // Track what they filled out - merge with existing
      notes: JSON.stringify(notesData),
      
      // Timestamps
      created_at: existingLead?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('📝 Preparing lead data:', {
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      isUpdate: !!existingLead,
      existingLeadId: existingLead?.id
    })

    let lead
    let leadError

    if (existingLead) {
      // Update existing lead
      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', existingLead.id)
        .select()
        .single()
      
      lead = updatedLead
      leadError = updateError
      
      if (!leadError) {
        console.log('Incomplete lead updated successfully:', lead.id)
      }
    } else {
      // Insert new incomplete lead
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()
      
      lead = newLead
      leadError = insertError
      
      if (!leadError) {
        console.log('Incomplete lead tracked successfully:', lead.id)
      }
    }

    if (leadError) {
      console.error('Error saving incomplete lead:', leadError)
      return NextResponse.json({ error: 'Failed to track lead' }, { status: 500 })
    }
    
    // Always send email notification for incomplete leads if we have name OR email OR phone
    // Send for NEW leads or when NEW contact info is added to existing lead
    const hasNewContactInfo = (!existingLead) || 
                              (body.firstName && !existingLead?.name) || 
                              (body.phone && !existingLead?.phone) || 
                              (body.email && !existingLead?.email)
    
    // Always send email if we have at least name or email (most important for follow-up)
    // IMPORTANT: Always send if we have email (user specifically requested this)
    const shouldSendEmail = (body.email && body.email.includes('@')) || // Always send if valid email
                           (hasNewContactInfo && (body.firstName || body.email || body.phone || fullName))
    
    console.log('📧 Email decision:', {
      shouldSendEmail,
      hasEmail: !!(body.email && body.email.includes('@')),
      hasNewContactInfo,
      existingLeadId: existingLead?.id,
      bodyData: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        fullName
      }
    })
    
    if (shouldSendEmail) {
      const currentName = fullName || body.firstName || existingLead?.name || 'Unknown'
      const currentEmail = body.email || existingLead?.email || 'No email provided'
      const currentPhone = body.phone || existingLead?.phone || 'No phone provided'
      
      console.log('📧 Sending incomplete lead email notification:', {
        name: currentName,
        email: currentEmail,
        phone: currentPhone,
        isUpdate: !!existingLead,
        hasNewInfo: hasNewContactInfo
      })
      
      try {
        await sendEmail({
          to: 'unlimitedautoredford@gmail.com',
          subject: existingLead && hasNewContactInfo 
            ? `🚨 Incomplete Lead Updated: ${currentName}`
            : `🚨 Incomplete Lead: ${currentName}`,
          html: `
            <h2>${existingLead && hasNewContactInfo ? 'Incomplete Lead Updated' : 'Incomplete Lead Captured'}</h2>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ff9800;">
              <h3 style="margin-top: 0; color: #856404;">📞 CONTACT INFORMATION</h3>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Name:</strong> <span style="color: #333;">${currentName}</span></p>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Email:</strong> <span style="color: #333;">${currentEmail}</span></p>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Phone:</strong> <span style="color: #333;">${currentPhone}</span></p>
            </div>
            <p><strong>Form Type:</strong> ${body.formStep || 'Pre-approval Form'}</p>
            <p><strong>Source:</strong> ${body.source || 'Website'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            ${existingLead ? '<p style="color: #856404;"><em>⚠️ This lead was updated with new contact information.</em></p>' : '<p style="color: #856404;"><em>⚠️ This person started filling out the pre-approval form but didn\'t complete it. Follow up with them immediately!</em></p>'}
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; font-weight: bold; color: #155724;">✅ Action Required: Follow up with this lead as soon as possible!</p>
            </div>
          `
        })
        console.log('✅ Email notification sent successfully')
      } catch (emailError: any) {
        console.error('❌ Error sending email notification:', emailError)
        // Don't fail the request if email fails
      }
    } else {
      console.log('⏭️ Skipping email notification:', {
        hasNewContactInfo,
        hasName: !!body.firstName,
        hasEmail: !!body.email,
        hasPhone: !!body.phone,
        existingLeadId: existingLead?.id
      })
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Lead tracked successfully' 
    })

  } catch (error: any) {
    console.error('Lead tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
