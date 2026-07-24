import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

const EMOJIS = [
  "😀",
  "😂",
  "❤️",
  "🎉",
  "👍",
  "🔥",
  "😎",
  "✨",
  "💯",
  "🤔",
  "👀",
  "🚀",
];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 5 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute right-0 bottom-full mb-2 bg-[#111214] border border-[#3f4147] rounded-xl shadow-2xl p-2 z-50 min-w-[200px]"
    >
      <div className="grid grid-cols-6 gap-1">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-[#35373c] rounded-md transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
