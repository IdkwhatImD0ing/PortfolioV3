import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile hook', () => {
  const MOBILE_BREAKPOINT = 768
  let matchMediaMock: ReturnType<typeof vi.fn>
  let addEventListenerMock: ReturnType<typeof vi.fn>
  let removeEventListenerMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    addEventListenerMock = vi.fn()
    removeEventListenerMock = vi.fn()

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return false for desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should return false at exactly MOBILE_BREAKPOINT', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT,
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('should return true just below MOBILE_BREAKPOINT', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: MOBILE_BREAKPOINT - 1,
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('should set up media query listener', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    renderHook(() => useIsMobile())
    
    expect(matchMediaMock).toHaveBeenCalledWith(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should clean up event listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { unmount } = renderHook(() => useIsMobile())
    
    unmount()
    
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('should respond to media query changes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
    
    // Simulate viewport change to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      // Get the onChange handler and call it
      const onChangeHandler = addEventListenerMock.mock.calls[0]?.[1]
      if (onChangeHandler) {
        onChangeHandler()
      }
    })
    
    expect(result.current).toBe(true)
  })
})
