import { describe, expect, it } from 'vitest'
import { sanitizeNext } from './sanitize-next'

describe('sanitizeNext', () => {
  it('allows /dashboard', () => {
    expect(sanitizeNext('/dashboard')).toBe('/dashboard')
  })

  it('rejects protocol-relative //evil.com', () => {
    expect(sanitizeNext('//evil.com')).toBe('/')
  })

  it('rejects absolute https://evil.com', () => {
    expect(sanitizeNext('https://evil.com')).toBe('/')
  })

  it('rejects javascript: URLs', () => {
    expect(sanitizeNext('javascript:alert(1)')).toBe('/')
  })

  it('maps empty string to /', () => {
    expect(sanitizeNext('')).toBe('/')
  })

  it('maps null to /', () => {
    expect(sanitizeNext(null)).toBe('/')
  })

  it('allows /orders/123', () => {
    expect(sanitizeNext('/orders/123')).toBe('/orders/123')
  })

  it('maps whitespace-only to /', () => {
    expect(sanitizeNext('   ')).toBe('/')
  })

  it('maps bare // to /', () => {
    expect(sanitizeNext('//')).toBe('/')
  })

  it('allows path with query string', () => {
    expect(sanitizeNext('/valid/path?query=1')).toBe('/valid/path?query=1')
  })

  it('rejects leading/trailing spaces around path', () => {
    expect(sanitizeNext(' /spaces ')).toBe('/')
  })

  it('rejects data: URLs', () => {
    expect(sanitizeNext('data:text/html,<svg onload=alert(1)>')).toBe('/')
  })

  it('rejects extremely long paths', () => {
    const long = '/' + 'a'.repeat(2100)
    expect(sanitizeNext(long)).toBe('/')
  })
})
