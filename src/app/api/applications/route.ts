import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@/lib/auth'
import { Resend } from 'resend'
import { sendSMSNotificationForLead, sendSMS } from '@/lib/sms'
import { sendEmail } from '@/lib/email'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Received credit application:', {
      dealerName: body?.dealerName,
      applicant: `${body?.applicant?.firstName || ''} ${body?.applicant?.lastName || ''}`.trim(),
      phone: body?.applicant?.homePhone,
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
      name: `${body.applicant?.firstName || ''} ${body.applicant?.lastName || ''}`.trim(),
      phone: body.applicant?.homePhone || '',
      email: body.applicant?.email || '',
      address: `${body.applicant?.streetAddress || ''} ${body.applicant?.aptNumber || ''}`.trim(),
      city: body.applicant?.city || '',
      state: body.applicant?.state || '',
      zip_code: body.applicant?.zip || '',
      
      // Financial information
      income: body.applicant?.grossAnnualSalary || '',
      net_monthly_income: body.applicant?.grossAnnualSalary ? 
        parseFloat(body.applicant.grossAnnualSalary.replace(/[^0-9.]/g, '')) / 12 : null,
      employer: body.applicant?.employerName || '',
      // Message - include vehicle information
      message: body.financing?.vehicleId ? 
        `Credit application for vehicle: ${body.financing?.year || ''} ${body.financing?.make || ''} ${body.financing?.model || ''}`.trim() :
        'Credit application submitted',
      
      // Attribution tracking
      source: 'credit_application',
      status: 'new',
      consent: body.consentCallSms || false,
      
      // Document attachments
      documents: body.documents ? JSON.stringify(body.documents) : null,
      
      // Additional credit application data (store in notes for now)
      notes: JSON.stringify({
        // Applicant details
        applicant: {
          email: body.applicant?.email,
          dob: body.applicant?.dob,
          ssn: body.applicant?.ssn,
          housingStatus: body.applicant?.housingStatus,
          howLongAtAddress: body.applicant?.housingStatus,
          monthlyPayment: body.applicant?.monthlyPayment,
          position: body.applicant?.position,
          workPhone: body.applicant?.workPhone,
          incomeType: body.applicant?.incomeType,
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
    console.log('📝 Attempting to insert complete credit application into database:', {
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      dealer_id: leadData.dealer_id
    })

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    // If DB insert fails (e.g., RLS or env misconfig in prod), don't block the user.
    // We'll still send the notification email so the dealership receives the application.
    if (leadError) {
      console.error('❌ ERROR inserting complete credit application lead:', {
        error: leadError,
        message: leadError.message,
        details: leadError.details,
        hint: leadError.hint,
        code: leadError.code,
        leadData: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          dealer_id: leadData.dealer_id
        }
      })
      // Log this as a critical error but continue so email still sends
    } else {
      console.log('✅ Successfully inserted complete credit application lead into database:', {
        leadId: lead?.id,
        name: lead?.name,
        email: lead?.email,
        phone: lead?.phone,
        source: lead?.source
      })
    }

    console.log('Credit application submitted successfully:', lead?.id || 'No lead ID (DB insert may have failed)')
    
    // Fetch vehicle details if vehicleId is provided but vehicle info is missing
    let vehicleInfo = {
      year: body.financing?.year,
      make: body.financing?.make,
      model: body.financing?.model,
      trim: body.financing?.trim,
      price: body.financing?.salesPrice || body.financing?.price,
      mileage: body.financing?.mileage,
      vin: body.financing?.vin || body.financing?.retailLeaseVin,
      condition: body.financing?.condition
    }
    
    if (body.financing?.vehicleId && (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model)) {
      console.log('Fetching vehicle details for vehicleId:', body.financing.vehicleId)
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('year, make, model, trim, price, miles, vin, condition')
        .eq('id', body.financing.vehicleId)
        .single()
      
      if (!vehicleError && vehicle) {
        vehicleInfo = {
          year: vehicleInfo.year || vehicle.year,
          make: vehicleInfo.make || vehicle.make,
          model: vehicleInfo.model || vehicle.model,
          trim: vehicleInfo.trim || vehicle.trim,
          price: vehicleInfo.price || vehicle.price,
          mileage: vehicleInfo.mileage || vehicle.miles,
          vin: vehicleInfo.vin || vehicle.vin,
          condition: vehicleInfo.condition || vehicle.condition
        }
        console.log('Vehicle details fetched:', vehicleInfo)
      }
    }
    
    // Send email notification to dealer
    if (resend) {
      try {
        console.log('Attempting to send credit application email via Resend...')
        const emailResult = await resend.emails.send({
          from: 'Unlimited Auto <onboarding@resend.dev>',
        to: 'unlimitedautoredford@gmail.com',
        subject: `New Pre-approval Application from ${lead?.name || body.applicant?.firstName || 'Applicant'}${vehicleInfo.year && vehicleInfo.make && vehicleInfo.model ? ` - ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : ''} - Unlimited Auto`,
        html: `
          <h2>New Pre-approval Application Received!</h2>
          
          ${body.financing?.vehicleId || vehicleInfo.year || vehicleInfo.make || vehicleInfo.model ? `
          <div style="background: #fff4e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="color: #2c3e50; margin-top: 0;">🚗 Vehicle Information</h3>
            ${body.financing?.vehicleId ? `<p><strong>Vehicle ID:</strong> ${body.financing.vehicleId}</p>` : ''}
            ${vehicleInfo.year || vehicleInfo.make || vehicleInfo.model ? `
            <p><strong>Vehicle:</strong> ${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}${vehicleInfo.trim ? ` ${vehicleInfo.trim}` : ''}</p>
            ` : ''}
            ${vehicleInfo.price ? `<p><strong>Price:</strong> $${parseFloat(String(vehicleInfo.price || '0')).toLocaleString()}</p>` : ''}
            ${body.financing?.salesPrice ? `<p><strong>Sales Price:</strong> $${parseFloat(String(body.financing.salesPrice || '0').replace(/[^0-9.]/g, '')).toLocaleString()}</p>` : ''}
            ${body.financing?.downPayment && body.financing.downPayment !== "" ? `<p><strong>Down Payment:</strong> $${parseFloat(String(body.financing.downPayment || '0').replace(/[^0-9.]/g, '')).toLocaleString()}</p>` : '<p><strong>Down Payment:</strong> Not selected</p>'}
            ${body.financing?.netTrade ? `<p><strong>Net Trade Value:</strong> $${parseFloat(String(body.financing.netTrade).replace(/[^0-9.]/g, '')).toLocaleString()}</p>` : ''}
            ${body.financing?.loanAmount ? `<p><strong>Loan Amount:</strong> $${parseFloat(body.financing.loanAmount).toLocaleString()}</p>` : ''}
            ${body.financing?.hasTradeIn && (body.financing?.tradeMake || body.financing?.tradeModel || body.financing?.tradeMileage) ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196f3;">
              <h4 style="color: #1976d2; margin-top: 0; margin-bottom: 10px;">🔄 Trade-In Vehicle Information</h4>
              ${body.financing?.tradeMake ? `<p><strong>Trade-In Make:</strong> ${body.financing.tradeMake}</p>` : ''}
              ${body.financing?.tradeModel ? `<p><strong>Trade-In Model:</strong> ${body.financing.tradeModel}</p>` : ''}
              ${body.financing?.tradeMileage ? `<p><strong>Trade-In Mileage:</strong> ${body.financing.tradeMileage.replace(/,/g, '')} miles</p>` : ''}
              ${body.financing?.tradeYear ? `<p><strong>Trade-In Year:</strong> ${body.financing.tradeYear}</p>` : ''}
            </div>
            ` : ''}
            ${body.financing?.termMonths ? `<p><strong>Loan Term:</strong> ${body.financing.termMonths} months</p>` : ''}
            ${body.financing?.monthlyPayment ? `<p><strong>Estimated Monthly Payment:</strong> $${parseFloat(body.financing.monthlyPayment).toLocaleString()}</p>` : ''}
            ${vehicleInfo.condition ? `<p><strong>Condition:</strong> ${vehicleInfo.condition}</p>` : ''}
            ${vehicleInfo.vin ? `<p><strong>VIN:</strong> ${vehicleInfo.vin}</p>` : ''}
            ${vehicleInfo.mileage ? `<p><strong>Mileage:</strong> ${vehicleInfo.mileage.toLocaleString()} miles</p>` : ''}
          </div>
          ` : ''}
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Applicant Information</h3>
            <p><strong>Name:</strong> ${body.applicant?.firstName} ${body.applicant?.middleInitial} ${body.applicant?.lastName} ${body.applicant?.srJr ? `(${body.applicant.srJr})` : ''}</p>
            <p><strong>Phone:</strong> ${body.applicant?.homePhone || 'N/A'}</p>
            <p><strong>Address:</strong> ${body.applicant?.streetAddress || 'N/A'} ${body.applicant?.aptNumber ? `Apt ${body.applicant.aptNumber}` : ''}</p>
            <p><strong>City, State, ZIP:</strong> ${body.applicant?.city || 'N/A'}, ${body.applicant?.state || 'N/A'} ${body.applicant?.zip || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${body.applicant?.dateOfBirth ? new Date(body.applicant.dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}</p>
            <p><strong>Age:</strong> ${body.applicant?.age || (body.applicant?.dateOfBirth ? (() => {
              try {
                const birthDate = new Date(body.applicant.dateOfBirth + 'T00:00:00');
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return age > 0 ? age : 'N/A';
              } catch {
                return 'N/A';
              }
            })() : 'N/A')}</p>
            <p><strong>SSN (Last 4):</strong> ${body.applicant?.socialSecurityNumber ? `****-****-${body.applicant.socialSecurityNumber}` : 'N/A'}</p>
            <p><strong>Housing Status:</strong> ${body.applicant?.housingStatus || 'N/A'}</p>
            <p><strong>Monthly Payment:</strong> ${body.applicant?.monthlyPayment || 'N/A'}</p>
            <p><strong>How Long at Address:</strong> ${body.applicant?.howLongYears || '0'} years, ${body.applicant?.howLongMonths || '0'} months</p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Employment Information</h3>
            <p><strong>Employment Status:</strong> ${body.applicant?.employmentStatus ? body.applicant.employmentStatus.charAt(0).toUpperCase() + body.applicant.employmentStatus.slice(1).replace('-', '-') : 'N/A'}</p>
            <p><strong>Employer:</strong> ${body.applicant?.employerName || 'N/A'}</p>
            <p><strong>Position:</strong> ${body.applicant?.positionTitle || 'N/A'}</p>
            <p><strong>Work Phone:</strong> ${body.applicant?.workPhone || 'N/A'}</p>
            <p><strong>Employer Address:</strong> ${body.applicant?.employerAddress || 'N/A'}</p>
            <p><strong>How Long Employed:</strong> ${body.applicant?.employerHowLongDuration || (body.applicant?.employerHowLongYears || body.applicant?.employerHowLongMonths ? `${body.applicant.employerHowLongYears || '0'} years, ${body.applicant.employerHowLongMonths || '0'} months` : 'N/A')}</p>
            <p><strong>Annual Amount:</strong> ${body.applicant?.annualAmount ? `$${parseFloat(String(body.applicant.annualAmount).replace(/[^0-9.]/g, '')).toLocaleString()}` : 'N/A'}</p>
          </div>
          
          ${body.jointApplicantEnabled ? `
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Joint Applicant Information</h3>
            <p><strong>Relationship:</strong> ${body.jointApplicantRelationship || 'N/A'}</p>
            <p><strong>Name:</strong> ${body.jointApplicant?.firstName} ${body.jointApplicant?.middleInitial} ${body.jointApplicant?.lastName} ${body.jointApplicant?.srJr ? `(${body.jointApplicant.srJr})` : ''}</p>
            <p><strong>Phone:</strong> ${body.jointApplicant?.homePhone || 'N/A'}</p>
            <p><strong>Address:</strong> ${body.jointApplicant?.streetAddress || 'N/A'} ${body.jointApplicant?.aptNumber ? `Apt ${body.jointApplicant.aptNumber}` : ''}</p>
            <p><strong>City, State, ZIP:</strong> ${body.jointApplicant?.city || 'N/A'}, ${body.jointApplicant?.state || 'N/A'} ${body.jointApplicant?.zip || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${body.jointApplicant?.dateOfBirth ? new Date(body.jointApplicant.dateOfBirth + 'T00:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'N/A'}</p>
            <p><strong>Age:</strong> ${body.jointApplicant?.age || (body.jointApplicant?.dateOfBirth ? (() => {
              try {
                const birthDate = new Date(body.jointApplicant.dateOfBirth + 'T00:00:00');
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return age > 0 ? age : 'N/A';
              } catch {
                return 'N/A';
              }
            })() : 'N/A')}</p>
            <p><strong>SSN:</strong> ${body.jointApplicant?.socialSecurityNumber || 'N/A'}</p>
            <p><strong>Housing Status:</strong> ${body.jointApplicant?.housingStatus || 'N/A'}</p>
            <p><strong>Monthly Payment:</strong> ${body.jointApplicant?.monthlyPayment || 'N/A'}</p>
            <p><strong>Employer:</strong> ${body.jointApplicant?.employerName || 'N/A'}</p>
            <p><strong>Position:</strong> ${body.jointApplicant?.positionTitle || 'N/A'}</p>
            <p><strong>Annual Amount:</strong> ${body.jointApplicant?.annualAmount ? `$${parseFloat(String(body.jointApplicant.annualAmount).replace(/[^0-9.]/g, '')).toLocaleString()}` : 'N/A'}</p>
          </div>
          ` : ''}
          
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Signatures</h3>
            <p><strong>Applicant Signature:</strong> ${body.applicantSignatureName || 'N/A'}</p>
            <p><strong>Applicant Signature Date:</strong> ${body.applicantSignatureDate || 'N/A'}</p>
            ${body.jointApplicantEnabled ? `
            <p><strong>Joint Applicant Signature:</strong> ${body.jointApplicantSignatureName || 'N/A'}</p>
            <p><strong>Joint Applicant Signature Date:</strong> ${body.jointApplicantSignatureDate || 'N/A'}</p>
            ` : ''}
          </div>
          
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Dealer:</strong> ${body.dealerName}</p>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0; font-weight: bold; color: #155724;">✅ Application successfully submitted and ready for review!</p>
          </div>
        `,
      })
        console.log('✅ Credit application email notification sent successfully:', emailResult)
      } catch (emailError: any) {
        console.error('❌ Error sending credit application email notification:', emailError)
        console.error('Error details:', emailError.message, emailError.stack)
        // Continue even if email fails
      }
    } else {
      console.log('Resend API key not configured - skipping email notification')
    }

    // Send confirmation email to customer
    if (lead && lead.email) {
      try {
        const vehicleInfo = body.financing?.vehicleId 
          ? `${body.financing?.year || ''} ${body.financing?.make || ''} ${body.financing?.model || ''}`.trim()
          : 'your selected vehicle'
        
        await sendEmail({
          to: lead.email,
          subject: `Credit Application Received - Unlimited Auto`,
          html: `
            <h2>Thank You for Your Application! ✅</h2>
            <p>Hi ${lead.name || 'there'},</p>
            <p>We've received your credit application for ${vehicleInfo || 'financing'}.</p>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4caf50;">
              <h3 style="margin-top: 0; color: #155724;">📋 What Happens Next?</h3>
              <p style="margin: 5px 0;">• Our team will review your application</p>
              <p style="margin: 5px 0;">• We'll contact you within 24 hours</p>
              <p style="margin: 5px 0;">• We'll work with you to find the best financing option</p>
            </div>
            <p><strong>Application Details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${lead.name || 'N/A'}</li>
              <li><strong>Phone:</strong> ${lead.phone || 'N/A'}</li>
              <li><strong>Vehicle:</strong> ${vehicleInfo || 'Not specified'}</li>
              ${body.financing?.downPayment ? `<li><strong>Down Payment:</strong> ${body.financing.downPayment}</li>` : ''}
            </ul>
            <p>If you have any questions, please reply to this email and we'll get back to you.</p>
            <p>We look forward to helping you get behind the wheel!</p>
            <p style="margin-top: 20px;">Best regards,<br><strong>Unlimited Auto</strong></p>
          `
        })
        console.log('✅ Customer confirmation email sent successfully')
      } catch (customerEmailError: any) {
        console.error('❌ Error sending customer confirmation email:', customerEmailError)
        // Don't fail the request if customer email fails
      }
    }

    // Send confirmation SMS to customer
    if (lead && lead.phone) {
      try {
        const vehicleInfo = body.financing?.vehicleId 
          ? `${body.financing?.year || ''} ${body.financing?.make || ''} ${body.financing?.model || ''}`.trim()
          : 'your selected vehicle'
        
        const smsMessage = `Thank you ${lead.name || 'for your application'}! We've received your credit application for ${vehicleInfo || 'financing'}. Our team will review it and contact you within 24 hours. - Unlimited Auto`
        
        const smsResult = await sendSMS(lead.phone, smsMessage)
        if (smsResult.success) {
          console.log('✅ Customer confirmation SMS sent successfully')
        } else {
          console.error('❌ Error sending customer confirmation SMS:', smsResult.error)
        }
      } catch (customerSMSError: any) {
        console.error('❌ Error sending customer confirmation SMS:', customerSMSError)
        // Don't fail the request if customer SMS fails
      }
    }

    // Send SMS notifications to configured phone numbers
    if (lead) {
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
            await sendSMSNotificationForLead(lead, phoneNumbers)
            console.log('✅ SMS notifications sent to', phoneNumbers.length, 'phone number(s)')
          }
        }
      } catch (smsError: any) {
        console.error('❌ Error sending SMS notifications:', smsError)
        // Don't fail the request if SMS fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      leadId: lead?.id || null,
      message: 'Application received! We\'ll contact you within 24 hours.' 
    })

  } catch (error: any) {
    console.error('Credit application API error (non-blocking):', error)
    // Never block the user; still return success to avoid lead loss
    return NextResponse.json({ success: true, message: 'Application received!' })
  }
}
