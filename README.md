# Maya Voice Agent (Node + Thin Client)

A full-stack voice onboarding assistant refactored into a secure Node.js + WebSocket backend with a thin Vite/React client. The browser now only captures microphone audio and renders responses; all LLM interactions, audio synthesis, and session persistence live on the server.

## Project Structure

```
.
+- client/                # Vite + React UI
¦  +- src/api             # REST helpers
¦  +- src/hooks           # useConversationManager with socket transport
¦  +- ...
+- server/                # Express + Socket.IO backend
¦  +- src/services        # LLM proxy, audio helpers, session store
¦  +- src/ws              # Voice gateway namespace
¦  +- migrations          # SQLite schema files
¦  +- tests               # Vitest specs (REST + WS)
+- Dockerfile             # Builds the API image
+- client/Dockerfile      # Builds the static client image
+- docker-compose.yml     # boots server + client containers
+- .env.example           # shared configuration template
```

## Prerequisites

- Node.js 18+ (20.x recommended)
- npm 10+
- ffmpeg is **not** required; PCM conversion handled in code
- For Gemini integration, obtain a `GEMINI_API_KEY`

## Setup & Development

```bash
cp .env.example .env             # add secrets + overrides
npm install                      # installs root + workspace deps
npm run db:migrate --prefix server  # optional manual migration run
npm run dev                      # starts server (port 4000) + client (5173)
```

### Environment Variables

Key values (see `.env.example` for the complete list):

| Variable | Description |
| --- | --- |
| `PORT` | Server HTTP port (default 4000) |
| `CLIENT_ORIGIN` | Allowed origin for CORS/WebSocket |
| `DATABASE_URL` | SQLite file path (e.g., `file:./data/dev.db`) |
| `JWT_SECRET` | Signing key for session tokens |
| `GEMINI_API_KEY` | Optional – enables real Gemini responses when `MOCK_LLM=false` |
| `MOCK_LLM` | Default `true`, uses deterministic mock audio/text |
| `VITE_API_BASE_URL` | Client -> API base (http://localhost:4000) |
| `VITE_SOCKET_URL` | Client -> Socket namespace (http://localhost:4000) |

## Testing

Server tests cover audio helpers, REST endpoints, and the WebSocket voice pipeline:

```bash
npm run test:server
```

Client unit tests (Vitest + RTL) can be added via `npm run test:client` (placeholder command wired up).

## Database

- SQLite via `better-sqlite3`.
- SQL files in `server/migrations/*.sql` run automatically on boot.
- Tables: `sessions`, `messages`, plus `schema_migrations` tracker.

## Docker

Build both services and run them with Docker Compose:

```bash
docker-compose up --build
```

- API available at http://localhost:4000
- Client preview served from http://localhost:5173 (calls API via the internal hostname `server`).

## API + WebSocket Highlights

### REST

- `POST /api/sessions` ? `{ session, token }`
- `GET /api/sessions/:id` (Bearer token)
- `GET /api/sessions/:id/messages` (Bearer token)
- `GET /api/sessions` (admin `x-api-key`)

### WebSocket (`/voice` namespace)

Client authenticates with the session JWT (`auth: { token }`). Events:

| Event | Direction | Payload |
| --- | --- | --- |
| `client:audio_chunk` | client ? server | `ArrayBuffer` PCM16 chunk at 16 kHz |
| `server:transcript` | server ? client | `{ speaker: 'agent', text, timestamp, stageId }` |
| `server:agent_audio` | server ? client | `{ audio: ArrayBuffer, sampleRate }` |
| `server:ready` | server ? client | `{ sessionId }` |

## Scripts

- `npm run dev` – concurrent server + client dev servers
- `npm run build` – compiles server TS + client bundle
- `npm run docker` – shorthand for `docker-compose up --build`
- `npm run test` – runs server + client test suites

## Next Steps

- Plug in live Gemini responses by setting `GEMINI_API_KEY` and `MOCK_LLM=false`
- Swap SQLite for Postgres by updating `DATABASE_URL`
- Expand auth (JWT refresh / API key rotation) as needed
