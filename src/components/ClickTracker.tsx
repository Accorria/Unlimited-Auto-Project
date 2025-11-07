'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Throttle click tracking - only track once per second max
let lastClickTime = 0
const CLICK_THROTTLE_MS = 1000 // Only track one click per second

// Batch clicks and send them together
let clickQueue: any[] = []
let batchTimeout: NodeJS.Timeout | null = null

function sendClickBatch() {
  if (clickQueue.length === 0) return
  
  const batch = [...clickQueue]
  clickQueue = []
  
  // Send batch (fire and forget)
  fetch('/api/tracking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventType: 'click_batch',
      clicks: batch,
      timestamp: new Date().toISOString()
    }),
  }).catch(error => {
    console.debug('Click tracking batch failed:', error)
  })
}

// Track click events
async function trackClick(event: MouseEvent) {
  // Throttle - only track if enough time has passed
  const now = Date.now()
  if (now - lastClickTime < CLICK_THROTTLE_MS) {
    return // Skip this click
  }
  lastClickTime = now
  const target = event.target as HTMLElement
  
  // Skip tracking for admin pages
  if (window.location.pathname.startsWith('/admin')) {
    return
  }

  // Get element details
  const elementType = target.tagName.toLowerCase()
  const elementId = target.id || ''
  const elementClass = target.className || ''
  const elementText = target.textContent?.trim().substring(0, 100) || ''
  const href = (target as HTMLAnchorElement).href || ''
  
  // Get position
  const rect = target.getBoundingClientRect()
  const x = Math.round(event.clientX - rect.left)
  const y = Math.round(event.clientY - rect.top)
  
  // Get page context
  const pageUrl = window.location.href
  const pagePath = window.location.pathname
  const referrer = document.referrer
  
  // Skip tracking certain elements (like script tags, etc.)
  if (['script', 'style', 'meta', 'link'].includes(elementType)) {
    return
  }

  // Prepare click data
  const clickData = {
    eventType: 'click',
    url: pageUrl,
    path: pagePath,
    referrer: referrer || '',
    userAgent: navigator.userAgent,
    details: {
      elementType,
      elementId,
      elementClass: typeof elementClass === 'string' ? elementClass.substring(0, 200) : '',
      elementText,
      href: href.substring(0, 500),
      position: {
        x,
        y,
        pageX: event.pageX,
        pageY: event.pageY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      },
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }

  // Add to batch queue instead of sending immediately
  clickQueue.push(clickData)
  
  // Clear existing timeout
  if (batchTimeout) {
    clearTimeout(batchTimeout)
  }
  
  // Send batch after 2 seconds of no clicks (or when queue reaches 10)
  batchTimeout = setTimeout(() => {
    sendClickBatch()
  }, 2000)
  
  // If queue gets too large, send immediately
  if (clickQueue.length >= 10) {
    sendClickBatch()
  }
}

// Track page views
async function trackPageView(pathname: string) {
  // Skip tracking for admin pages
  if (pathname.startsWith('/admin')) {
    return
  }

  const pageViewData = {
    eventType: 'page_view',
    url: window.location.href,
    path: pathname,
    referrer: document.referrer || '',
    userAgent: navigator.userAgent,
    details: {
      title: document.title,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }

  fetch('/api/tracking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pageViewData),
  }).catch(error => {
    console.debug('Page view tracking failed:', error)
  })
}

export default function ClickTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Track initial page view
    trackPageView(pathname)

    // Add click listener
    const handleClick = (event: MouseEvent) => {
      trackClick(event)
    }

    document.addEventListener('click', handleClick, true) // Use capture phase

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [pathname])

  // This component doesn't render anything
  return null
}

