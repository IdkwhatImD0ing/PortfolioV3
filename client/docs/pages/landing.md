# LandingPage Component

Documentation for the landing page component.

## File Location

`src/components/LandingPage.tsx`

## Purpose

The initial page users see when visiting the portfolio. Introduces the voice-driven portfolio concept and prompts users to start a voice conversation.

## Props

None - this is a standalone component.

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

## Mobile Redirect

Users on mobile devices are automatically redirected to `v2.art3m1s.me` before seeing this page.

## Modifications

### Change Landing Content

Edit `src/components/LandingPage.tsx` directly. The component uses:
- Tailwind CSS for styling
- Motion (Framer Motion) for animations

### Add New CTA Button

```tsx
<Button onClick={() => startCall()}>
  Start Voice Interaction
</Button>
```

Note: The `startCall` function is passed from the parent `page.tsx`.

## Related Files

- [../components/page.md](../components/page.md) - Parent component managing navigation
- `src/components/fallback-link.tsx` - Mobile fallback link
