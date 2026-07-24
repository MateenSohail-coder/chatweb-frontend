import { useState } from 'react'
import type { Message } from '../types'
import { useAuth } from '../context/AuthContext'
import { ReactionPicker } from './ReactionPicker'

interface MessageItemProps {
  message: Message
  onReply: (message: Message) => void
  onReaction: (messageId: string, emoji: string) => void
  onAvatarClick: (userId: string) => void
}

export function MessageItem({ message, onReply, onReaction, onAvatarClick }: MessageItemProps) {
  const { user } = useAuth()
  const [showPicker, setShowPicker] = useState(false)

  if (message.isSystem) {
    return (
      <div className="flex items-center justify-center py-1 px-4">
        <div className="h-px bg-[#3f4147] flex-1" />
        <span className="px-3 text-xs text-[#949ba4] font-medium whitespace-nowrap select-none">
          {message.text}
        </span>
        <div className="h-px bg-[#3f4147] flex-1" />
      </div>
    )
  }

  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const reactionKeys = message.reactions ? Object.keys(message.reactions) : []
  const hasReacted = (emoji: string) => user && message.reactions?.[emoji]?.includes(user._id)
  const displayName = message.senderName || message.senderId.slice(0, 8)

  return (
    <div className="group relative flex gap-4 px-4 py-0.5 hover:bg-[rgba(79,84,92,0.08)] transition-colors duration-150">
      <button
        type="button"
        onClick={() => onAvatarClick(message.senderId)}
        className="flex-shrink-0 mt-0.5"
      >
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-sm font-bold hover:shadow-md transition-shadow">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline gap-2">
          <button
            type="button"
            onClick={() => onAvatarClick(message.senderId)}
            className="text-sm font-medium text-[#f2f3f5] hover:underline"
          >
            {displayName}
          </button>
          <span className="text-[11px] text-[#949ba4] invisible group-hover:visible">{time}</span>
        </div>

        {message.replyTo && (
          <div className="flex items-center gap-2 mt-0.5 pl-1 border-l-2 border-[#5865F2] opacity-60">
            <span className="text-xs font-medium text-[#5865F2] truncate">{message.replyTo.senderName}</span>
            <span className="text-xs text-[#949ba4] truncate">{message.replyTo.text}</span>
          </div>
        )}

        <p className="text-[15px] leading-[1.35] text-[#dbdee1] mt-0.5 break-words">{message.text}</p>

        {reactionKeys.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactionKeys.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReaction(message.id, emoji)}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs border transition-colors ${
                  hasReacted(emoji)
                    ? 'bg-[rgba(88,101,242,0.3)] border-[#5865F2] text-[#dbdee1]'
                    : 'bg-[#2b2d31] border-transparent text-[#dbdee1] hover:border-[rgba(255,255,255,0.1)]'
                }`}
              >
                <span className="text-sm">{emoji}</span>
                <span className="font-medium text-xs">{message.reactions![emoji].length}</span>
              </button>
            ))}
          </div>
        )}

        <div className="absolute right-2 top-0 hidden group-hover:flex items-center gap-0.5 bg-[#313338] border border-[#3f4147] rounded-md shadow-md">
          <button
            type="button"
            onClick={() => onReply(message)}
            className="px-2 py-1.5 text-xs text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[rgba(79,84,92,0.16)] rounded-l-md transition-colors"
            title="Reply"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className="px-2 py-1.5 text-xs text-[#b5bac1] hover:text-[#dbdee1] hover:bg-[rgba(79,84,92,0.16)] rounded-r-md transition-colors"
              title="Add reaction"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
            {showPicker && (
              <div className="absolute top-full right-0 mt-1">
                <ReactionPicker
                  onSelect={(emoji) => {
                    onReaction(message.id, emoji)
                    setShowPicker(false)
                  }}
                  onClose={() => setShowPicker(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
