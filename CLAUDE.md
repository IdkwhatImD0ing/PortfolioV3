# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website with voice interaction capabilities, built as a full-stack application:

- **Frontend**: Next.js 15 with TypeScript, React 19, and TailwindCSS
- **Backend**: FastAPI Python server with Retell voice AI integration
- **3D Graphics**: React Three Fiber with Drei and Rapier physics

## Development Commands

### Frontend (client/)

```bash
cd client
npm run dev         # Start development server with Turbopack
npm run build       # Build production bundle
npm run start       # Start production server
npm run lint        # Run Next.js linting
```

### Backend (server/)

```bash
cd server
pip install -r requirements.txt    # Install Python dependencies
uvicorn main:app --reload          # Start FastAPI development server
```

## Architecture

### Frontend Structure

- **`client/src/app/`**: Next.js app router pages and API routes
  - `page.tsx`: Main portfolio page with voice chat integration
  - `api/create-web-call/`: API endpoint for Retell call setup
- **`client/src/components/`**: React components
  - `education.tsx`, `personal.tsx`, `project.tsx`: Portfolio sections
  - `VoiceChatSidebar.tsx`: Voice interaction UI
  - `Lanyard/`: 3D card component with GLB model
  - `ui/`: Reusable UI components (shadcn/ui based)
- **Styling**: TailwindCSS with custom theme configuration, dark mode support via next-themes

### Backend Structure

- **`server/main.py`**: FastAPI application with WebSocket support for Retell
- **`server/socket_manager.py`**: WebSocket connection management
- **`server/llm.py`**: LLM client for voice interactions
- **`server/custom_types.py`**: Type definitions for Retell integration

### Key Integrations

1. **Retell Voice AI**: Real-time voice conversation handling

   - Frontend: `retell-client-js-sdk` for browser WebRTC
   - Backend: WebSocket server for audio streaming
   - Webhook endpoints for call events

2. **3D Graphics**: Portfolio displays with React Three Fiber

   - GLB model loading configured in `next.config.ts`
   - Physics simulation with Rapier

3. **Environment Variables**: Both frontend and backend use `.env` files
   - Backend requires `RETELL_API_KEY` for voice services

## Important Notes

- TypeScript strict mode is enabled
- Path alias `@/*` maps to `client/src/*`
- CORS configured for `http://localhost:3000` in development
- WebSocket support required for voice chat functionality
