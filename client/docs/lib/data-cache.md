# DataCache

Documentation for the project data caching singleton.

## File Location

`src/lib/dataCache.ts`

## Purpose

Singleton class that caches project data fetched from `/data.json`. Prevents duplicate network requests and provides consistent data access across components.

## Interface

```typescript
interface Project {
  id: string;
  name: string;
  summary: string;
  details: string;
  github: string | null;
  demo: string | null;
}
```

## API

### getInstance()

```typescript
static getInstance(): DataCache
```

Returns the singleton instance.

```typescript
import { dataCache } from "@/lib/dataCache";
// dataCache is already the instance
```

### getProjects()

```typescript
async getProjects(): Promise<Project[]>
```

Returns all projects. Fetches from `/data.json` on first call, returns cached data on subsequent calls.

```typescript
const projects = await dataCache.getProjects();
```

### getProjectById()

```typescript
async getProjectById(projectId: string): Promise<Project | null>
```

Returns a single project by ID, or null if not found.

```typescript
const project = await dataCache.getProjectById("dispatch-ai");
if (project) {
  console.log(project.name); // "Dispatch AI"
}
```

### invalidateProjects()

```typescript
invalidateProjects(): void
```

Clears the cache, forcing a fresh fetch on next access.

```typescript
dataCache.invalidateProjects();
const freshProjects = await dataCache.getProjects(); // Re-fetches
```

## Implementation Details

### Singleton Pattern

```typescript
class DataCache {
  private static instance: DataCache;
  
  private constructor() {}
  
  static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }
}

export const dataCache = DataCache.getInstance();
```

### Request Deduplication

Prevents multiple simultaneous fetches:

```typescript
private loadingPromises: Map<string, Promise<Project[]>> = new Map();

async getProjects(): Promise<Project[]> {
  // Return existing promise if already loading
  const existingPromise = this.loadingPromises.get(cacheKey);
  if (existingPromise) {
    return existingPromise;
  }
  
  // Create new loading promise
  const loadingPromise = fetch('/data.json').then(...);
  this.loadingPromises.set(cacheKey, loadingPromise);
  return loadingPromise;
}
```

### Data Source

Fetches from `/public/data.json`:

```typescript
const loadingPromise = fetch('/data.json')
  .then(res => res.json())
  .then(data => {
    this.cache.set(cacheKey, data);
    return data;
  });
```

## Usage Examples

### In ProjectPage

```typescript
// src/components/project.tsx
import { dataCache } from "@/lib/dataCache";

const [project, setProject] = useState<Project | null>(null);

useEffect(() => {
  async function loadProject() {
    if (projectId) {
      const p = await dataCache.getProjectById(projectId);
      setProject(p);
    }
  }
  loadProject();
}, [projectId]);
```

### Preload All Projects

```typescript
// Warm the cache early
useEffect(() => {
  dataCache.getProjects();
}, []);
```

## Data File Format

`/public/data.json`:

```json
[
  {
    "id": "dispatch-ai",
    "name": "Dispatch AI",
    "summary": "AI-powered emergency call handling...",
    "details": "Full description with markdown...",
    "github": "https://github.com/user/repo",
    "demo": "https://youtube.com/watch?v=xxx"
  },
  // ... more projects
]
```

## Modifications

### Add New Project Field

1. Update the interface:

```typescript
interface Project {
  id: string;
  name: string;
  summary: string;
  details: string;
  github: string | null;
  demo: string | null;
  tags?: string[];  // New field
}
```

2. Add to `/public/data.json`:

```json
{
  "id": "project-id",
  "tags": ["AI", "Web", "Hackathon"]
}
```

### Add Cache Expiration

```typescript
private cacheTimestamp: number = 0;
private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async getProjects(): Promise<Project[]> {
  const now = Date.now();
  if (this.cache.has(cacheKey) && now - this.cacheTimestamp < this.CACHE_TTL) {
    return this.cache.get(cacheKey)!;
  }
  // ... fetch fresh data
  this.cacheTimestamp = now;
}
```

## Related Files

- [../pages/project.md](../pages/project.md) - Uses dataCache for project data
- `/public/data.json` - Data source
- `pinecone/data.json` - Same data, used for vector embeddings
