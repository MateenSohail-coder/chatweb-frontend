# System Architecture

## Data Flow Diagram

[ Client React App ]
     |
     +--- HTTP Requests (REST API) ---> [ Express Backend ] ---> [ MongoDB ]
     |                                   (Auth, Profiles)       (User Specs Only)
     |
     +<== Duplex WebSockets (Socket.io) ==>[ Memory Event Bus ]
                                           (Status, Messages, Typing)

## Architectural Constraints
1. **Message Zero-Persistence Rule:** The backend MUST NOT import any Message model or connect to any database collection for chat logs. Messages pass through the Socket.io server as in-memory event payloads only.
2. **Client State Engine:** Messages are rendered from React state and synchronized with `window.localStorage` (or IndexedDB). An eviction script sweeps expired messages based on timestamp diffs.
3. **Presence Tracker:** Socket connection maps user IDs to active `socket.id` instances using an in-memory `Map()`.