/**
 * Simple string hash (NOT cryptographically secure - for prototyping only!)
 * This avoids the need for crypto.subtle or external packages in React Native
 */
function simpleHash(str: string): string {
  // Generate multiple hash values for a longer result
  let h1 = 0, h2 = 0, h3 = 0, h4 = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    h1 = ((h1 << 5) - h1 + char) | 0
    h2 = ((h2 << 7) - h2 + char) | 0
    h3 = ((h3 << 11) - h3 + char) | 0
    h4 = ((h4 << 13) - h4 + char) | 0
  }
  // Convert each to hex (8 chars each = 64 total)
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0')
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0')
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0')
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0')
  return `${hex1}${hex2}${hex3}${hex4}${hex1}${hex2}${hex3}${hex4}`.substring(0, 64)
}

/**
 * Hash password (simple implementation for prototyping)
 * NOT cryptographically secure - for mock users only!
 */
export async function hashPassword(password: string): Promise<string> {
  // Simple hash that works everywhere without crypto dependencies
  return simpleHash(password + 'vibecode-salt')
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * Base64 encode (works in browser, Node.js, and React Native)
 */
function base64Encode(str: string): string {
  // Convert string to UTF-8 bytes
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    if (code < 128) {
      bytes.push(code)
    } else if (code < 2048) {
      bytes.push((code >> 6) | 192)
      bytes.push((code & 63) | 128)
    } else {
      bytes.push((code >> 12) | 224)
      bytes.push(((code >> 6) & 63) | 128)
      bytes.push((code & 63) | 128)
    }
  }

  let result = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i]
    const b2 = bytes[i + 1]
    const b3 = bytes[i + 2]

    result += BASE64_CHARS[b1 >> 2]
    result += BASE64_CHARS[((b1 & 3) << 4) | (b2 !== undefined ? b2 >> 4 : 0)]
    result += b2 !== undefined ? BASE64_CHARS[((b2 & 15) << 2) | (b3 !== undefined ? b3 >> 6 : 0)] : '='
    result += b3 !== undefined ? BASE64_CHARS[b3 & 63] : '='
  }

  return result
}

/**
 * Base64 decode (works in browser, Node.js, and React Native)
 */
function base64Decode(str: string): string {
  // Remove padding and whitespace
  str = str.replace(/[=\s]/g, '')

  const bytes: number[] = []
  for (let i = 0; i < str.length; i += 4) {
    const c1 = BASE64_CHARS.indexOf(str[i])
    const c2 = BASE64_CHARS.indexOf(str[i + 1])
    const c3 = str[i + 2] ? BASE64_CHARS.indexOf(str[i + 2]) : -1
    const c4 = str[i + 3] ? BASE64_CHARS.indexOf(str[i + 3]) : -1

    bytes.push((c1 << 2) | (c2 >> 4))
    if (c3 !== -1) bytes.push(((c2 & 15) << 4) | (c3 >> 2))
    if (c4 !== -1) bytes.push(((c3 & 3) << 6) | c4)
  }

  // Convert UTF-8 bytes back to string
  let result = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]
    if (b < 128) {
      result += String.fromCharCode(b)
    } else if (b >= 192 && b < 224 && i + 1 < bytes.length) {
      result += String.fromCharCode(((b & 31) << 6) | (bytes[++i] & 63))
    } else if (b >= 224 && i + 2 < bytes.length) {
      result += String.fromCharCode(((b & 15) << 12) | ((bytes[++i] & 63) << 6) | (bytes[++i] & 63))
    }
  }

  return result
}

/**
 * Base64url encode
 */
function base64urlEncode(str: string): string {
  return base64Encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Base64url decode
 */
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4
  if (padding) {
    base64 += '='.repeat(4 - padding)
  }
  return base64Decode(base64)
}

/**
 * Generate JWT token (simplified for prototyping - no expiry)
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
 * Generate UUID v4 (uses Math.random - no crypto dependency)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
