# LandingPage Component

Documentation for the landing page component.

## File Location

`src/components/LandingPage.tsx`

## Purpose

The initial page users see when visiting the portfolio. Introduces the voice-driven portfolio concept and prompts users to start a voice conversation.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onNavigate` | `(page: string) => void` | No | Callback to navigate to another page (e.g. "resume") |
| `isMobile` | `boolean` | No | When true, adapts layout for mobile (scrollable, downward CTA). Defaults to `false`. |

## Usage

```tsx
import LandingPage from "@/components/LandingPage";

// In page.tsx
{activePage === "landing" && <LandingPage />}
```

## Voice Navigation

The backend navigates to this page by calling:
```python
display_landing_page(message="Going back to the main page")
```

This sends a metadata event:
```json
{
  "type": "navigation",
  "page": "landing"
}
```

## When It's Shown

- Default page on initial load
- When user asks to "go back" or "start over"
- When `?page=` query param is not set or is "landing"

## Mobile Behavior

On mobile devices, the landing page renders natively instead of redirecting. Key differences from desktop:

- **Layout**: Uses `min-h-full` instead of `h-screen` so the page scrolls naturally within the mobile content area
- **CTA**: The "Begin your voice journey" with a left arrow changes to "Start chatting below" with a downward arrow, pointing toward the bottom drawer control bar
- **Padding**: Extra vertical padding (`py-6`) is applied to avoid content being clipped by the bottom drawer

The `isMobile` prop controls these adaptations and is set to `true` by `MobileLayout.tsx`.

## Quick Reference Links

A "Quick Reference" section sits between the example questions and the CTA. It provides direct access to key resources without needing to interact with the chat:

- **Resume** — Navigates to the resume page via `onNavigate("resume")`
- **GitHub** — Opens `https://github.com/IdkwhatImD0ing/` in a new tab
- **LinkedIn** — Opens `https://www.linkedin.com/in/bill-zhang1/` in a new tab

Each link is styled as a rounded pill with an icon and label. GitHub and LinkedIn icons use the SVGs from `/public/`. The section animates in with the same `motion.div` pattern as the rest of the page (delay: 0.55s).

## Modifications

### Change Landing Content

Edit `src/components/LandingPage.tsx` directly. The component uses:
- Tailwind CSS for styling
- Motion (Framer Motion) for animations
- `next/image` for SVG icons in the Quick Reference section

### Add New CTA Button

```tsx
<Button onClick={() => startCall()}>
  Start Voice Interaction
</Button>
```

Note: The `startCall` function is passed from the parent `page.tsx`.

### Update Quick Reference Links

Edit the Quick Reference section in `src/components/LandingPage.tsx`. Each link is a standard `<a>` tag with icon and label. To add a new link, duplicate an existing pill and update the `href`, icon, and label.

## Related Files

- [../components/page.md](../components/page.md) - Parent component managing navigation
- `src/components/fallback-link.tsx` - Mobile fallback link
