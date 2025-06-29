"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Video, Mic, AlertCircle } from "lucide-react"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function JoinMeetingScreen() {
  const [meetingId, setMeetingId] = useState("")
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { animation } = useLoadingAnimation()

  // Fixed meeting room ID - same as home page
  const FIXED_ROOM_ID = "kamustahan01"

  const validateMeetingId = (id: string) => {
    // Accept the fixed room ID or empty (will default to fixed room)
    if (!id.trim()) return true // Allow empty, will use default
    
    // Check if it matches our fixed room ID
    if (id.trim().toLowerCase() === FIXED_ROOM_ID.toLowerCase()) return true
    
    // Check if it's a full URL with our room ID
    if (id.includes("/meeting?roomId=")) {
      const urlParams = new URLSearchParams(id.split("?")[1])
      const roomIdFromUrl = urlParams.get("roomId")
      return roomIdFromUrl?.toLowerCase() === FIXED_ROOM_ID.toLowerCase()
    }

    return false
  }

  const extractRoomId = (input: string) => {
    const trimmed = input.trim()

    // If empty, use the fixed room ID
    if (!trimmed) return FIXED_ROOM_ID

    // If it's a full URL, extract the roomId parameter
    if (trimmed.includes("/meeting?roomId=")) {
      const urlParams = new URLSearchParams(trimmed.split("?")[1])
      return urlParams.get("roomId") || FIXED_ROOM_ID
    }

    // If it matches our fixed room ID, return it
    if (trimmed.toLowerCase() === FIXED_ROOM_ID.toLowerCase()) {
      return FIXED_ROOM_ID
    }

    // Default to fixed room ID
    return FIXED_ROOM_ID
  }

  const handleJoin = async () => {
    setError("")

    // Always use the fixed room ID
    const roomId = FIXED_ROOM_ID

    setIsJoining(true)

    try {
      // Add a small delay for better UX
      setTimeout(() => {
        router.push(`/meeting?roomId=${encodeURIComponent(roomId)}`)
      }, 500)
    } catch (error) {
      setError("Failed to join meeting. Please try again.")
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 animate-fadeIn">
      <Header title="Join Meeting" showBackButton backHref="/home" />

      {/* Professional Blurred Loading Overlay for joining */}
      {isJoining && (
        <PageLoader animationData={animation} size="xl" overlay={true} />
      )}

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Meeting ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">Meeting ID (Optional)</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => {
                setMeetingId(e.target.value)
                setError("") // Clear error when user types
              }}
              placeholder={`Enter "${FIXED_ROOM_ID}" or leave empty`}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-slate-400"
              disabled={isJoining}
            />
            {error && (
              <div className="mt-2 flex items-center text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-white">Join with video on</span>
              </div>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                disabled={isJoining}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  videoEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    videoEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                  <Mic className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-white">Join with audio on</span>
              </div>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                disabled={isJoining}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  audioEnabled ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    audioEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Join Button */}
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 touch-manipulation shadow-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white active:scale-95 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Meeting
          </button>

          {/* Meeting ID Info */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600/20">
            <h3 className="text-sm font-medium text-white mb-2">How to join:</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Enter "{FIXED_ROOM_ID}" as the meeting ID</li>
              <li>• Or leave the field empty to join the main room</li>
              <li>• Configure your camera and microphone settings</li>
              <li>• Click "Join Meeting" to enter the room</li>
            </ul>
            
            <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-400 text-xs font-medium">
                📍 Main Meeting Room: {FIXED_ROOM_ID}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}