/**
 * Phone number utility functions
 * Pure functions that don't require Node.js modules - safe for client-side use
 */

/**
 * Normalize phone number to E.164 format
 * Handles various formats: (313) 766-4475, 313-766-4475, 3137664475, +13137664475, etc.
 * Assumes US numbers (adds +1 prefix if missing)
 */
export function normalizePhoneToE164(phone: string): string | null {
  if (!phone) return null
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // If it already starts with +, check if it's valid
  if (cleaned.startsWith('+')) {
    // Remove + and check length
    const digits = cleaned.substring(1)
    if (digits.length >= 10 && digits.length <= 15) {
      return cleaned // Already in E.164 format
    }
  }
  
  // Remove leading +1 or 1 if present
  if (cleaned.startsWith('+1')) {
    cleaned = cleaned.substring(2)
  } else if (cleaned.startsWith('1') && cleaned.length === 11) {
    cleaned = cleaned.substring(1)
  }
  
  // If we have exactly 10 digits, assume it's a US number and add +1
  if (/^\d{10}$/.test(cleaned)) {
    return `+1${cleaned}`
  }
  
  // If we have 11 digits starting with 1, remove the 1 and add +
  if (/^1\d{10}$/.test(cleaned)) {
    return `+${cleaned}`
  }
  
  return null // Invalid format
}

