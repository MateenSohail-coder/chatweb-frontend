import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { Message } from "../types";
import { useMessages } from "../hooks/useMessages";
import { useTyping } from "../hooks/useTyping";
import { MessageItem } from "./MessageItem";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { ProfileModal } from "./ProfileModal";
import { Sidebar } from "./Sidebar";
import { Hash, Menu } from "lucide-react";

export function ChatWindow() {
  const { messages, sendMessage, addReaction } = useMessages();
  const { typingUsers, emitTyping } = useTyping();
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  return (
    <div className="flex h-screen w-full bg-[#090a0f] text-gray-200 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-gradient-to-b from-[#111318] to-[#090a0f]">
        {/* Header Bar */}
        <div className="flex-shrink-0 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/5 bg-[#111214]/60 backdrop-blur-lg z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white tracking-wide">
                general
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Message List */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
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

        {/* Input Bar */}
        <ChatInput
          onSend={(text, replyToId) => {
            sendMessage(text, replyToId);
            setReplyTo(null);
          }}
          onTyping={emitTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />

        {/* User Profile Overlay Modal */}
        <AnimatePresence>
          {profileUserId && (
            <ProfileModal
              userId={profileUserId}
              onClose={() => setProfileUserId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
