import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../types";

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
    <div className="flex-shrink-0 px-4 pb-4 pt-0 bg-[#313338]">
      {/* Animated Reply Bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-[#2b2d31] border-l-4 border-[#5865F2] rounded-t-lg text-xs">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-[#5865F2]">
                  Replying to @{replyTo.senderName || "user"}
                </span>
                <p className="text-[#949ba4] truncate mt-0.5">{replyTo.text}</p>
              </div>
              <button
                type="button"
                onClick={onCancelReply}
                className="p-1 text-[#949ba4] hover:text-[#dbdee1] transition-colors rounded-full hover:bg-[#35373c]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Area Container */}
      <div
        className={`flex items-end gap-2 bg-[#383a40] px-4 py-2.5 ${replyTo ? "rounded-b-lg" : "rounded-lg"} transition-all`}
      >
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${replyTo ? `reply to @${replyTo.senderName}` : "#general"}`}
          rows={1}
          className="flex-1 bg-transparent text-[#dbdee1] text-sm leading-5 resize-none outline-none placeholder-[#87898c] max-h-[144px]"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-1.5 text-[#5865F2] disabled:text-[#4e5058] disabled:opacity-50 transition-colors rounded-md hover:bg-[#404249]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
