import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'included', false && 'excluded')
    expect(result).toBe('base included')
  })

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should handle conflicting classes
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })

  it('should handle objects with boolean values', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'visible': true,
    })
    expect(result).toBe('active visible')
  })

  it('should handle mixed inputs', () => {
    const result = cn(
      'base-class',
      ['array-class'],
      { 'object-class': true },
      undefined,
      'final-class'
    )
    expect(result).toContain('base-class')
    expect(result).toContain('array-class')
    expect(result).toContain('object-class')
    expect(result).toContain('final-class')
  })

  it('should merge conflicting tailwind utilities', () => {
    // Later classes should override earlier ones
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('should preserve non-conflicting tailwind classes', () => {
    const result = cn('bg-red-500', 'text-blue-500', 'p-4')
    expect(result).toBe('bg-red-500 text-blue-500 p-4')
  })
})
