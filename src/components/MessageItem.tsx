import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../types";
import { useAuth } from "../context/AuthContext";
import { ReactionPicker } from "./ReactionPicker";
import { isVip } from "../utils/vip";
import { Crown, Reply, Smile } from "lucide-react";

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
        className="flex items-center justify-center my-2 px-4"
      >
        <div className="h-px bg-white/5 flex-1" />
        <span className="px-3 text-[11px] text-gray-500 font-medium">
          {message.text}
        </span>
        <div className="h-px bg-white/5 flex-1" />
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
  const isOwn = user?._id === message.senderId;
  const vip = isVip(message.senderId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`group relative flex gap-3 px-4 py-1 hover:bg-white/[0.04] transition-colors ${
        isOwn ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <button
        type="button"
        onClick={() => onAvatarClick(message.senderId)}
        className="relative flex-shrink-0 mt-0.5 focus:outline-none self-start"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm transition-transform hover:scale-105 ${
            vip
              ? "ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.3)] bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400"
              : "bg-gradient-to-tr from-indigo-600 to-purple-600"
          }`}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        {vip && (
          <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-[#111214] rounded-full border border-amber-400/60">
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>
        )}
      </button>

      {/* Content */}
      <div className={`min-w-0 flex-1 ${isOwn ? "text-right" : ""}`}>
        <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={() => onAvatarClick(message.senderId)}
            className={`text-sm font-semibold hover:underline ${
              vip ? "text-amber-400" : isOwn ? "text-indigo-400" : "text-gray-100"
            }`}
          >
            {vip && !isOwn ? '★ ' : ''}{isOwn ? "You" : displayName}
          </button>
          <span className="text-[10px] text-gray-600 group-hover:text-gray-500 transition-colors">
            {time}
          </span>
        </div>

        {message.replyTo && (
          <div className="flex items-center gap-2 mb-1 text-xs border-l-2 border-indigo-500 pl-2">
            <span className="font-semibold text-indigo-400 truncate">
              @{message.replyTo.senderName}
            </span>
            <span className="text-gray-500 truncate">
              {message.replyTo.text}
            </span>
          </div>
        )}

        <p className="text-sm leading-relaxed text-gray-100 break-words whitespace-pre-wrap">
          {message.text}
        </p>

        {reactionKeys.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? "flex-row-reverse" : ""}`}>
            {reactionKeys.map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => onReaction(message.id, emoji)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border transition-colors ${
                  hasReacted(emoji)
                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                    : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:border-white/10"
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
        className={`absolute -top-3 hidden group-hover:flex items-center bg-[#18191c] border border-white/10 rounded-lg shadow-xl z-20 ${
          isOwn ? "left-4" : "right-4"
        }`}
      >
        <button
          type="button"
          onClick={() => onReply(message)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-l-lg"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors rounded-r-lg"
            title="Add Reaction"
          >
            <Smile className="w-3.5 h-3.5" />
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
