import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../types";
import { Send, X, CornerDownRight } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string, replyToId?: string | null) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo: Message | null;
  onCancelReply: () => void;
}

export function ChatInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const typingRef = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);
      if (!typingRef.current) {
        typingRef.current = true;
        onTyping(true);
      }
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        typingRef.current = false;
        onTyping(false);
      }, 1000);
    },
    [onTyping],
  );

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    onSend(text.trim(), replyTo?.id || null);
    setText("");
    typingRef.current = false;
    onTyping(false);
    if (replyTo) onCancelReply();
  }, [text, onSend, replyTo, onTyping, onCancelReply]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape" && replyTo) {
        onCancelReply();
      }
    },
    [handleSend, replyTo, onCancelReply],
  );

  return (
    <div className="flex-shrink-0 p-3 sm:p-4 bg-[#0d0e10]/80 backdrop-blur-xl border-t border-white/5">
      {/* Animated Reply Bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            className="overflow-hidden mb-2"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="font-semibold text-indigo-300">
                  Replying to @{replyTo.senderName || "user"}:
                </span>
                <p className="text-gray-400 truncate">{replyTo.text}</p>
              </div>
              <button
                type="button"
                onClick={onCancelReply}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Area */}
      <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 transition-colors">
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${replyTo ? `reply to @${replyTo.senderName}` : "#general"}`}
          rows={1}
          className="flex-1 bg-transparent px-2 text-gray-100 text-sm leading-6 resize-none outline-none placeholder:text-gray-500 max-h-32 scrollbar-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:shadow-none transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
