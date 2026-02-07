# Mobile Layout Components

Documentation for the mobile-specific layout used on viewports <= 768px.

## File Locations

- `src/components/MobileLayout.tsx` - Main mobile wrapper
- `src/components/MobileControlBar.tsx` - Voice/text controls

## Purpose

Replaces the desktop sidebar layout with a mobile-optimized experience using a custom bottom drawer panel for chat and full-screen animated page transitions.

## Architecture

```
MobileLayout
├── Header Bar (profile avatar, page label, chat toggle)
├── Main Content (AnimatePresence page transitions)
│   ├── LandingPage (isMobile=true)
│   ├── PersonalPage
│   ├── EducationPage
│   ├── ProjectPage
│   └── ResumePage
└── Bottom Drawer (custom CSS transition)
    ├── Drag Handle
    ├── Transcript (when expanded)
    └── MobileControlBar
        ├── Mode Toggle (voice/text)
        ├── Voice Controls (start/pause/end)
        └── Text Input + Send
```

## MobileLayout Props

| Prop | Type | Description |
|------|------|-------------|
| `activePage` | `"landing" \| "education" \| "project" \| "personal" \| "resume"` | Current page |
| `setActivePage` | `(page) => void` | Page navigation callback |
| `currentProjectId` | `string?` | Selected project ID |
| `isCalling` | `boolean` | Voice call active |
| `startCall` | `() => void` | Start voice call |
| `endCall` | `() => void` | End voice call |
| `isAgentTalking` | `boolean` | Agent currently speaking |
| `transcript` | `TranscriptEntry[]` | Conversation history |
| `chatMode` | `"voice" \| "text"` | Current input mode |
| `setChatMode` | `(mode) => void` | Switch input mode |
| `sendTextMessage` | `(content: string) => void` | Send text message |
| `isTextLoading` | `boolean` | Text response loading |

## Bottom Drawer

Uses a custom fixed-position panel with CSS `transition-[height]` to animate between collapsed and expanded states. Content remains interactive behind the drawer since it is not a modal overlay.

### Height States

| State | Height | When Used |
|-------|--------|-----------|
| Collapsed | `160px` | Default in voice mode; after page navigation |
| Expanded | `55dvh` | Default in text mode; transcript visible |

### Auto-Expand/Collapse Behavior

- **Mode change to text**: Auto-expands to 55dvh
- **Mode change to voice**: Auto-collapses to 160px
- **Page navigation**: Auto-collapses to 160px + shows toast notification

## Scroll Containment

The mobile layout uses multiple scroll containers (main content and the transcript inside the bottom drawer). To prevent mobile browsers from locking scroll onto the wrong container, the following containment pattern is applied:

- **Main content** (`<main>`): `overflow-y-auto` + `overscroll-y-contain` prevents scroll chaining from the page content into the fixed bottom panel.
- **Bottom panel**: `overflow-hidden` + `overscroll-contain` prevents its scroll events from propagating to the main content.
- **Transcript area**: `overflow-y-auto` only when the drawer is expanded. When collapsed, switches to `overflow-hidden` (along with `opacity-0` and `pointer-events-none`) to fully remove it from the browser's scroll chain. This prevents mobile Safari/Chrome from targeting the hidden transcript as a scroll container, which could cause the main content scroll to appear "stuck."

## Page Transitions

Pages are wrapped in `AnimatePresence mode="wait"` with a subtle fade + vertical slide:

```tsx
<motion.div
  key={activePage}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -12 }}
  transition={{ duration: 0.25, ease: "easeInOut" }}
/>
```

When the AI navigates to a new page, the drawer collapses to reveal the content transition and a toast notification appears briefly.

## Header Bar

Compact top bar with:
- Profile avatar (32px) with agent-speaking indicator (animated dot)
- Current page label
- Chat toggle button with message count badge

## MobileControlBar

Renders inside the drawer footer. Same controls as the desktop sidebar but in a mobile-friendly layout:

- **Voice mode, idle**: Full-width "Start Voice Chat" button
- **Voice mode, calling**: Pause + End buttons with waveform visualization
- **Text mode**: Text input + send button

Includes `env(safe-area-inset-bottom)` padding for phones with home indicators.

## Related Files

- [page.md](page.md) - Parent component that conditionally renders MobileLayout
- [app-sidebar.md](app-sidebar.md) - Desktop equivalent (sidebar)
- [../pages/landing.md](../pages/landing.md) - Landing page mobile adaptations
