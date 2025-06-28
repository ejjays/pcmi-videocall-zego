"use client"

import { useState, useRef, useEffect } from "react"
import { Video, VideoOff, Mic, MicOff, Settings, ArrowRight, ArrowLeftRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface MeetingPreparationProps {
  roomId: string
  onJoin: (settings: { video: boolean; audio: boolean; mirror: boolean }) => void
  onBack: () => void
  userName: string
}

export default function MeetingPreparation({ roomId, onJoin, onBack, userName }: MeetingPreparationProps) {
  const { user } = useAuth()
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [isMirrored, setIsMirrored] = useState(true) // 🪞 Mirror state
  const [showSettings, setShowSettings] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize camera preview
  useEffect(() => {
    if (videoEnabled) {
      startVideoPreview()
    } else {
      stopVideoPreview()
    }

    return () => {
      stopVideoPreview()
    }
  }, [videoEnabled])

  // Apply mirror effect to preview video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)"
      videoRef.current.style.transition = "transform 0.3s ease"
    }
  }, [isMirrored])

  const startVideoPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false, // Only video for preview
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (error) {
      console.warn("Could not access camera:", error)
      setVideoEnabled(false)
    }
  }

  const stopVideoPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const toggleMirror = () => {
    console.log("Toggling mirror from", isMirrored, "to", !isMirrored)
    setIsMirrored(!isMirrored)
  }

  const handleJoin = async () => {
    setIsJoining(true)

    try {
      // Stop preview before joining
      stopVideoPreview()

      // Call the join function with mirror setting
      onJoin({ video: videoEnabled, audio: audioEnabled, mirror: isMirrored })
    } catch (error) {
      console.error("Error joining meeting:", error)
      setIsJoining(false)
    }
  }

  const shortRoomId = roomId.split("_")[2]?.substring(0, 8) || roomId.substring(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-gradient-to-br from-pink-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top relative z-10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-700/50 active:bg-slate-600/50 transition-colors duration-200 touch-manipulation glass-effect"
        >
          <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-white">Join Meeting</h1>
          <p className="text-sm text-slate-300">Room {shortRoomId}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl hover:bg-slate-700/50 active:bg-slate-600/50 transition-colors duration-200 touch-manipulation glass-effect"
        >
          <Settings className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {/* Video Preview - CLEAN! */}
        <div className="w-full max-w-sm mb-6">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl overflow-hidden shadow-2xl border border-slate-600/30">
            {videoEnabled ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {/* 🖼️ REASONABLE PROFILE PICTURE SIZE */}
                {user?.photoURL ? (
                  <img
                    src={user.photoURL || "/placeholder.svg"}
                    alt={userName}
                    className="w-24 h-24 rounded-full object-cover border-3 border-slate-500 shadow-xl"
                    onError={(e) => {
                      // Fallback to letter avatar if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = "flex"
                    }}
                  />
                ) : null}
                {/* Fallback letter avatar - also reasonable size */}
                <div
                  className={`w-24 h-24 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center shadow-xl ${
                    user?.photoURL ? "hidden" : "flex"
                  }`}
                >
                  <span className="text-3xl font-bold text-white">{userName.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            )}

            {/* Video overlay controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-3 rounded-full transition-all duration-200 active:scale-90 touch-manipulation shadow-lg ${
                  videoEnabled
                    ? "bg-slate-800/90 backdrop-blur-sm border border-slate-600/40"
                    : "bg-red-600/90 shadow-red-600/40"
                }`}
              >
                {videoEnabled ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-3 rounded-full transition-all duration-200 active:scale-90 touch-manipulation shadow-lg ${
                  audioEnabled
                    ? "bg-slate-800/90 backdrop-blur-sm border border-slate-600/40"
                    : "bg-red-600/90 shadow-red-600/40"
                }`}
              >
                {audioEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* 🪞 SMALLER MIRROR BUTTON - More Subtle */}
        <button
          onClick={toggleMirror}
          className="mb-4 px-4 py-2 bg-slate-800/40 hover:bg-slate-700/40 border border-slate-600/20 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation backdrop-blur-sm"
        >
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 font-medium text-sm">Mirror</span>
          </div>
        </button>

        {/* User Info - Smaller & More Subtle */}
        <div className="text-center mb-8">
          <p className="text-slate-400 text-base">
            Joining as <span className="font-medium text-cyan-400">{userName}</span>
          </p>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-200 active:scale-95 touch-manipulation hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Joining Meeting...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">Join Meeting</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-slate-900/95 backdrop-blur-sm w-full sm:w-96 sm:rounded-2xl border-t sm:border border-slate-600/30 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
              <h3 className="text-lg font-bold text-white">Audio & Video Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors touch-manipulation"
              >
                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Camera</label>
                <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white">
                  <option>Default Camera</option>
                  <option>Front Camera</option>
                  <option>Back Camera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Microphone</label>
                <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white">
                  <option>Default Microphone</option>
                  <option>Built-in Microphone</option>
                </select>
              </div>

              {/* Mirror Setting in Settings Panel */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">Video Mirror</label>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-600/30 rounded-xl">
                  <div className="flex items-center">
                    <ArrowLeftRight className="w-5 h-5 text-slate-300 mr-3" />
                    <span className="text-white">Mirror your video</span>
                  </div>
                  <button
                    onClick={toggleMirror}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      isMirrored ? "bg-cyan-600" : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        isMirrored ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-4 border-t border-slate-600/30">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
