# Client Documentation

AI agent documentation for the Next.js frontend of Bill Zhang's voice portfolio.

## Overview

This is a Next.js 15 App Router application with real-time voice chat powered by Retell AI. The frontend receives navigation commands from the backend via WebSocket metadata events, enabling voice-driven page navigation.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.2.8 | React framework (App Router) |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Retell SDK | 2.0.5 | Voice chat integration |
| Motion | 12.5.0 | Animations (Framer Motion) |
| Radix UI | Various | UI primitives (shadcn/ui) |

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main page (state management)
│   ├── layout.tsx            # Root layout
│   ├── api/create-web-call/  # Retell API proxy
│   └── globals.css           # Global styles
├── components/
│   ├── app-sidebar.tsx       # Voice chat UI
│   ├── LandingPage.tsx       # Landing page
│   ├── education.tsx         # Education page
│   ├── project.tsx           # Project page
│   ├── personal.tsx          # Personal page
│   └── ui/                   # shadcn/ui components
├── lib/
│   └── dataCache.ts          # Project data caching
├── hooks/
│   └── use-toast.ts          # Toast notifications
└── types/
    └── api.ts                # API type definitions
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8000` for dev, `https://fastapi-ws-815644024160.us-west1.run.app` for prod) |
| `NEXT_PUBLIC_RETELL_AGENT_ID` | Yes | Retell agent identifier (client-side) |
| `RETELLAI_API_KEY` | Yes | Retell API key (server-side only) |

## Development Commands

```bash
cd client
npm install          # Install dependencies
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Documentation Index

### Pages
- [pages/landing.md](pages/landing.md) - Landing page component
- [pages/education.md](pages/education.md) - Education page component
- [pages/project.md](pages/project.md) - Project page component
- [pages/personal.md](pages/personal.md) - Personal page component

### API Routes
- [api/create-web-call.md](api/create-web-call.md) - Retell web call creation

### Core Components
- [components/page.md](components/page.md) - Main page state management
- [components/app-sidebar.md](components/app-sidebar.md) - Voice chat sidebar

### Libraries
- [lib/data-cache.md](lib/data-cache.md) - Project data caching

## Data Flow

```
User clicks "Start Voice" → startCall() in page.tsx
    → POST /api/create-web-call → Retell API
    → Returns access_token
    → Retell SDK connects via WebRTC

User speaks → Retell transcribes → Backend processes
    → Backend sends metadata event → page.tsx receives
    → setActivePage() → UI updates
```

## Related Documentation

- [../server/docs/README.md](../../server/docs/README.md) - Backend documentation
- [../pinecone/docs/README.md](../../pinecone/docs/README.md) - Vector database documentation
