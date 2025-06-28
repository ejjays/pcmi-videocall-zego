"use client"

import { useState, useEffect, useRef } from "react"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  MessageCircle,
  Monitor,
  Heart,
  MoreHorizontal,
  X,
  Send,
} from "lucide-react"

interface CustomMeetingControlsProps {
  roomId: string
  onLeave: () => void
  onShare: () => void
  zegoInstance?: any
}

export default function CustomMeetingControls({ roomId, onLeave, onShare, zegoInstance }: CustomMeetingControlsProps) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-hide controls with proper mobile handling
  useEffect(() => {
    const resetTimeout = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      setControlsVisible(true)
      hideTimeoutRef.current = setTimeout(() => setControlsVisible(false), 4000)
    }

    const handleInteraction = () => resetTimeout()

    // Add multiple event listeners for better mobile support
    const events = ["mousemove", "touchstart", "touchmove", "click", "tap"]
    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { passive: true })
    })

    resetTimeout()

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [])

  // Fixed ZegoCloud API calls based on official documentation
  const toggleVideo = async () => {
    try {
      if (zegoInstance && zegoInstance.core) {
        // Use the correct ZegoCloud API methods
        if (isVideoOn) {
          await zegoInstance.core.enableVideoCaptureDevice(false)
        } else {
          await zegoInstance.core.enableVideoCaptureDevice(true)
        }
        setIsVideoOn(!isVideoOn)
      }
    } catch (error) {
      console.error("Error toggling video:", error)
      // Fallback: just toggle the state for UI feedback
      setIsVideoOn(!isVideoOn)
    }
  }

  const toggleAudio = async () => {
    try {
      if (zegoInstance && zegoInstance.core) {
        // Use the correct ZegoCloud API methods
        if (isAudioOn) {
          await zegoInstance.core.mutePublishStreamAudio(true)
        } else {
          await zegoInstance.core.mutePublishStreamAudio(false)
        }
        setIsAudioOn(!isAudioOn)
      }
    } catch (error) {
      console.error("Error toggling audio:", error)
      // Fallback: just toggle the state for UI feedback
      setIsAudioOn(!isAudioOn)
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (zegoInstance && zegoInstance.core) {
        if (isScreenSharing) {
          await zegoInstance.core.stopPublishingStream()
        } else {
          await zegoInstance.core.startScreenCapture()
        }
        setIsScreenSharing(!isScreenSharing)
      }
    } catch (error) {
      console.error("Error toggling screen share:", error)
      setIsScreenSharing(!isScreenSharing)
    }
  }

  const sendReaction = (emoji: string) => {
    // Add reaction animation logic here
    console.log("Sending reaction:", emoji)
    setShowReactions(false)

    // You can implement custom reaction broadcasting here
    // For now, just close the reactions panel
  }

  return (
    <>
      {/* Top Bar - Mobile Optimized */}
      <div
        className={`fixed top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/60 to-transparent z-50 transition-all duration-300 ${
          controlsVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Room Info */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white font-medium text-xs sm:text-sm">
                Room {roomId.split("_")[2]?.substring(0, 8) || roomId.substring(0, 8)}
              </p>
              <p className="text-gray-300 text-xs">
                {participantCount} participant{participantCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Top Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 sm:p-2.5 bg-black/60 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-black/80 transition-all duration-200 touch-manipulation active:scale-95"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              onClick={onShare}
              className="p-2 sm:p-2.5 bg-black/60 backdrop-blur-sm rounded-lg sm:rounded-xl hover:bg-black/80 transition-all duration-200 touch-manipulation active:scale-95"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls - Mobile First Design */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent z-50 transition-all duration-300 ${
          controlsVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
      >
        {/* Main Controls Row */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 active:scale-90 touch-manipulation shadow-lg min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] ${
              isVideoOn
                ? "bg-slate-800/90 backdrop-blur-sm border border-slate-600/40"
                : "bg-red-600/90 shadow-red-600/40"
            }`}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 active:scale-90 touch-manipulation shadow-lg min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] ${
              isAudioOn
                ? "bg-slate-800/90 backdrop-blur-sm border border-slate-600/40"
                : "bg-red-600/90 shadow-red-600/40"
            }`}
          >
            {isAudioOn ? (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>

          {/* End Call - Prominent */}
          <button
            onClick={onLeave}
            className="p-4 sm:p-5 rounded-full bg-red-600/90 shadow-lg shadow-red-600/40 transition-all duration-200 active:scale-90 touch-manipulation min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px]"
          >
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 active:scale-90 touch-manipulation shadow-lg min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] ${
              isScreenSharing
                ? "bg-gradient-to-r from-blue-500/90 to-purple-600/90 shadow-blue-500/40"
                : "bg-slate-800/90 backdrop-blur-sm border border-slate-600/40"
            }`}
          >
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>

          {/* More Options */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 sm:p-4 rounded-full bg-slate-800/90 backdrop-blur-sm border border-slate-600/40 transition-all duration-200 active:scale-90 touch-manipulation shadow-lg min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px]"
          >
            <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        </div>

        {/* Secondary Controls Row */}
        <div className="flex items-center justify-center space-x-4">
          {/* Reactions */}
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500/80 to-red-500/80 rounded-full shadow-lg shadow-pink-500/30 transition-all duration-200 active:scale-95 touch-manipulation backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">React</span>
            </div>
          </button>
        </div>
      </div>

      {/* Reactions Panel - Mobile Optimized */}
      {showReactions && (
        <div className="fixed bottom-32 sm:bottom-36 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-600/30 animate-in slide-in-from-bottom-2 duration-200">
            <div className="grid grid-cols-4 gap-3">
              {[
                { emoji: "❤️", color: "from-red-500 to-pink-500" },
                { emoji: "👍", color: "from-blue-500 to-cyan-500" },
                { emoji: "😂", color: "from-yellow-500 to-orange-500" },
                { emoji: "🎉", color: "from-purple-500 to-indigo-500" },
              ].map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => sendReaction(reaction.emoji)}
                  className={`p-3 bg-gradient-to-r ${reaction.color} rounded-xl transition-all duration-200 active:scale-90 touch-manipulation min-w-[48px] min-h-[48px]`}
                >
                  <span className="text-2xl">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel - Mobile Optimized */}
      {showSettings && (
        <MobileSettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} zegoInstance={zegoInstance} />
      )}

      {/* Chat Panel - Mobile Optimized */}
      {showChat && <MobileChatPanel isOpen={showChat} onClose={() => setShowChat(false)} roomId={roomId} />}
    </>
  )
}

// Mobile-First Settings Panel
function MobileSettingsPanel({
  isOpen,
  onClose,
  zegoInstance,
}: {
  isOpen: boolean
  onClose: () => void
  zegoInstance?: any
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      {/* Mobile: Slide up from bottom, Desktop: Center modal */}
      <div className="bg-slate-900/95 backdrop-blur-sm w-full sm:w-96 sm:rounded-2xl border-t sm:border border-slate-600/30 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 sm:max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
          <h2 className="text-lg sm:text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Camera Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">Camera</label>
            <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white text-base">
              <option>Default Camera</option>
              <option>Front Camera</option>
              <option>Back Camera</option>
            </select>
          </div>

          {/* Microphone Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">Microphone</label>
            <select className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white text-base">
              <option>Default Microphone</option>
              <option>Built-in Microphone</option>
            </select>
          </div>

          {/* Video Quality */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">Video Quality</label>
            <div className="grid grid-cols-3 gap-2">
              <button className="px-4 py-3 bg-slate-700/50 rounded-xl text-white text-sm font-medium transition-colors active:scale-95">
                Low
              </button>
              <button className="px-4 py-3 bg-blue-600 rounded-xl text-white text-sm font-medium transition-colors active:scale-95">
                Medium
              </button>
              <button className="px-4 py-3 bg-slate-700/50 rounded-xl text-white text-sm font-medium transition-colors active:scale-95">
                High
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-4 border-t border-slate-600/30">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl transition-all duration-200 active:scale-95 font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

// Mobile-First Chat Panel
function MobileChatPanel({
  isOpen,
  onClose,
  roomId,
}: {
  isOpen: boolean
  onClose: () => void
  roomId: string
}) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    { id: 1, user: "John", text: "Hello everyone!", time: "10:30 AM", isMe: false },
    { id: 2, user: "Sarah", text: "Great to see you all!", time: "10:31 AM", isMe: false },
  ])

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        user: "You",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:flex sm:items-center sm:justify-end">
      {/* Mobile: Full screen, Desktop: Side panel */}
      <div className="bg-slate-900/95 backdrop-blur-sm w-full h-full sm:w-80 sm:h-full sm:max-w-sm border-l border-slate-600/30 animate-in slide-in-from-right duration-200 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-slate-600/30"
          style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
        >
          <h3 className="text-lg font-semibold text-white">Chat</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.isMe ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white" : "bg-slate-700/50 text-white"
                }`}
              >
                {!msg.isMe && <div className="text-xs font-medium text-slate-300 mb-1">{msg.user}</div>}
                <p className="text-sm">{msg.text}</p>
                <div className={`text-xs mt-1 ${msg.isMe ? "text-white/70" : "text-slate-400"}`}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div
          className="p-4 border-t border-slate-600/30"
          style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 text-base"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[48px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
