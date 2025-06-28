"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Video, Mic, AlertCircle } from "lucide-react"

export default function JoinMeetingScreen() {
  const [meetingId, setMeetingId] = useState("")
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const validateMeetingId = (id: string) => {
    // Basic validation for room ID format
    if (!id.trim()) return false

    // Check if it's a full URL
    if (id.includes("/meeting?roomId=")) {
      const urlParams = new URLSearchParams(id.split("?")[1])
      return urlParams.get("roomId") !== null
    }

    // Check if it's just a room ID (should be at least 8 characters)
    return id.trim().length >= 8
  }

  const extractRoomId = (input: string) => {
    const trimmed = input.trim()

    // If it's a full URL, extract the roomId parameter
    if (trimmed.includes("/meeting?roomId=")) {
      const urlParams = new URLSearchParams(trimmed.split("?")[1])
      return urlParams.get("roomId")
    }

    // If it's just a room ID, return as is
    return trimmed
  }

  const handleJoin = async () => {
    setError("")

    if (!validateMeetingId(meetingId)) {
      setError("Please enter a valid meeting ID or link")
      return
    }

    setIsJoining(true)

    try {
      const roomId = extractRoomId(meetingId)

      if (!roomId) {
        setError("Invalid meeting ID format")
        setIsJoining(false)
        return
      }

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

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Meeting ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">Meeting ID or Link</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => {
                setMeetingId(e.target.value)
                setError("") // Clear error when user types
              }}
              placeholder="Enter meeting ID or paste meeting link"
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
            disabled={!validateMeetingId(meetingId) || isJoining}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 touch-manipulation shadow-xl ${
              validateMeetingId(meetingId) && !isJoining
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white active:scale-95 hover:shadow-2xl"
                : "bg-slate-700/50 text-slate-400 cursor-not-allowed border border-slate-600/30"
            }`}
          >
            {isJoining ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Joining...
              </div>
            ) : (
              "Join Meeting"
            )}
          </button>

          {/* Meeting ID Info */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600/20">
            <h3 className="text-sm font-medium text-white mb-2">How to join:</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Enter the meeting ID shared by the host</li>
              <li>• Or paste the full meeting link</li>
              <li>• Configure your camera and microphone settings</li>
              <li>• Click "Join Meeting" to enter the room</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
