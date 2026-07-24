import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import type { Message } from '../types'

interface ChatInputProps {
  onSend: (text: string, replyToId?: string | null) => void
  onTyping: (isTyping: boolean) => void
  replyTo: Message | null
  onCancelReply: () => void
}

export function ChatInput({ onSend, onTyping, replyTo, onCancelReply }: ChatInputProps) {
  const [text, setText] = useState('')
  const typingRef = useRef(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((value: string) => {
    setText(value)
    if (!typingRef.current) {
      typingRef.current = true
      onTyping(true)
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      typingRef.current = false
      onTyping(false)
    }, 1000)
  }, [onTyping])

  const handleSend = useCallback(() => {
    if (!text.trim()) return
    onSend(text.trim(), replyTo?.id)
    setText('')
    typingRef.current = false
    onTyping(false)
    if (replyTo) onCancelReply()
  }, [text, onSend, replyTo, onTyping, onCancelReply])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape' && replyTo) {
      onCancelReply()
    }
  }, [handleSend, replyTo, onCancelReply])

  return (
    <div className="flex-shrink-0 px-4 pb-4 pt-0 bg-[#313338]">
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#2b2d31] border-l-4 border-[#5865F2] rounded-t-lg">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-[#5865F2]">Replying to {replyTo.senderName}</span>
            <p className="text-sm text-[#949ba4] truncate">{replyTo.text}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="flex-shrink-0 p-1 text-[#949ba4] hover:text-[#dbdee1] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 bg-[#383a40] rounded-lg px-4 py-2.5">
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${replyTo ? '(Escape to cancel)' : '#general'}`}
          rows={1}
          className="flex-1 bg-transparent text-[#dbdee1] text-base leading-5 resize-none outline-none placeholder-[#87898c] min-h-[22px] max-h-[144px]"
          style={{ fieldSizing: 'content' }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className="flex-shrink-0 p-1.5 text-[#b5bac1] hover:text-[#dbdee1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
