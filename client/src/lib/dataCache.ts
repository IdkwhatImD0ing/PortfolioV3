interface Project {
  id: string
  name: string
  summary: string
  details: string
  github: string | null
  demo: string | null
}

class DataCache {
  private static instance: DataCache
  private cache: Map<string, Project[]> = new Map()
  private loadingPromises: Map<string, Promise<Project[]>> = new Map()

  private constructor() {}

  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache()
    }
    return DataCache.instance
  }

  async getProjects(): Promise<Project[]> {
    const cacheKey = 'projects'
    
    // Return cached data if available
    const cachedData = this.cache.get(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Return existing loading promise if already fetching
    const existingPromise = this.loadingPromises.get(cacheKey)
    if (existingPromise) {
      return existingPromise
    }

    // Create new loading promise
    const loadingPromise = fetch('/data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load projects')
        }
        return res.json()
      })
      .then(data => {
        this.cache.set(cacheKey, data)
        this.loadingPromises.delete(cacheKey)
        return data
      })
      .catch(err => {
        this.loadingPromises.delete(cacheKey)
        throw err
      })

    this.loadingPromises.set(cacheKey, loadingPromise)
    return loadingPromise
  }

  // Method to invalidate cache if needed
  invalidateProjects(): void {
    this.cache.delete('projects')
  }

  // Get a single project by ID (uses cached data)
  async getProjectById(projectId: string): Promise<Project | null> {
    const projects = await this.getProjects()
    return projects.find(p => p.id === projectId) || null
  }
}

export const dataCache = DataCache.getInstance()
export type { Project }