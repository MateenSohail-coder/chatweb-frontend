# Product Requirements Document (PRD) - Ephemeral Real-Time Chat Application

## 1. Project Overview
A privacy-focused, zero-message-retention real-time chat platform. Core user data (auth, profile) is persisted in MongoDB, while chat messages are purely ephemeral—streamed over WebSockets, cached in client LocalStorage with a TTL (Time-To-Live) expiration, and never saved to a database.

## 2. Target Audience & Value Proposition
* **Target Audience:** Developers, recruiters, and privacy-conscious users.
* **Portfolio Goal:** Showcase advanced MERN skills, real-time WebSocket state synchronization, and complex client-side storage handling.

## 3. Core Features
1. **Authentication & Profile Management**
   * Auth: Email/Password JWT-based authentication.
   * Profile: Avatar selection, status text, custom privacy settings.
   * Discovery: User search and public profile views.
2. **Real-Time Communication (Socket.io)**
   * Multi-user room & direct message streaming.
   * In-memory message routing (No DB persistence).
   * Typing indicators with debounced timeouts.
   * Presence management: Online, Away, Offline real-time badges.
   * Room Activity Notifications: System events when users join, leave, or register.
3. **Interactive Messaging System (Frontend)**
   * Reply / Threading UI anchor.
   * Message Reactions (Emoji picker with real-time reaction sync).
   * Local Cache Expiration: Auto-deletion of local messages after a configurable duration (e.g., 6 hours).