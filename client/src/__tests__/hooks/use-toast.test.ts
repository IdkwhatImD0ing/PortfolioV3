import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reducer } from '@/hooks/use-toast'

// Test the reducer separately since the hook has side effects
describe('use-toast reducer', () => {
  const createMockToast = (id: string, content?: string) => ({
    id,
    title: content || `Toast ${id}`,
    open: true,
    onOpenChange: vi.fn(),
  })

  describe('ADD_TOAST action', () => {
    it('should add a toast to empty state', () => {
      const initialState = { toasts: [] }
      const newToast = createMockToast('1')
      
      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      })
      
      expect(result.toasts).toHaveLength(1)
      expect(result.toasts[0]).toEqual(newToast)
    })

    it('should prepend new toasts', () => {
      const existingToast = createMockToast('1')
      const initialState = { toasts: [existingToast] }
      const newToast = createMockToast('2')
      
      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: newToast,
      })
      
      expect(result.toasts).toHaveLength(1) // TOAST_LIMIT is 1
      expect(result.toasts[0].id).toBe('2')
    })

    it('should respect TOAST_LIMIT', () => {
      const toast1 = createMockToast('1')
      const toast2 = createMockToast('2')
      const initialState = { toasts: [toast1] }
      
      const result = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: toast2,
      })
      
      // TOAST_LIMIT is 1, so only the newest toast should remain
      expect(result.toasts).toHaveLength(1)
      expect(result.toasts[0].id).toBe('2')
    })
  })

  describe('UPDATE_TOAST action', () => {
    it('should update existing toast', () => {
      const existingToast = createMockToast('1', 'Original')
      const initialState = { toasts: [existingToast] }
      
      const result = reducer(initialState, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      })
      
      expect(result.toasts[0].title).toBe('Updated')
      expect(result.toasts[0].id).toBe('1')
    })

    it('should not update non-matching toast', () => {
      const existingToast = createMockToast('1', 'Original')
      const initialState = { toasts: [existingToast] }
      
      const result = reducer(initialState, {
        type: 'UPDATE_TOAST',
        toast: { id: '2', title: 'Updated' },
      })
      
      expect(result.toasts[0].title).toBe('Original')
    })

    it('should merge partial updates', () => {
      const existingToast = {
        ...createMockToast('1'),
        description: 'Original description',
      }
      const initialState = { toasts: [existingToast] }
      
      const result = reducer(initialState, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'New Title' },
      })
      
      expect(result.toasts[0].title).toBe('New Title')
      expect(result.toasts[0].description).toBe('Original description')
    })
  })

  describe('DISMISS_TOAST action', () => {
    it('should set open to false for specific toast', () => {
      const existingToast = createMockToast('1')
      const initialState = { toasts: [existingToast] }
      
      const result = reducer(initialState, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      })
      
      expect(result.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no toastId provided', () => {
      const toast1 = createMockToast('1')
      const toast2 = createMockToast('2')
      // Add both to state (bypassing limit for test)
      const initialState = { toasts: [toast1, toast2] }
      
      const result = reducer(initialState, {
        type: 'DISMISS_TOAST',
      })
      
      expect(result.toasts.every(t => t.open === false)).toBe(true)
    })

    it('should not affect non-matching toasts', () => {
      const toast1 = createMockToast('1')
      const toast2 = createMockToast('2')
      const initialState = { toasts: [toast1, toast2] }
      
      const result = reducer(initialState, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      })
      
      expect(result.toasts[0].open).toBe(false)
      expect(result.toasts[1].open).toBe(true)
    })
  })

  describe('REMOVE_TOAST action', () => {
    it('should remove specific toast', () => {
      const toast1 = createMockToast('1')
      const toast2 = createMockToast('2')
      const initialState = { toasts: [toast1, toast2] }
      
      const result = reducer(initialState, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      })
      
      expect(result.toasts).toHaveLength(1)
      expect(result.toasts[0].id).toBe('2')
    })

    it('should remove all toasts when no toastId provided', () => {
      const toast1 = createMockToast('1')
      const toast2 = createMockToast('2')
      const initialState = { toasts: [toast1, toast2] }
      
      const result = reducer(initialState, {
        type: 'REMOVE_TOAST',
      })
      
      expect(result.toasts).toHaveLength(0)
    })

    it('should handle removing non-existent toast', () => {
      const existingToast = createMockToast('1')
      const initialState = { toasts: [existingToast] }
      
      const result = reducer(initialState, {
        type: 'REMOVE_TOAST',
        toastId: 'nonexistent',
      })
      
      expect(result.toasts).toHaveLength(1)
    })
  })

  describe('state immutability', () => {
    it('should not mutate original state', () => {
      const existingToast = createMockToast('1')
      const initialState = { toasts: [existingToast] }
      const originalToasts = [...initialState.toasts]
      
      reducer(initialState, {
        type: 'ADD_TOAST',
        toast: createMockToast('2'),
      })
      
      expect(initialState.toasts).toEqual(originalToasts)
    })
  })
})
