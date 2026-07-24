import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../types";
import { useAuth } from "../context/AuthContext";
import { ReactionPicker } from "./ReactionPicker";

interface MessageItemProps {
  message: Message;
  onReply: (message: Message) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onAvatarClick: (userId: string) => void;
}

export function MessageItem({
  message,
  onReply,
  onReaction,
  onAvatarClick,
}: MessageItemProps) {
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  if (message.isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center py-2 px-4"
      >
        <div className="h-px bg-[#3f4147] flex-1" />
        <span className="px-3 text-xs text-[#949ba4] font-medium whitespace-nowrap select-none">
          {message.text}
        </span>
        <div className="h-px bg-[#3f4147] flex-1" />
      </motion.div>
    );
  }

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const reactionKeys = message.reactions ? Object.keys(message.reactions) : [];
  const hasReacted = (emoji: string) =>
    user && message.reactions?.[emoji]?.includes(user._id);
  const displayName = message.senderName || message.senderId.slice(0, 8);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative flex gap-3 px-4 py-1 hover:bg-[rgba(79,84,92,0.16)] transition-colors duration-150 rounded-md mx-2 my-0.5"
    >
      {/* Avatar */}
      <button
        type="button"
        onClick={() => onAvatarClick(message.senderId)}
        className="flex-shrink-0 mt-0.5 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-sm font-bold shadow-sm hover:scale-105 transition-transform">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      {/* Message Body */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline gap-2">
          <button
            type="button"
            onClick={() => onAvatarClick(message.senderId)}
            className="text-sm font-semibold text-[#f2f3f5] hover:underline focus:outline-none"
          >
            {displayName}
          </button>
          <span className="text-[11px] text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        </div>

        {/* Reply Quote Banner */}
        {message.replyTo && (
          <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-[#2b2d31]/60 border-l-2 border-[#5865F2] rounded-r-md text-xs">
            <span className="font-semibold text-[#5865F2] truncate">
              @{message.replyTo.senderName}
            </span>
            <span className="text-[#b5bac1] truncate">
              {message.replyTo.text}
            </span>
          </div>
        )}

        {/* Text */}
        <p className="text-[15px] leading-[1.375] text-[#dbdee1] mt-0.5 break-words selection:bg-[#5865F2] selection:text-white">
          {message.text}
        </p>

        {/* Reactions List */}
        {reactionKeys.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {reactionKeys.map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => onReaction(message.id, emoji)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium border transition-colors ${
                  hasReacted(emoji)
                    ? "bg-[#5865F2]/20 border-[#5865F2] text-[#f2f3f5]"
                    : "bg-[#2b2d31] border-transparent text-[#b5bac1] hover:border-[#3f4147] hover:text-[#dbdee1]"
                }`}
              >
                <span>{emoji}</span>
                <span>{message.reactions![emoji].length}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      <div
        ref={actionMenuRef}
        className="absolute right-4 -top-3 hidden group-hover:flex items-center bg-[#313338] border border-[#3f4147] rounded-md shadow-lg z-20 overflow-visible"
      >
        <button
          type="button"
          onClick={() => onReply(message)}
          className="p-1.5 text-[#b5bac1] hover:text-[#f2f3f5] hover:bg-[#35373c] rounded-l-md transition-colors"
          title="Reply"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 17 4 12 9 7" />
            <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
          </svg>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            className="p-1.5 text-[#b5bac1] hover:text-[#f2f3f5] hover:bg-[#35373c] rounded-r-md transition-colors"
            title="Add Reaction"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>

          <AnimatePresence>
            {showPicker && (
              <ReactionPicker
                onSelect={(emoji) => {
                  onReaction(message.id, emoji);
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
