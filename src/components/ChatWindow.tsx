import { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { useMessages } from '../hooks/useMessages'
import { useTyping } from '../hooks/useTyping'
import { MessageItem } from './MessageItem'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { ProfileModal } from './ProfileModal'

export function ChatWindow() {
  const { messages, sendMessage, addReaction } = useMessages()
  const { typingUsers, emitTyping } = useTyping()
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-[#313338]">
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-[#3f4147] shadow-sm">
        <h2 className="text-base font-semibold text-[#f2f3f5]"># general</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onReply={setReplyTo}
            onReaction={addReaction}
            onAvatarClick={setProfileUserId}
          />
        ))}
        <TypingIndicator usernames={typingUsers.map((u) => u.username)} />
        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        onTyping={emitTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      {profileUserId && (
        <ProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  )
}
