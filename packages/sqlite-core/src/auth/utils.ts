/**
 * Hash password using SHA-256 (simple implementation for development)
 * In production, use bcrypt or argon2
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && 'subtle' in crypto) {
    // Browser environment
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else {
    // Node.js environment
    const nodeCrypto = await import('crypto')
    return nodeCrypto.createHash('sha256').update(password).digest('hex')
  }
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Base64url encode (browser-compatible)
 */
function base64urlEncode(str: string): string {
  // Use btoa for browser, handle unicode properly
  const base64 = btoa(unescape(encodeURIComponent(str)))
  // Convert to base64url format
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Base64url decode (browser-compatible)
 */
function base64urlDecode(str: string): string {
  // Convert from base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if needed
  const padding = base64.length % 4
  if (padding) {
    base64 += '='.repeat(4 - padding)
  }
  // Decode
  return decodeURIComponent(escape(atob(base64)))
}

/**
 * Generate JWT token (simplified for prototyping - no expiry by default)
 */
export function generateJWT(payload: Record<string, any>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const tokenPayload = { ...payload, iat: Math.floor(Date.now() / 1000) }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(tokenPayload))
  const signature = base64urlEncode(secret)

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * Verify JWT token (simplified for prototyping - no expiry check)
 */
export function verifyJWT(token: string, _secret: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(base64urlDecode(parts[1]))
    return payload
  } catch {
    return null
  }
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
