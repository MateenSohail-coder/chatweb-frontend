import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import { fetchProfile } from "../services/api";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { onlineUserIds } = usePresence();
  const [names, setNames] = useState<Record<string, string>>({});
  const onlineList = Array.from(onlineUserIds);

  useEffect(() => {
    if (!user) return;
    setNames((prev) => ({ ...prev, [user._id]: user.username }));
  }, [user]);

  useEffect(() => {
    const missing = onlineList.filter(
      (uid) => uid !== user?._id && !names[uid]
    );
    if (missing.length === 0) return;

    let cancelled = false;
    for (const uid of missing) {
      fetchProfile(uid)
        .then((p) => {
          if (!cancelled) setNames((prev) => ({ ...prev, [uid]: p.username }));
        })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, [onlineList, user?._id, names]);

  return (
    <div className="w-60 flex flex-col h-full bg-[#2b2d31]">
      <div className="flex-shrink-0 h-12 flex items-center px-4 border-b border-[#3f4147] shadow-sm">
        <h1 className="text-base font-semibold text-[#f2f3f5]">
          Ephemeral Chat
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4 mb-1">
          <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">
            Channels
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 mx-2 rounded-md bg-[rgba(79,84,92,0.24)] text-[#f2f3f5] cursor-default">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#949ba4]"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-sm font-semibold">general</span>
        </div>

        <div className="mt-4 px-4 mb-1">
          <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">
            Online — {onlineList.length}
          </span>
        </div>

        {onlineList.map((uid) => {
          const isSelf = uid === user?._id;
          const displayName = isSelf
            ? `${user.username} (you)`
            : names[uid] || uid.slice(0, 8);

          return (
            <div
              key={uid}
              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md hover:bg-[rgba(79,84,92,0.16)] transition-colors group"
            >
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#2b2d31] bg-[#23a55a]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[#dbdee1] truncate block">
                  {displayName}
                </span>
              </div>
            </div>
          );
        })}

        {onlineList.length === 0 && (
          <p className="px-6 py-4 text-xs text-[#949ba4] text-center">
            Connecting...
          </p>
        )}
      </div>

      <div className="flex-shrink-0 px-2 py-1.5 bg-[#1e1f22]">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-[rgba(79,84,92,0.16)] transition-colors group">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1e1f22] bg-[#23a55a]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-[#dbdee1] truncate block">
              {user?.username}
            </span>
            <span className="text-xs text-[#949ba4]">Online</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="opacity-0 group-hover:opacity-100 p-1 text-[#949ba4] hover:text-[#f23f43] transition-all"
            title="Logout"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
