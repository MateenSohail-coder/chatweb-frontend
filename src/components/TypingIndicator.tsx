import { motion } from "framer-motion";

interface TypingIndicatorProps {
  usernames: string[];
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null;

  const label =
    usernames.length === 1
      ? `${usernames[0]} is typing...`
      : usernames.length === 2
        ? `${usernames[0]} and ${usernames[1]} are typing...`
        : `${usernames[0]} and ${usernames.length - 1} others are typing...`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 px-4 py-1 text-xs text-[#949ba4] font-medium"
    >
      <span className="flex gap-1 items-center">
        {[0, 150, 300].map((delay) => (
          <motion.span
            key={delay}
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: delay / 1000,
            }}
            className="w-1.5 h-1.5 rounded-full bg-[#87898c]"
          />
        ))}
      </span>
      <span>{label}</span>
    </motion.div>
  );
}
