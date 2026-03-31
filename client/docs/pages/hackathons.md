# HackathonsPage Component

Documentation for the hackathons map page component.

## File Location

`src/components/hackathons.tsx`

## Purpose

Displays an interactive map of Bill Zhang's hackathon journey across the US, along with animated stats and a sortable card grid of all hackathon events. Uses Aceternity's World Map component to render animated connection lines from UC Santa Cruz (home base) to every hackathon location.

## Props

```tsx
interface HackathonsPageProps {
  onNavigateToProject?: (projectId: string) => void
}
```

| Prop | Type | Description |
|------|------|-------------|
| `onNavigateToProject` | `(projectId: string) => void` | Callback when a user clicks a project link inside a hackathon card. The parent should set `currentProjectId` and navigate to the project page. |

## Usage

```tsx
import HackathonsPage from "@/components/hackathons";

// In HomeContent.tsx (desktop)
{activePage === "hackathon" && (
  <HackathonsPage
    onNavigateToProject={(projectId) => {
      setCurrentProjectId(projectId);
      setActivePage("project");
    }}
  />
)}
```

## Voice / Text Navigation

The backend navigates to this page by calling:
```python
display_hackathons_page(message="Let me show you my hackathon journey")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "hackathon"
}
```

## Component Features

### Animated World Map
- Uses Aceternity's `WorldMap` component (dynamically imported to avoid SSR issues)
- Curved connection lines radiate from UC Santa Cruz to each unique hackathon location
- Line color: `#a259ff` (portfolio accent purple)
- Pulsing dots at start/end points

### Animated Stats Bar
- Uses Magic UI's `NumberTicker` for counting animations
- Displays: total hackathons, total awards, unique schools, unique states

### Hackathon Card Grid
- Sortable by "Most Recent" or "Most Awards"
- Each card shows: hackathon name, school, year, awards (as badges), and expandable project list
- Project links are clickable and navigate to the project detail page via `onNavigateToProject`

### Title Animation
- Uses Aceternity's `TextGenerateEffect` for a word-by-word reveal animation

## Data Source

`src/data/hackathon-locations.ts` — static data file with:
- `hackathonEvents[]` — all hackathon entries with coordinates, awards, and project IDs
- `getMapDots()` — generates `{start, end}` coordinate pairs for the World Map
- `stats` — pre-computed statistics (total hackathons, awards, schools, states)
- `HOME_BASE` — UC Santa Cruz coordinates (the origin point for all map lines)

## URL State

When this page is active:
```
https://example.com?page=hackathon
```

## Modifications

### Add a New Hackathon

1. Add an entry to `hackathonEvents` in `src/data/hackathon-locations.ts`:
```typescript
{
  id: "newhack-2025",
  hackathon: "NewHack 2025",
  school: "University Name",
  city: "City, ST",
  lat: 40.0,
  lng: -74.0,
  year: 2025,
  awards: ["Best Overall"],
  projects: [{ id: "project-id", name: "Project Name" }],
}
```

2. The map, stats, and card grid will update automatically.

### Change Map Appearance

- Line color: change the `lineColor` prop on `<WorldMap>` in `hackathons.tsx`
- Map dot/background colors: edit `src/components/ui/world-map.tsx`

## Dependencies

- `dotted-map` — generates the SVG dot grid for the world map background
- `motion/react` — entrance animations and card expand/collapse
- `@/components/ui/world-map` — Aceternity World Map component
- `@/components/ui/text-generate-effect` — Aceternity text animation
- `@/components/ui/number-ticker` — Magic UI animated number counter

## Related Files

- [../components/page.md](../components/page.md) — Parent component (HomeContent)
- `src/data/hackathon-locations.ts` — Hackathon data
- `src/components/ui/world-map.tsx` — World Map component
- `src/components/ui/text-generate-effect.tsx` — Text animation
- `src/components/ui/number-ticker.tsx` — Number animation
