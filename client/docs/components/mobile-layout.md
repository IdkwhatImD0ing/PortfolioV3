# Mobile Layout Components

Documentation for the mobile-specific layout used on viewports <= 768px.

## File Locations

- `src/components/MobileLayout.tsx` - Main mobile wrapper
- `src/components/MobileControlBar.tsx` - Voice/text controls

## Purpose

Replaces the desktop sidebar layout with a mobile-optimized experience using a bottom drawer (vaul) for chat and full-screen animated page transitions.

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
└── Bottom Drawer (vaul)
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

## Bottom Drawer (vaul)

Uses vaul directly (not the shadcn wrapper) with `modal={false}` so content remains interactive behind the drawer.

### Snap Points

| Snap Point | Height | When Used |
|------------|--------|-----------|
| `"148px"` | Control bar only | Default in voice mode; after page navigation |
| `0.55` | 55% viewport | Default in text mode; transcript visible |
| `0.9` | 90% viewport | Full transcript view (user-dragged) |

### Auto-Snap Behavior

- **Mode change to text**: Auto-expands to 55%
- **Mode change to voice**: Auto-collapses to 148px
- **Page navigation**: Auto-collapses to 148px + shows toast notification

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
