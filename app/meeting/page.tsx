"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Users,
  MessageSquare,
  MoreHorizontal,
  RotateCcw,
  Monitor,
  X,
} from "lucide-react"

// Import ZegoUIKitPrebuilt for proper token generation and core functionality
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"

export default function MeetingScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [roomId, setRoomId] = useState<string>("")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showMoreControls, setShowMoreControls] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState<any[]>([])

  // ZegoCloud refs
  const containerRef = useRef<HTMLDivElement>(null)
  const zegoRef = useRef<any>(null)

  const chatMessages = [
    { id: 1, sender: "John Doe", message: "Welcome everyone!", time: "10:30" },
    { id: 2, sender: "Jane Smith", message: "Thanks for having us", time: "10:31" },
    { id: 3, sender: "Mike Johnson", message: "Can you share the presentation?", time: "10:32" },
  ]

  useEffect(() => {
    // Get room ID from URL params or generate a new one
    const urlRoomId = searchParams.get("roomId")
    if (urlRoomId) {
      setRoomId(urlRoomId)
    } else {
      const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setRoomId(newRoomId)
      const newUrl = `/meeting?roomId=${newRoomId}`
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user || !roomId || !containerRef.current) return

    initializeZegoCloud()

    return () => {
      if (zegoRef.current) {
        zegoRef.current.destroy()
        zegoRef.current = null
      }
    }
  }, [user, roomId])

  const initializeZegoCloud = async () => {
    try {
      const appId = Number.parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!

      if (!appId || !serverSecret) {
        console.error("Missing ZegoCloud configuration")
        return
      }

      console.log("Initializing ZegoCloud with:", { appId, roomId, userId: user.uid })

      // Generate proper token using ZegoUIKitPrebuilt
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "User",
      )

      console.log("Token generated successfully")

      // Create ZegoUIKitPrebuilt instance
      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zegoRef.current = zp

      // Configure with minimal UI - we'll hide most of it and use our custom controls
      await zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showPreJoinView: false,
        showRoomTimer: false,
        showUserList: false,
        maxUsers: 10,
        layout: "Auto",
        showLayoutButton: false,
        showScreenSharingButton: false,
        showTextChat: false,
        showUserName: false,
        showRemoveUserButton: false,
        turnOnCameraWhenJoining: true,
        turnOnMicrophoneWhenJoining: true,
        useFrontFacingCamera: true,
        showLeavingView: false,
        showMyCameraToggleButton: false,
        showMyMicrophoneToggleButton: false,
        showAudioVideoSettingsButton: false,
        onJoinRoom: () => {
          console.log("Successfully joined room:", roomId)
          setIsConnected(true)
        },
        onLeaveRoom: () => {
          console.log("Left room")
          router.push("/post-meeting")
        },
        onUserJoin: (users: any[]) => {
          console.log("Users joined:", users)
          setParticipants((prev) => [...prev, ...users])
        },
        onUserLeave: (users: any[]) => {
          console.log("Users left:", users)
          setParticipants((prev) => prev.filter((p) => !users.find((u) => u.userID === p.userID)))
        },
        branding: {
          logoURL: "",
        },
      })

      console.log("ZegoCloud initialized successfully")
    } catch (error) {
      console.error("Error initializing ZegoCloud:", error)
    }
  }

  const toggleMute = async () => {
    if (zegoRef.current && zegoRef.current.localUser) {
      try {
        // Correct method is on the 'microphone' property of the localUser object
        await zegoRef.current.localUser.microphone.turnOn(!isMuted)
        setIsMuted(!isMuted)
      } catch (error) {
        console.error("Error toggling microphone:", error)
      }
    }
  }

  const toggleVideo = async () => {
    if (zegoRef.current && zegoRef.current.localUser) {
      try {
        // Correct method is on the 'camera' property of the localUser object
        await zegoRef.current.localUser.camera.turnOn(!isVideoOff)
        setIsVideoOff(!isVideoOff)
      } catch (error) {
        console.error("Error toggling camera:", error)
      }
    }
  }

  const endCall = () => {
    if (zegoRef.current) {
      zegoRef.current.hangUp()
    }
  }

  if (!roomId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white font-medium">Preparing meeting...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black relative overflow-hidden animate-fadeIn">
        {/* ZegoCloud Container - Hidden but functional */}
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 1,
          }}
        />

        {/* Custom UI Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Meeting Info */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 pointer-events-auto">
            <p className="text-white font-medium">PCMI Meeting</p>
            <p className="text-gray-300 text-sm">
              {participants.length + 1} participant{participants.length !== 0 ? "s" : ""} •{" "}
              {isConnected ? "Connected" : "Connecting..."}
            </p>
          </div>

          {/* Room ID Display */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 pointer-events-auto">
            <p className="text-white text-sm font-mono">Room: {roomId.split("_")[2]}</p>
          </div>
        </div>

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 3 }}>
          <div className="bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
            <div className="flex items-center justify-center space-x-4 pointer-events-auto">
              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation ${
                  isMuted ? "bg-red-600 hover:bg-red-700" : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              </button>

              {/* Video Toggle */}
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation ${
                  isVideoOff ? "bg-red-600 hover:bg-red-700" : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </button>

              {/* End Call */}
              <button
                onClick={endCall}
                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <Phone className="w-7 h-7 text-white rotate-[135deg]" />
              </button>

              {/* More Controls */}
              <button
                onClick={() => setShowMoreControls(!showMoreControls)}
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <MoreHorizontal className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Secondary Controls */}
            {showMoreControls && (
              <div className="flex items-center justify-center space-x-4 mt-4 pointer-events-auto">
                <button
                  onClick={() => setShowParticipants(true)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation"
                >
                  <Users className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => setShowChat(true)}
                  className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </button>

                <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation">
                  <Monitor className="w-5 h-5 text-white" />
                </button>

                <button className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation">
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && (
          <div
            className="absolute inset-y-0 right-0 w-80 bg-gradient-card backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-out border-l border-dark-600/30"
            style={{ zIndex: 4 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-600/30">
              <h3 className="text-lg font-semibold text-white">Participants ({participants.length + 1})</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-dark-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Current user */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-dark-700/30 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-medium text-sm">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">You</p>
                    <p className="text-xs text-primary-400">Host</p>
                  </div>
                </div>
                {isMuted && <MicOff className="w-4 h-4 text-red-500" />}
              </div>

              {/* Remote participants */}
              {participants.map((participant) => (
                <div
                  key={participant.userID}
                  className="flex items-center justify-between px-4 py-3 hover:bg-dark-700/30 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium text-sm">{participant.userName?.charAt(0) || "U"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{participant.userName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div
            className="absolute inset-y-0 right-0 w-80 bg-gradient-card backdrop-blur-lg shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-l border-dark-600/30"
            style={{ zIndex: 4 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-600/30">
              <h3 className="text-lg font-semibold text-white">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-dark-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-white">{message.sender}</p>
                    <p className="text-xs text-dark-300">{message.time}</p>
                  </div>
                  <p className="text-sm text-dark-200">{message.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-dark-600/30">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-xl text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-200"
                />
                <button className="bg-gradient-primary text-white p-2 rounded-xl hover:opacity-90 transition-opacity active:scale-95">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
