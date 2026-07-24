import { useRef, useEffect } from 'react'

const EMOJIS = ['😀', '😂', '❤️', '🎉', '👍', '🔥', '😎', '✨', '💯', '🤔', '👀', '🚀']

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-1 bg-[#111214] border border-[#3f4147] rounded-lg shadow-lg p-1.5 z-50"
    >
      <div className="grid grid-cols-6 gap-0.5">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#5865F2] rounded-md transition-colors duration-100"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
