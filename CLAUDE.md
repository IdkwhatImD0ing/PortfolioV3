# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack portfolio application featuring an AI voice assistant integration. The project consists of:

- **Frontend**: Next.js 15.2.4 React application with TypeScript
- **Backend**: FastAPI Python server with WebSocket support for real-time communication
- **AI Integration**: Retell AI SDK for voice conversation capabilities
- **Real-time**: Pusher for live updates and WebSocket connections

## Development Commands

### Frontend (client/)
```bash
cd client
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend (server/)
```bash
cd server
pip install -r requirements.txt  # Install Python dependencies
python main.py                   # Start FastAPI server
```

## Architecture Overview

### Frontend Structure
- **App Router**: Uses Next.js App Router with TypeScript
- **UI Components**: Built with Radix UI primitives and custom components
- **Styling**: Tailwind CSS with custom theming and animations
- **State Management**: React hooks for local state, no external state management
- **Real-time**: Pusher client for live updates
- **Voice Integration**: Retell Web Client SDK for voice interactions

### Backend Structure  
- **API Framework**: FastAPI with automatic OpenAPI documentation
- **WebSocket Handling**: Dual WebSocket setup:
  - `/llm-websocket/{call_id}`: Handles Retell AI voice processing
  - `/ws`: General client communications with connection management
- **LLM Integration**: Custom LLM client (`llm.py`) for AI conversation handling
- **Event Management**: Webhook endpoint for Retell AI events

### Key Components Architecture
- **VoiceChatSidebar**: Main voice interface with real-time transcript display
- **PersonalPage/EducationPage/ProjectPage**: Portfolio content sections
- **Theme Integration**: Dark mode support with next-themes

### Real-time Communication Flow
1. Client connects to FastAPI WebSocket endpoint
2. Retell AI handles voice-to-text conversion
3. LLM client processes conversation context
4. Responses flow back through WebSocket to update UI
5. Pusher handles additional real-time features

## Important Implementation Details

### Voice Integration
- Uses Retell AI for voice processing with dedicated WebSocket connection
- Conversation state managed through transcript arrays
- WebSocket connection management includes automatic reconnection
- Voice activity visualization using Motion animations

### WebSocket Architecture
- **Connection Management**: `socket_manager.py` handles client connections
- **Dual WebSocket Pattern**: Separate endpoints for AI communication and general client updates
- **Error Handling**: Comprehensive error handling for connection timeouts and disconnections

### Security Considerations
- CORS middleware configured for localhost development
- API key authentication for Retell AI integration
- Signature verification for webhook endpoints

### Development Notes
- **3D Dependencies Present**: React Three Fiber ecosystem installed but unused in current implementation
- **Animation Library**: Uses Motion (successor to Framer Motion) for 2D animations
- **Component Patterns**: Uses compound component patterns with Radix UI primitives
- **TypeScript**: Strict TypeScript configuration throughout