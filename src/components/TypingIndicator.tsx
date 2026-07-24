interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null

  const label =
    usernames.length === 1
      ? `${usernames[0]} is typing...`
      : usernames.length === 2
        ? `${usernames[0]} and ${usernames[1]} are typing...`
        : `${usernames[0]} and ${usernames.length - 1} others are typing...`

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-[#949ba4]">
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-[#949ba4] animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <span>{label}</span>
    </div>
  )
}
