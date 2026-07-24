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
        className="flex items-center justify-center my-3 px-4"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] text-gray-400 font-medium">
          {message.text}
        </span>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-1" />
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
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 450, damping: 28 }}
      className={`group relative flex gap-3 px-2 sm:px-4 py-1.5 rounded-2xl transition-all duration-200 ${
        isOwn ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar Container with VIP Decoration */}
      <button
        type="button"
        onClick={() => onAvatarClick(message.senderId)}
        className="relative flex-shrink-0 self-end mb-1 focus:outline-none"
      >
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md transition-transform hover:scale-105 ${
            vip
              ? "ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.4)] bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400"
              : "bg-gradient-to-tr from-indigo-600 to-purple-600"
          }`}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        {vip && (
          <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-black rounded-full border border-amber-400/60 shadow-lg">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
        )}
      </button>

      {/* Bubble & Metadata */}
      <div
        className={`min-w-0 max-w-[85%] sm:max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-center gap-2 mb-1 px-1 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <button
            type="button"
            onClick={() => onAvatarClick(message.senderId)}
            className={`text-xs font-bold hover:underline flex items-center gap-1 ${
              vip
                ? "admin-font text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]"
                : "user-font text-gray-300"
            }`}
          >
            {displayName}
            {vip && (
              <Crown className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
            )}
          </button>
          <span className="text-[10px] text-gray-500">{time}</span>
        </div>

        <div
          className={`relative p-3 sm:p-3.5 rounded-2xl shadow-lg border backdrop-blur-md ${
            isOwn
              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500/30 text-white rounded-br-none"
              : vip
                ? "bg-amber-950/20 border-amber-500/30 text-amber-50 rounded-bl-none shadow-[0_0_15px_rgba(251,191,36,0.05)]"
                : "bg-white/5 border-white/10 text-gray-100 rounded-bl-none"
          }`}
        >
          {/* Reply Banner */}
          {message.replyTo && (
            <div
              className={`flex items-center gap-2 mb-2 p-2 rounded-lg text-xs border ${
                isOwn
                  ? "bg-black/20 border-white/10 text-indigo-100"
                  : "bg-black/40 border-white/5 text-gray-300"
              }`}
            >
              <Reply className="w-3 h-3 text-indigo-400" />
              <span className="font-semibold text-indigo-300">
                @{message.replyTo.senderName}:
              </span>
              <span className="truncate opacity-80">
                {message.replyTo.text}
              </span>
            </div>
          )}

          <p className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.text}
          </p>

          {/* Reactions */}
          {reactionKeys.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-1">
              {reactionKeys.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => onReaction(message.id, emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                    hasReacted(emoji)
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-200"
                      : "bg-black/30 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{message.reactions![emoji].length}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Actions */}
      <div
        ref={actionMenuRef}
        className={`absolute -top-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center bg-[#18191c] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden ${
          isOwn ? "left-4" : "right-4"
        }`}
      >
        <button
          type="button"
          onClick={() => onReply(message)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker((prev) => !prev)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
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
