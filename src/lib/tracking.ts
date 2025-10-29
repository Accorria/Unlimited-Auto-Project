// Lead tracking system for funnel control
export interface TrackingEvent {
  type: 'phone_click' | 'email_click' | 'form_submit' | 'page_view' | 'vehicle_interest'
  source: string
  vehicleId?: string
  vehicleName?: string
  userAgent?: string
  ipAddress?: string
  referer?: string
  timestamp: string
  sessionId: string
}

// Generate unique session ID for tracking
export function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Track any interaction
export async function trackInteraction(event: Omit<TrackingEvent, 'timestamp' | 'sessionId'>) {
  const sessionId = getOrCreateSessionId()
  
  const trackingData: TrackingEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    sessionId,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    referer: typeof window !== 'undefined' ? document.referrer : ''
  }

  try {
    // Send to your tracking API
    await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    })
  } catch (error) {
    console.error('Error tracking interaction:', error)
  }
}

// Get or create session ID
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server_session'
  
  let sessionId = sessionStorage.getItem('unlimited_auto_session')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('unlimited_auto_session', sessionId)
  }
  return sessionId
}

// Track phone clicks
export function trackPhoneClick(phoneNumber: string, source: string, vehicleId?: string, vehicleName?: string) {
  trackInteraction({
    type: 'phone_click',
    source,
    vehicleId,
    vehicleName
  })
}

// Track email clicks
export function trackEmailClick(email: string, source: string, vehicleId?: string, vehicleName?: string) {
  trackInteraction({
    type: 'email_click',
    source,
    vehicleId,
    vehicleName
  })
}

// Track page views
export function trackPageView(page: string, source: string) {
  trackInteraction({
    type: 'page_view',
    source
  })
}

// Track vehicle interest
export function trackVehicleInterest(vehicleId: string, vehicleName: string, source: string) {
  trackInteraction({
    type: 'vehicle_interest',
    source,
    vehicleId,
    vehicleName
  })
}
