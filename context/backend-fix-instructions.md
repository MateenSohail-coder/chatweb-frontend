# Backend Fix Instructions — Required Changes for Client Integration

## Problem

The frontend cannot discover existing online users because:
1. `presence_update` and `system_announcement` (for user_connected) use `socket.broadcast.emit` — these only reach OTHER sockets, not the connecting socket.
2. No `get_online_users` handler exists to return the current online list on demand.
3. `send_message` routes only by `recipientId` via presenceMap — no group chat / room support.

## Required Socket Handler Changes

### 1. Add `get_online_users` handler (`socket/handler.ts`)

```ts
socket.on('get_online_users', () => {
  socket.emit('online_users_list', { users: Array.from(presenceMap.keys()) });
});
```

This lets the frontend request the current online user list on connection.

### 2. Change `system_announcement` on connect to reach ALL sockets (`socket/handler.ts`)

Current (broken):
```ts
socket.broadcast.emit('system_announcement', { text: `${userId} is now online`, timestamp: Date.now() });
```

Fix — use `io.emit` so the connecting socket ALSO receives it:
```ts
const io = getIO();
io.emit('system_announcement', { text: `${userId} is now online`, timestamp: Date.now() });
```

This ensures all connected clients (including the one that just connected) know about all users coming online.

Same for disconnect:
```ts
// Change from socket.broadcast.emit to io.emit
io.emit('system_announcement', { text: `${userId} has disconnected`, timestamp: Date.now() });
```

### 3. Option A: Add group chat room support in `send_message` (`socket/handler.ts`)

For a true group chat, change `send_message` to broadcast to a room when `recipientId` equals room name:

```ts
socket.on('send_message', (data) => {
  const targetSocketId = presenceMap.get(data.recipientId);
  if (targetSocketId) {
    // DM — route to specific user
    socket.to(targetSocketId).emit('receive_message', data);
  } else {
    // Group chat — broadcast to all connected sockets
    const io = getIO();
    io.emit('receive_message', data);
  }
});
```

### 3. Option B: Keep per-user sends on frontend (works if presence is fixed)

If only #1 and #2 are implemented, the frontend will correctly get the online user list and send messages to each online user individually via `send_message { recipientId: userId }`. This works but is less efficient than server-side broadcast.

### 4. Typing & Reactions — same pattern as messages

For consistency, `typing_start/stop` and `add_reaction` should also broadcast to all when the recipient isn't in the presenceMap (same logic as #3).

## Summary of Required Changes

| Handler | Change | Priority |
|---------|--------|----------|
| `get_online_users` | Add new handler returning `presenceMap.keys()` | **Required** |
| `system_announcement` (connect) | Change `socket.broadcast.emit` → `io.emit` | **Required** |
| `system_announcement` (disconnect) | Change `socket.broadcast.emit` → `io.emit` | **Required** |
| `send_message` | Add broadcast fallback when recipientId not in presenceMap | Recommended |
| `typing_start/stop` | Same broadcast fallback | Recommended |
| `add_reaction` | Same broadcast fallback | Recommended |

## Expected Client Behavior After Fix

1. User A connects → server adds to presenceMap → `io.emit('system_announcement', "A is now online")` → ALL clients (including A) receive it
2. Frontend parses "A is now online" → adds A to online set
3. User A also emits `get_online_users` → server responds with `{ users: ["A", "B", ...] }` → A adds all to online set
4. User A sends a message → frontend iterates online set and emits `send_message` for each other user → server routes to each recipient
5. If Option A (#3) is implemented, frontend can simply emit once with `recipientId: 'general'` and server broadcasts to all
