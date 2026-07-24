import { useState, useEffect } from "react";
import { fetchProfile } from "../services/api";
import type { UserProfile } from "../types";
import { isVip } from "../utils/vip";
import { motion } from "framer-motion";
import { Crown, Mail, Calendar, X } from "lucide-react";

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
}

export function ProfileModal({ userId, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchProfile(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load profile",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const vip = profile ? isVip(profile._id) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#18191c] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
      >
        {/* Banner */}
        <div
          className={`h-24 ${vip ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500" : "bg-gradient-to-r from-indigo-600 to-purple-600"}`}
        />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative px-6 pb-6">
          {/* Avatar Section */}
          <div className="relative -mt-12 mb-4 inline-block">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-[#18191c] shadow-xl ${
                vip
                  ? "bg-gradient-to-tr from-amber-500 to-yellow-400 ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                  : "bg-gradient-to-tr from-indigo-500 to-purple-500"
              }`}
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                profile?.username?.charAt(0).toUpperCase() ||
                (loading ? "" : "?")
              )}
            </div>
            {vip && (
              <div className="absolute -top-1 -right-1 p-1 bg-black rounded-full border border-amber-400">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            )}
          </div>

          {/* Profile Details */}
          {loading && (
            <div className="py-8 text-center text-gray-400 text-sm animate-pulse">
              Loading user information...
            </div>
          )}

          {error && <p className="text-sm text-rose-400 my-2">{error}</p>}

          {profile && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-xl font-bold ${
                      vip
                        ? "admin-font text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                        : "user-font text-white"
                    }`}
                  >
                    {profile.username}
                  </h3>
                  {vip && (
                    <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  )}
                </div>
                {profile.status && (
                  <p className="text-xs text-gray-400 mt-1">{profile.status}</p>
                )}
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    Joined{" "}
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
