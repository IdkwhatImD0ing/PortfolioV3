import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We need to test the DataCache singleton, so we'll import it fresh for each test
describe('DataCache', () => {
  const mockProjects = [
    {
      id: 'project-1',
      name: 'Test Project 1',
      summary: 'A test project',
      details: 'Detailed description',
      github: 'https://github.com/test/project1',
      demo: null,
    },
    {
      id: 'project-2',
      name: 'Test Project 2',
      summary: 'Another test project',
      details: 'More details',
      github: null,
      demo: 'https://demo.example.com',
    },
  ]

  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks()
    
    // Mock fetch
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getInstance', () => {
    it('should return a singleton instance', async () => {
      // Dynamic import to get fresh module
      const { dataCache } = await import('@/lib/dataCache')
      const { dataCache: dataCache2 } = await import('@/lib/dataCache')
      
      expect(dataCache).toBe(dataCache2)
    })
  })

  describe('getProjects', () => {
    it('should fetch projects from /data.json', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      } as Response)

      const { dataCache } = await import('@/lib/dataCache')
      // Need to invalidate cache since singleton persists
      dataCache.invalidateProjects()
      
      const result = await dataCache.getProjects()
      
      expect(global.fetch).toHaveBeenCalledWith('/data.json')
      expect(result).toEqual(mockProjects)
    })

    it('should return cached data on subsequent calls', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      } as Response)

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      // First call - should fetch
      await dataCache.getProjects()
      // Second call - should use cache
      await dataCache.getProjects()
      
      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle concurrent requests', async () => {
      let resolvePromise: (value: unknown) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })

      vi.mocked(global.fetch).mockImplementationOnce(() => 
        delayedPromise.then(() => ({
          ok: true,
          json: () => Promise.resolve(mockProjects),
        } as Response))
      )

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      // Start multiple concurrent requests
      const promise1 = dataCache.getProjects()
      const promise2 = dataCache.getProjects()
      const promise3 = dataCache.getProjects()
      
      // Resolve the fetch
      resolvePromise!(undefined)
      
      const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3])
      
      // All should return same data
      expect(result1).toEqual(mockProjects)
      expect(result2).toEqual(mockProjects)
      expect(result3).toEqual(mockProjects)
      
      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw error when fetch fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      await expect(dataCache.getProjects()).rejects.toThrow('Failed to load projects')
    })

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      await expect(dataCache.getProjects()).rejects.toThrow('Network error')
    })
  })

  describe('getProjectById', () => {
    it('should return project when found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      } as Response)

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      const result = await dataCache.getProjectById('project-1')
      
      expect(result).toEqual(mockProjects[0])
    })

    it('should return null when project not found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      } as Response)

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      const result = await dataCache.getProjectById('nonexistent')
      
      expect(result).toBeNull()
    })
  })

  describe('invalidateProjects', () => {
    it('should clear cached projects', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProjects),
      } as Response)

      const { dataCache } = await import('@/lib/dataCache')
      dataCache.invalidateProjects()
      
      // First fetch
      await dataCache.getProjects()
      expect(global.fetch).toHaveBeenCalledTimes(1)
      
      // Invalidate cache
      dataCache.invalidateProjects()
      
      // Should fetch again
      await dataCache.getProjects()
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
