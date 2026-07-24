import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../types";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { MessageItem } from "./MessageItem";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ProfileModal } from "./ProfileModal";

export function ChatWindow() {
  const { messages, sendMessage, addReaction } = useMessages();
  const { typingUsers, emitTyping } = useTyping();
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="flex flex-col h-full bg-[#313338] text-[#dbdee1] overflow-hidden">
      {/* Top Header */}
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-[#2b2d31] bg-[#313338] z-10 shadow-sm">
        <h2 className="text-base font-bold text-[#f2f3f5] flex items-center gap-2">
          <span className="text-[#949ba4] text-xl">#</span> general
        </h2>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-[#1a1b1e]">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onReply={setReplyTo}
              onReaction={addReaction}
              onAvatarClick={setProfileUserId}
            />
          ))}
        </AnimatePresence>

        <TypingIndicator usernames={typingUsers.map((u) => u.username)} />
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={(text, replyToId) => {
          sendMessage(text, replyToId);
          setReplyTo(null);
        }}
        onTyping={emitTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      {/* User Profile Modal */}
      <AnimatePresence>
        {profileUserId && (
          <ProfileModal
            userId={profileUserId}
            onClose={() => setProfileUserId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
