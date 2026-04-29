# HackathonsPage Component

Documentation for the hackathons map page component.

## File Location

`src/components/hackathons.tsx`

## Purpose

Displays Bill Zhang's hackathon journey as a polished portfolio page: hero narrative, animated stats, a bounded United States route map, featured award-heavy events, and a sortable archive of hackathon cards. Uses the `USRouteMap` component to render a real US outline, state borders, and connection lines from UC Santa Cruz (home base) to every unique US hackathon location.

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
display_hackathons_page()
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "hackathon"
}
```

## Homepage Entry Points

`LandingPage` exposes hackathon content as two separate Quick Reference pills:

- **Devpost** — opens `https://devpost.com/IdkwhatImD0ing` in a new tab.
- **Hackathon Journey** — calls `onNavigate("hackathon")` and shows this in-site page.

## Component Features

### Hero and Stats
- Large animated title using `TextGenerateEffect`
- Primary CTA to Devpost and secondary in-page anchor to the event archive
- Four `NumberTicker` stat cards: hackathons, awards, schools, states

### Animated United States Route Map
- Uses `USRouteMap`, built with `@vnedyalk0v/react19-simple-maps` and `us-atlas/states-10m.json`
- Renders state fills, state borders, and an explicit United States outline
- Connection lines radiate from UC Santa Cruz to each unique hackathon location
- Line color: `#a259ff` (portfolio accent purple)
- The map is wrapped in a card with a legend so it reads as a page section, not a loose full-screen element

### Featured Wins
- Highlights the top award-heavy events in a side panel next to the map
- Keeps the full archive below so the highlight panel does not hide data

### Event Archive
- Sortable by "Most Recent" or "Most Awards"
- Each card shows: hackathon name, school, city, year, awards (as badges), and expandable project list
- Project links are clickable and navigate to the project detail page via `onNavigateToProject`
- Cards use `content-visibility: auto` to keep long archive rendering lighter

## Scroll Ownership

The hackathon component does **not** create its own scroll container. Scroll is owned by the layout shell:

- Desktop: `HomeContent` gives the right-side `<main>` `overflow-y-auto` when `activePage === "hackathon"`, while the outer `h-screen` shell uses `overflow-hidden` so the left sidebar remains fixed.
- Mobile: `MobileLayout` owns page scrolling through its `<main className="overflow-y-auto ...">`, while the fixed bottom chat panel remains separate.

## Data Source

`src/data/hackathon-locations.ts` — static data file with:
- `hackathonEvents[]` — all hackathon entries with coordinates, awards, and project IDs
- `getMapDots()` — generates `{start, end}` coordinate pairs for the US route map
- `stats` — pre-computed statistics (total hackathons, awards, schools, states)
- `HOME_BASE` — UC Santa Cruz coordinates (the origin point for all map lines)

## URL State

When this page is active:
```
https://example.com?page=hackathon
```

## External Profile

Devpost profile:
```
https://devpost.com/IdkwhatImD0ing
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

- Line color: change the `lineColor` prop on `<USRouteMap>` in `hackathons.tsx`
- Map outline, state fill, borders, markers, or route styling: edit `src/components/ui/us-route-map.tsx`

## Dependencies

- `motion/react` — entrance animations and card expand/collapse
- `@vnedyalk0v/react19-simple-maps` — React 19-compatible SVG map components
- `us-atlas` — prebuilt US TopoJSON data
- `@/components/ui/button`, `badge`, `card` — shadcn-style UI primitives adapted to the portfolio theme
- `@/components/ui/us-route-map` — United States route map component
- `@/components/ui/text-generate-effect` — Aceternity text animation
- `@/components/ui/number-ticker` — Magic UI animated number counter

## Related Files

- [../components/page.md](../components/page.md) — Parent component (HomeContent)
- `src/data/hackathon-locations.ts` — Hackathon data
- `src/components/ui/us-route-map.tsx` — United States route map component
- `src/components/ui/text-generate-effect.tsx` — Text animation
- `src/components/ui/number-ticker.tsx` — Number animation
