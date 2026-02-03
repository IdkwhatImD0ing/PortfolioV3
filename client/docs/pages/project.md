# ProjectPage Component

Documentation for the project page component.

## File Location

`src/components/project.tsx`

## Purpose

Displays detailed information about a specific project, including:
- Project name and description
- Demo video or image
- GitHub and demo links
- Project navigation (carousel-style)

## Props

```tsx
interface ProjectPageProps {
  projectId?: string;  // Optional project ID to display
}
```

## Usage

```tsx
import ProjectPage from "@/components/project";

// In page.tsx
{activePage === "project" && <ProjectPage projectId={currentProjectId} />}
```

## Voice Navigation

The backend navigates to this page by calling:
```python
display_project(id="dispatch-ai", message="Let me show you this project")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "project",
  "project_id": "dispatch-ai"
}
```

## Data Loading

Project data is loaded from the `DataCache` singleton:

```tsx
const project = await dataCache.getProjectById(projectId);
```

Data source: `/public/data.json`

## Demo Display

The component detects demo type:

```tsx
const isVideo = useMemo(() => {
  return demo?.includes('youtube') || demo?.includes('youtu.be');
}, [demo]);
```

- **YouTube videos**: Embedded iframe player
- **Images**: Standard `<img>` display

## URL State

When this page is active with a project:
```
https://example.com?page=project&projectId=dispatch-ai
```

## Project Navigation

Users can navigate between projects using:
- Previous/Next buttons
- Direct project selection

## Modifications

### Add Project Links

Project links (GitHub, Demo) are rendered from project data:

```tsx
{project.github && (
  <a href={project.github} target="_blank">
    <Github /> View Code
  </a>
)}
```

### Change Video Player

For YouTube embeds, modify the iframe:

```tsx
<iframe
  src={`https://www.youtube.com/embed/${videoId}`}
  allowFullScreen
/>
```

### Add New Project Fields

1. Update `/public/data.json` with new field
2. Update `Project` interface in `src/lib/dataCache.ts`
3. Display in `project.tsx`

## Performance

- Component wrapped with `React.memo()`
- Video detection memoized with `useMemo()`
- Data cached via `DataCache` singleton

## Related Files

- [../components/page.md](../components/page.md) - Parent component
- [../lib/data-cache.md](../lib/data-cache.md) - Data loading
- `/public/data.json` - Project data source
