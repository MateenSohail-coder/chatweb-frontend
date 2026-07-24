# Ephemeral Chat — Client

Real-time ephemeral messaging client built with React, Socket.io, and Tailwind CSS. Messages are never persisted server-side — only cached locally with TTL-based auto-eviction.

## Features

### Storage Management
- `chatStorage.ts` — LocalStorage-based message cache indexed by room
- TTL cleanup on boot and periodic intervals (default: 6 hours, configurable via `chat_ttl` key)
- `getMessages`, `saveMessage`, `saveMessages`, `clearRoom`, `clearAll`, `clearExpired`

### Socket Integration
- JWT-authenticated Socket.io connection via `SocketContext`
- Real-time presence tracking with online/offline status indicators
- Typing indicators with debounced emit (500ms) and auto-timeout (3s)
- Live system announcements ("User X joined the room")

### Chat Features
- **Message List** — Timestamps, sender details, system announcements divider
- **Reply** — Click message to quote/reply; preview banner above input (Escape to cancel)
- **Emoji Reactions** — Hover action bar with reaction picker; inline reaction counters with highlight for user's own reactions
- **Profile Modal** — Click avatar to view full user profile fetched via REST API

## Components

| Component | Description |
|-----------|-------------|
| `ChatWindow` | Main chat area with message list, typing indicator, and input |
| `Sidebar` | Online user list with presence indicators and user panel |
| `MessageItem` | Message row with reply chain, reactions, and hover action bar |
| `ReactionPicker` | Emoji grid picker with click-outside dismiss |
| `ProfileModal` | User profile card with banner, avatar, and details |
| `ChatInput` | Textarea with reply preview, send/typing emit |
| `TypingIndicator` | Animated dots + "user is typing..." label |

## Architecture

```
src/
  types/          — TypeScript interfaces (User, Message, PresenceData, etc.)
  utils/          — chatStorage.ts (TTL cache layer)
  services/       — api.ts (REST client for auth + profiles)
  context/        — AuthContext, SocketContext
  hooks/          — useMessages, useTyping, usePresence
  components/     — UI components
  App.tsx         — Root layout with auth gate
  index.css       — Tailwind v4 + Discord dark theme
```

## Getting Started

```bash
pnpm install
pnpm dev
```

Environment variables (optional):
- `VITE_API_URL` — REST API base URL (default: `http://localhost:5000/api`)
- `VITE_SOCKET_URL` — Socket.io server URL (default: `http://localhost:5000`)
