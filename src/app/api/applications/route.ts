import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@/lib/auth'
import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received credit application:', {
      dealerName: body?.dealerName,
      applicant: body?.applicant?.fullName,
      phone: body?.applicant?.phone,
      vehicleId: body?.financing?.vehicleId,
      vehicle: `${body?.financing?.year} ${body?.financing?.make} ${body?.financing?.model}`,
      salesPrice: body?.financing?.salesPrice,
    })

    // Use service role client to bypass RLS
    const supabase = createServerClient()

    // First, get the dealer ID from the slug
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id')
      .eq('slug', 'unlimited-auto')
      .single()

    if (dealerError || !dealer) {
      console.error('Error fetching dealer:', dealerError)
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
    }

    // Prepare comprehensive lead data from credit application
    const leadData = {
      dealer_id: dealer.id,
      
      // Contact information
      name: body.applicant?.fullName || '',
      phone: body.applicant?.phone || '',
      email: body.applicant?.email || '',
      address: body.applicant?.address || '',
      city: body.applicant?.city || '',
      state: body.applicant?.state || '',
      zip_code: body.applicant?.zip || '',
      
      // Financial information
      income: body.applicant?.grossAnnualIncome || '',
      net_monthly_income: body.applicant?.grossAnnualIncome ? 
        parseFloat(body.applicant.grossAnnualIncome.replace(/[^0-9.]/g, '')) / 12 : null,
      employer: body.applicant?.employer || '',
      down_payment: body.financing?.downPayment ? 
        parseInt(body.financing.downPayment.replace(/[^0-9]/g, '')) : null,
      
      // Vehicle information
      vehicle_id: body.financing?.vehicleId || null,
      message: `Vehicle: ${body.financing?.year} ${body.financing?.make} ${body.financing?.model} | Sales Price: ${body.financing?.salesPrice}`,
      
      // Attribution tracking
      source: 'credit_application',
      status: 'new',
      consent: body.consentCallSms || false,
      
      // Additional credit application data (store in notes for now)
      notes: JSON.stringify({
        // Applicant details
        applicant: {
          dob: body.applicant?.dob,
          ssn: body.applicant?.ssn,
          housingStatus: body.applicant?.housingStatus,
          howLongAtAddress: body.applicant?.housingStatus,
          monthlyPayment: body.applicant?.monthlyPayment,
          position: body.applicant?.position,
          workPhone: body.applicant?.workPhone,
          incomeType: body.applicant?.incomeType,
          otherIncomeSource: body.applicant?.otherIncomeSource,
          previousEmployerOrSchool: body.applicant?.previousEmployerOrSchool,
          previousHowLong: body.applicant?.previousHowLong,
          employerAddress: body.applicant?.employerAddress
        },
        
        // Joint applicant
        jointApplicant: body.jointApplicantEnabled ? {
          fullName: body.jointApplicant?.fullName,
          phone: body.jointApplicant?.phone,
          employer: body.jointApplicant?.employer,
          incomeType: body.jointApplicant?.incomeType
        } : null,
        
        // Vehicle details
        vehicle: {
          vehicleId: body.financing?.vehicleId,
          condition: body.financing?.condition,
          year: body.financing?.year,
          make: body.financing?.make,
          model: body.financing?.model,
          vin: body.financing?.retailLeaseVin,
          mileage: body.financing?.mileage,
          bookSource: body.financing?.usedValueGuide,
          bookValue: body.financing?.bookValue,
          tradeYear: body.financing?.tradeYear,
          tradeMake: body.financing?.tradeMake,
          tradeModel: body.financing?.tradeModel
        },
        
        // Financing terms
        financing: {
          salesPrice: body.financing?.salesPrice,
          downPayment: body.financing?.downPayment,
          netTrade: body.financing?.netTrade,
          amountFinanced: body.financing?.amountFinanced,
          termMonths: body.financing?.termMonths,
          program: body.financing?.program
        },
        
        // References
        references: {
          autoCreditReference: body.autoCreditReference,
          otherCreditReference: body.otherCreditReference,
          nearestRelative: body.nearestRelative,
          friendRelative: body.friendRelative
        },
        
        // Signatures
        signatures: {
          applicantSignature: body.applicantSignature,
          applicantSignatureName: body.applicantSignatureName,
          applicantSignatureDate: body.applicantSignatureDate,
          jointApplicantSignature: body.jointApplicantSignature,
          jointApplicantSignatureName: body.jointApplicantSignatureName,
          jointApplicantSignatureDate: body.jointApplicantSignatureDate
        },
        
        // Dealer info
        dealerName: body.dealerName,
        dealerNumber: body.dealerNumber,
        
        // Application metadata
        applicationType: 'credit_application',
        submittedAt: new Date().toISOString()
      }),
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the credit application as a lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (leadError) {
      console.error('Error inserting lead:', leadError)
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
    }

    console.log('Credit application submitted successfully:', lead.id)
    
    // Send email notification to dealer
    if (resend) {
      try {
        await resend.emails.send({
        from: 'noreply@unlimitedauto.com',
        to: 'unlimitedautoredford@gmail.com',
        subject: `New Credit Application from ${lead.name} - Unlimited Auto`,
        html: `
          <h2>New Credit Application Received!</h2>
          <p><strong>Name:</strong> ${lead.name}</p>
          <p><strong>Phone:</strong> ${lead.phone}</p>
          <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
          <p><strong>Address:</strong> ${lead.address || 'N/A'}</p>
          <p><strong>City:</strong> ${lead.city || 'N/A'}</p>
          <p><strong>State:</strong> ${lead.state || 'N/A'}</p>
          <p><strong>Zip:</strong> ${lead.zip_code || 'N/A'}</p>
          <p><strong>Income:</strong> ${lead.income || 'N/A'}</p>
          <p><strong>Net Monthly Income:</strong> ${lead.net_monthly_income || 'N/A'}</p>
          <p><strong>Employer:</strong> ${lead.employer || 'N/A'}</p>
          <p><strong>Down Payment:</strong> ${lead.down_payment || 'N/A'}</p>
          <p><strong>Vehicle:</strong> ${body.financing?.year} ${body.financing?.make} ${body.financing?.model}</p>
          <p><strong>Vehicle ID:</strong> ${body.financing?.vehicleId || 'N/A'}</p>
          <p><strong>Sales Price:</strong> ${body.financing?.salesPrice || 'N/A'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Full Application Data:</strong></p>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(body, null, 2)}
          </pre>
        `,
      })
        console.log('Credit application email notification sent successfully')
      } catch (emailError) {
        console.error('Error sending credit application email notification:', emailError)
        // Continue even if email fails
      }
    } else {
      console.log('Resend API key not configured - skipping email notification')
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead.id,
      message: 'Credit application submitted successfully! We\'ll contact you within 24 hours.' 
    })

  } catch (error: any) {
    console.error('Credit application API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
