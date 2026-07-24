# AI Code Generation Guidelines

1. **DB Isolation:** Never write code that attempts to save or query chat messages from MongoDB.
2. **Type Safety & Contracts:** Follow the defined API and Socket payload contracts strictly.
3. **Error Handling:** Every API endpoint must return standardized JSON response blocks (`{ success: boolean, data|error: object }`).
4. **Performance:** Debounce typing indicators (500ms) on the frontend to avoid WebSocket flooding. Clean up socket event listeners on React component unmount.