"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import { Video, Mic } from "lucide-react"

export default function JoinMeetingScreen() {
  const [meetingId, setMeetingId] = useState("")
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    if (!meetingId.trim()) return

    setIsJoining(true)

    // Add a small delay for better UX
    setTimeout(() => {
      // Navigate to meeting with the room ID
      router.push(`/meeting?roomId=${encodeURIComponent(meetingId.trim())}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-dark animate-fadeIn">
      <Header title="Join Meeting" showBackButton backHref="/home" />

      <main className="px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Meeting ID Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-200 mb-2">Meeting ID or Link</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID or paste link"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-slate-400"
              disabled={isJoining}
            />
          </div>

          {/* Settings */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gradient-card border border-dark-600/30 rounded-xl">
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

            <div className="flex items-center justify-between p-4 bg-gradient-card border border-dark-600/30 rounded-xl">
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
            disabled={!meetingId.trim() || isJoining}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 touch-manipulation shadow-xl ${
              meetingId.trim() && !isJoining
                ? "bg-gradient-secondary text-white active:scale-95 hover:shadow-2xl"
                : "bg-dark-700/50 text-dark-400 cursor-not-allowed border border-dark-600/30"
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
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
