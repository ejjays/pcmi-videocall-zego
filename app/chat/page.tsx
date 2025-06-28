"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import Header from "@/components/header"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"

export default function ChatPage() {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const zegoRef = useRef<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string>("")
  const { animation } = useLoadingAnimation()

  useEffect(() => {
    if (containerRef.current && !zegoRef.current && user) {
      initializeZegoChat()
    }
  }, [user])

  const initializeZegoChat = async () => {
    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Check environment variables
      const appIdStr = process.env.NEXT_PUBLIC_ZEGO_APP_ID
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET

      if (!appIdStr || !serverSecret) {
        throw new Error("ZegoCloud configuration is missing")
      }

      const appId = Number.parseInt(appIdStr)
      if (isNaN(appId)) {
        throw new Error("Invalid ZegoCloud App ID")
      }

      console.log("🗨️ Initializing ZegoCloud BUILT-IN Chat...")

      // Create a dedicated chat room for PCMI community
      const chatRoomId = "pcmi_community_chat"

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        chatRoomId,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "User",
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zegoRef.current = zp

      await zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming, // Use LiveStreaming for chat-focused experience
        },

        // 🔥 CHAT-FOCUSED CONFIGURATION
        showPreJoinView: false,
        showLeavingView: false,

        // 💬 ENABLE ZEGOCLOUD'S BUILT-IN CHAT FEATURES
        showTextChat: true, // ✅ Enable built-in chat
        showUserList: true, // ✅ Show participants
        showRoomTimer: false, // ❌ Hide timer for chat

        // 📹 DISABLE VIDEO/AUDIO FOR PURE CHAT EXPERIENCE
        showMyCameraToggleButton: false,
        showMyMicrophoneToggleButton: false,
        showAudioVideoSettingsButton: false,
        showScreenSharingButton: false,
        showLayoutButton: false,
        showFullscreenButton: false,
        showPinButton: false,

        // 🎯 CHAT-ONLY SETTINGS
        turnOnCameraWhenJoining: false,
        turnOnMicrophoneWhenJoining: false,

        // 👤 USER INFO
        userAvatarUrl: user.photoURL || undefined,

        // 🎨 CUSTOMIZE CHAT APPEARANCE
        branding: {
          logoURL: "", // Remove ZegoCloud branding
        },

        // 📱 MOBILE-OPTIMIZED LAYOUT
        layout: "Auto",
        maxUsers: 100, // Support many chat participants

        // 🔔 CALLBACKS
        onJoinRoom: () => {
          console.log("✅ Successfully joined ZegoCloud chat room")
          setIsConnected(true)
          setIsInitializing(false)
          setError("")
        },
        onLeaveRoom: () => {
          console.log("👋 Left ZegoCloud chat room")
          zegoRef.current = null
        },
        onUserJoin: (users: any[]) => {
          console.log("👥 Users joined chat:", users)
        },
        onUserLeave: (users: any[]) => {
          console.log("👋 Users left chat:", users)
        },
        onError: (error: any) => {
          console.error("❌ ZegoCloud chat error:", error)
          setError("Failed to connect to ZegoCloud chat. Please try again.")
          setIsInitializing(false)
        },
      })

      console.log("✅ ZegoCloud built-in chat initialized successfully")
    } catch (error) {
      console.error("❌ Error initializing ZegoCloud chat:", error)
      setError(`Failed to initialize chat: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsInitializing(false)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (zegoRef.current) {
        try {
          console.log("🧹 Cleaning up ZegoCloud chat")
          zegoRef.current.destroy()
        } catch (error) {
          console.warn("Error during chat cleanup:", error)
        } finally {
          zegoRef.current = null
        }
      }
    }
  }, [])

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <Header title="PCMI Chat" showBackButton={true} backHref="/home" />
          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">!</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Chat Unavailable</h2>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
        <Header title="PCMI Community Chat" showBackButton={true} backHref="/home" />

        <div className="relative h-[calc(100vh-80px)]">
          {/* 🗨️ ZEGOCLOUD'S BUILT-IN CHAT CONTAINER */}
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{
              minHeight: "calc(100vh - 80px)",
              width: "100%",
            }}
          />

          {/* Professional Blurred Loading overlay */}
          {isInitializing && (
            <PageLoader animationData={animation} size="xl" overlay={true} />
          )}

          {/* Welcome message for ZegoCloud chat */}
          {isConnected && (
            <div className="absolute top-4 left-4 right-4 z-40 pointer-events-none">
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-1">💬 ZegoCloud Built-in Chat!</h3>
                <p className="text-slate-300 text-sm">
                  This is ZegoCloud's native messaging system with real-time chat, user lists, and more!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}