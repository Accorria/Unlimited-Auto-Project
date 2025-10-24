import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received credit application:', {
      dealerName: body?.dealerName,
      applicant: body?.applicant?.fullName,
      phone: body?.applicant?.phone,
      vehicle: `${body?.vehicle?.year} ${body?.vehicle?.make} ${body?.vehicle?.model}`,
      vin: body?.vehicle?.vin,
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
      message: `Vehicle: ${body.vehicle?.year} ${body.vehicle?.make} ${body.vehicle?.model} | VIN: ${body.vehicle?.vin} | Sales Price: ${body.financing?.salesPrice}`,
      
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
          condition: body.vehicle?.condition,
          year: body.vehicle?.year,
          make: body.vehicle?.make,
          model: body.vehicle?.model,
          vin: body.vehicle?.vin,
          mileage: body.vehicle?.mileage,
          bookSource: body.vehicle?.bookSource,
          bookValue: body.vehicle?.bookValue,
          tradeYear: body.vehicle?.tradeYear,
          tradeMake: body.vehicle?.tradeMake,
          tradeModel: body.vehicle?.tradeModel
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
    
    // TODO: Send email notification to dealer
    // TODO: Send confirmation email to customer
    // TODO: Integrate with CRM system
    // TODO: Send to lender APIs

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
