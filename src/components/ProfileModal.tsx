import { useState, useEffect } from 'react'
import { fetchProfile } from '../services/api'
import type { UserProfile } from '../types'
import { isVip, VIP_COLOR, VIP_GLOW } from '../utils/vip'

interface ProfileModalProps {
  userId: string
  onClose: () => void
}

export function ProfileModal({ userId, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetchProfile(userId)
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[1002] flex items-center justify-center bg-[rgba(0,0,0,0.85)]"
      onClick={onClose}
    >
      <div
        className="bg-[#232428] rounded-lg w-[340px] overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.24)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-15 bg-[#5865F2]" />

        <div className="relative px-4 pb-4">
          {(() => {
            const vip = profile ? isVip(profile._id) : false;
            const vipStyle = vip
              ? { boxShadow: VIP_GLOW, borderColor: VIP_COLOR, borderWidth: '3px' }
              : {};
            return (
              <>
                {profile?.avatar ? (
                  <div
                    className="relative w-20 h-20 overflow-hidden rounded-full bg-[#5865F2] flex items-center justify-center text-white text-2xl font-bold border-4 border-[#232428] -mt-10"
                    style={vipStyle}
                  >
                    <img
                      src={profile?.avatar}
                      alt="profile"
                      className="w-full h-full z-10"
                    />
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-full bg-[#5865F2] flex items-center justify-center text-white text-2xl font-bold border-4 border-[#232428] -mt-10"
                    style={vipStyle}
                  >
                    {profile?.username?.charAt(0).toUpperCase() ||
                      (loading ? "" : "?")}
                  </div>
                )}
              </>
            );
          })()}

          <div className="mt-2">
            {loading && (
              <div className="flex items-center gap-2 text-[#949ba4] text-sm">
                <div className="w-4 h-4 border-2 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
                Loading profile...
              </div>
            )}
            {error && <p className="text-sm text-[#f23f43]">{error}</p>}
            {profile && (
              <>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: isVip(profile._id) ? VIP_COLOR : '#f2f3f5' }}
                >
                  {isVip(profile._id) ? '★ ' : ''}{profile.username}
                </h3>
                {profile.status && (
                  <p className="text-sm text-[#949ba4] mt-0.5">
                    {profile.status}
                  </p>
                )}

                <div className="h-px bg-[#3f4147] my-3" />

                <div>
                  <span className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider">
                    Email
                  </span>
                  <p className="text-sm text-[#dbdee1] mt-0.5">
                    {profile.email}
                  </p>
                </div>

                <div className="mt-3">
                  <span className="text-xs font-bold text-[#b5bac1] uppercase tracking-wider">
                    Member Since
                  </span>
                  <p className="text-sm text-[#dbdee1] mt-0.5">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "Unknown"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#2b2d31] px-4 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4e5058] rounded-[3px] hover:bg-[#6d6f78] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
