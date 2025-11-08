# Voice Agent Application

## Overview

This is a full-stack voice AI assistant application featuring real-time voice interaction capabilities. The application includes:

- **Frontend**: React + Vite client with WebSocket communication
- **Backend**: Express server with Socket.IO for real-time bidirectional communication
- **AI Integration**: Google Gemini API for voice processing and text-to-speech
- **Database**: PostgreSQL (Neon) for session and message persistence

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── api/        # HTTP and session API
│   │   └── hooks/      # React hooks
│   └── vite.config.ts  # Vite configuration
├── server/              # Node.js backend
│   ├── src/
│   │   ├── config/     # Environment configuration
│   │   ├── controllers/
│   │   ├── db/         # Database client (PostgreSQL with Drizzle ORM)
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/   # LLM and voice session services
│   │   └── ws/         # WebSocket gateway
├── shared/             # Shared schema and types
│   └── schema.ts       # Drizzle database schema
└── package.json        # Root workspace config
```

## Current State

The application has been configured to run in the Replit environment:

- ✅ Dependencies installed and built for Node.js 20
- ✅ Frontend configured to run on port 5000 (required for Replit)
- ✅ Backend running on port 4000
- ✅ PostgreSQL database configured with Drizzle ORM
- ✅ WebSocket communication configured
- ✅ Mock LLM mode enabled by default
- ✅ Deployment configuration set up

## Recent Changes

**Date**: November 8, 2025

1. **Bug Fixes and TypeScript Configuration**:
   - Fixed TypeScript errors by creating `vite-env.d.ts` with proper type definitions for `import.meta.env`
   - Created `tsconfig.node.json` for Vite config files following best practices
   - Updated `tsconfig.json` to include project references for proper type-checking
   - Replaced Tailwind CSS CDN with proper PostCSS-based installation (v3.x)
   - Created Tailwind and PostCSS configuration files for production-ready builds
   - All LSP errors resolved, app now runs cleanly without warnings

2. **Database Migration to PostgreSQL**:
   - Migrated from SQLite to Replit's built-in PostgreSQL database
   - Implemented Drizzle ORM for type-safe database access
   - Created shared schema package for database types
   - Updated all database operations to use async/await pattern
   - Added `npm run db:push` command for schema migrations

**Previous Changes - November 8, 2024**

1. **Port Configuration**: Updated frontend from port 5173 to port 5000 for Replit compatibility
2. **HMR Setup**: Added HMR client port configuration for hot module reloading
3. **Proxy Configuration**: Added Vite proxy for /api and /socket.io endpoints to backend
4. **Host Allowance**: Configured `allowedHosts: true` to allow Replit proxy domain requests
5. **Environment Handling**: 
   - Automatically detects REPLIT_DEV_DOMAIN or REPLIT_DOMAINS for CLIENT_ORIGIN
   - Falls back to localhost:5000 for local development
   - Client uses relative URLs for API and WebSocket connections (proxied through Vite)

## Environment Variables

### Required for Full Functionality

- `GEMINI_API_KEY`: Your Google Gemini API key (optional in mock mode)
- `GEMINI_MODEL`: Gemini model to use (default: gemini-1.5-pro-latest)

### Optional Configuration

- `PORT`: Backend server port (default: 4000)
- `CLIENT_ORIGIN`: Frontend URL (auto-detected from REPLIT_DOMAINS)
- `JWT_SECRET`: Secret for JWT token signing (default: dev-secret)
- `SERVER_API_KEY`: Server API authentication key (default: dev-admin-key)
- `MOCK_LLM`: Enable mock LLM mode without API key (default: true)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window (default: 60000)
- `RATE_LIMIT_MAX`: Max requests per window (default: 60)

## Getting Started

### Running in Development

The application runs automatically via the configured workflow. Both frontend and backend start concurrently.

### Enabling Real AI (Gemini)

The app currently runs in mock mode. To enable real AI voice processing:

1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add `GEMINI_API_KEY` to your Replit Secrets
3. Set environment variable `MOCK_LLM=false` or remove it

**Note**: The app requires Gemini's audio capabilities (audio input/output), which may not be available in all Gemini integrations.

### Features

- Real-time voice input processing
- AI-powered voice responses
- Session management
- Conversation history
- Stage-based conversation flow
- WebSocket-based bidirectional communication

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Socket.IO Client
- **Backend**: Node.js 20, Express, Socket.IO, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **AI**: Google Gemini API (@google/genai)
- **Build**: TypeScript, Vite

## Deployment

The application is configured to deploy as a VM (stateful) deployment:

- **Build**: Runs `npm run build` to compile TypeScript and build Vite bundle
- **Run**: Starts backend server and frontend preview server concurrently
- **Type**: VM deployment (maintains WebSocket connections and in-memory state)

## Architecture Notes

- Uses monorepo structure with npm workspaces (client, server, shared)
- WebSocket gateway handles voice streaming
- Session data persists to PostgreSQL database using Drizzle ORM
- Supports both mock and real LLM services
- Frontend proxies API requests to backend via Vite dev server in development

## Database Management

The application uses Drizzle ORM for database schema management:

- **Schema**: Define tables in `shared/schema.ts`
- **Migration**: Run `npm run db:push` to sync schema to database
- **Force Migration**: Use `npm run db:push --force` if needed for data-loss changes
- **Environment**: DATABASE_URL automatically set by Replit
