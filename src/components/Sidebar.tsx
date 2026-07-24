import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import { fetchProfile } from "../services/api";
import { isVip } from "../utils/vip";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Hash, LogOut, X, Sparkles } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
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
      (uid) => uid !== user?._id && !names[uid],
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
    return () => {
      cancelled = true;
    };
  }, [onlineList, user?._id, names]);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed md:relative z-50 flex flex-col h-full w-[280px] bg-[#111214]/95 backdrop-blur-md border-r border-white/5 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 h-16 flex items-center justify-between px-5 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Ephemeral Chat
            </h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
          <div>
            <span className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Channels
            </span>
            <div className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-medium text-sm">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span>general</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Online Members
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                {onlineList.length}
              </span>
            </div>

            <div className="space-y-1">
              {onlineList.map((uid) => {
                const isSelf = uid === user?._id;
                const vip = isVip(uid);
                const displayName = isSelf
                  ? `${user.username} (you)`
                  : names[uid] || uid.slice(0, 8);

                return (
                  <motion.div
                    key={uid}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    {/* Avatar Container with VIP Frame */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                          vip
                            ? "ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                            : "bg-gradient-to-tr from-slate-700 to-slate-800"
                        }`}
                        style={
                          vip
                            ? {
                                background:
                                  "linear-gradient(135deg, #f59e0b, #d97706)",
                              }
                            : {}
                        }
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      {vip && (
                        <div className="absolute -top-1.5 -right-1.5 p-0.5 bg-black rounded-full border border-amber-400/50">
                          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111214] bg-emerald-500" />
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0 flex items-center gap-1.5">
                      <span
                        className={`text-sm truncate block font-medium ${
                          vip
                            ? "admin-font text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                            : "user-font text-gray-300"
                        }`}
                      >
                        {displayName}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 bg-black/40 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-white truncate block">
                {user?.username}
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{" "}
                Active Now
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
