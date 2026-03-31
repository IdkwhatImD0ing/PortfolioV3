# Architecture Page (Easter Egg)

Documentation for the "How It Works" architecture page.

## File Location

`src/components/architecture.tsx`

## Purpose

An Easter egg page that reveals the technical architecture behind the portfolio. Shows an animated beam diagram of the request flow, detailed layer cards for each subsystem, and a scrolling tech stack marquee.

## Dependencies

- **Magic UI Animated Beam** (`src/components/ui/animated-beam.tsx`) — draws animated SVG beams between diagram nodes
- **Magic UI Border Beam** (`src/components/ui/border-beam.tsx`) — animated border highlight on the focal node
- **Magic UI Marquee** (`src/components/ui/marquee.tsx`) — infinite scrolling tech stack strip
- **shadcn Badge** — tech stack pills on layer cards
- **Motion** (Framer Motion) — entrance animations with stagger pattern

## Sections

### Hero
Gradient title "Under the Hood" with subtitle. Uses the same `bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent` pattern as other pages.

### Architecture Flow Diagram
Interactive animated beam diagram with 6 nodes: You -> Next.js -> FastAPI -> OpenAI Agent -> Pinecone, plus Retell AI branching from User and Server via curved beams. The FastAPI node is highlighted with a `BorderBeam`.

### Layer Detail Cards
2x2 grid of cards (Frontend, Voice Engine, AI Backend, Vector Search) each with icon, description, and tech badges. Uses `glowVariants` on hover matching `PersonalPage`.

### Tech Stack Marquee
Horizontal infinite scroll of 12 technology items with fade-out edges.

## Voice Navigation

The backend navigates to this page by calling:
```python
display_architecture_page(message="Let me show you how this all works")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "architecture"
}
```

## Discovery

- **Voice/Text:** Ask "how does this work" or "what's under the hood"
- **Landing page:** A subtle CPU icon button in the Quick Reference section links directly to the page
- **URL:** `?page=architecture`

## Related Files

- [../components/page.md](../components/page.md) — Parent component managing navigation
- [landing.md](landing.md) — Landing page with Easter egg hint button
- `../../server/docs/tools/navigation.md` — Server-side navigation tool
