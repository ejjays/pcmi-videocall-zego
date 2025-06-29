"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { updateParticipantCount, endMeeting, FIXED_ROOM_ID } from "@/lib/admin"
import ProtectedRoute from "@/components/protected-route"
import MeetingPreparation from "@/components/meeting-preparation"
import RoomShareModal from "@/components/room-share-modal"
import CustomReactions from "@/components/custom-reactions"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"

export default function MeetingScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const zegoRef = useRef<any>(null)
  const initializationRef = useRef<boolean>(false)
  const isLeavingRef = useRef<boolean>(false)
  const participantCountRef = useRef<number>(0)
  
  const [roomId, setRoomId] = useState<string>("")
  const [showPreparation, setShowPreparation] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string>("")
  const [showShareModal, setShowShareModal] = useState(false)
  const [meetingSettings, setMeetingSettings] = useState<{ video: boolean; audio: boolean; mirror: boolean } | null>(null)
  const { animation } = useLoadingAnimation()

  useEffect(() => {
    const urlRoomId = searchParams.get("roomId")
    if (urlRoomId) {
      setRoomId(urlRoomId)
    } else {
      // Always use the fixed room ID
      setRoomId(FIXED_ROOM_ID)
      const newUrl = `/meeting?roomId=${FIXED_ROOM_ID}`
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  // Initialize ZegoCloud when container is ready
  useEffect(() => {
    if (
      !showPreparation &&
      meetingSettings &&
      containerRef.current &&
      !isInitializing &&
      !initializationRef.current &&
      !zegoRef.current
    ) {
      console.log("Container is ready, initializing ZegoCloud...")
      initializeZegoCloud(meetingSettings)
    }
  }, [showPreparation, meetingSettings, isInitializing])

  // Apply mirror effect when connected
  useEffect(() => {
    if (isConnected && meetingSettings?.mirror && containerRef.current) {
      applyMirrorEffect()
    }
  }, [isConnected, meetingSettings])

  const applyMirrorEffect = () => {
    try {
      const videoElements = containerRef.current?.querySelectorAll("video")

      if (videoElements) {
        videoElements.forEach((video) => {
          const isLocalVideo =
            video.getAttribute("data-local") === "true" ||
            video.closest('[data-local="true"]') ||
            video.style.transform?.includes("scaleX") !== undefined

          if (isLocalVideo || videoElements.length === 1) {
            video.style.transform = meetingSettings?.mirror ? "scaleX(-1)" : "scaleX(1)"
            video.style.transition = "transform 0.3s ease"
          }
        })
      }

      const zegoVideoElements = containerRef.current?.querySelectorAll(
        '[class*="video"], [class*="local"], [class*="self"], video',
      )

      if (zegoVideoElements) {
        zegoVideoElements.forEach((element) => {
          const video = element.tagName === "VIDEO" ? (element as HTMLVideoElement) : element.querySelector("video")
          if (video) {
            video.style.transform = meetingSettings?.mirror ? "scaleX(-1)" : "scaleX(1)"
            video.style.transition = "transform 0.3s ease"
          }
        })
      }
    } catch (error) {
      console.warn("Error applying mirror effect:", error)
    }
  }

  const initializeZegoCloud = async (settings: { video: boolean; audio: boolean; mirror: boolean }) => {
    if (isInitializing || initializationRef.current || zegoRef.current) {
      console.log("Already initializing or initialized, skipping...")
      return
    }

    initializationRef.current = true
    setIsInitializing(true)
    console.log("Starting ZegoCloud initialization with settings:", settings)

    try {
      if (!user) {
        throw new Error("User not authenticated. Please sign in again.")
      }

      if (!roomId) {
        throw new Error("Room ID is missing. Please try again.")
      }

      const appIdStr = process.env.NEXT_PUBLIC_ZEGO_APP_ID
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET

      if (!appIdStr || !serverSecret) {
        throw new Error("ZegoCloud configuration is missing. Please check environment variables.")
      }

      const appId = Number.parseInt(appIdStr)
      if (isNaN(appId)) {
        throw new Error("Invalid ZegoCloud App ID configuration.")
      }

      let retries = 0
      const maxRetries = 10
      while (!containerRef.current && retries < maxRetries) {
        console.log(`Waiting for container... (attempt ${retries + 1}/${maxRetries})`)
        await new Promise((resolve) => setTimeout(resolve, 100))
        retries++
      }

      if (!containerRef.current) {
        throw new Error("Video container not ready. Please try again.")
      }

      console.log("Creating ZegoCloud instance...")

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        serverSecret,
        roomId,
        user.uid,
        user.displayName || user.email?.split("@")[0] || "User",
      )

      console.log("Token generated successfully")

      const zp = ZegoUIKitPrebuilt.create(kitToken)
      zegoRef.current = zp

      console.log("ZegoUIKitPrebuilt instance created")

      await zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },

        showPreJoinView: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        showLayoutButton: true,
        showLeavingView: false,
        showRoomTimer: false,
        showRemoveUserButton: false,

        turnOnCameraWhenJoining: settings.video,
        turnOnMicrophoneWhenJoining: settings.audio,
        useFrontFacingCamera: true,

        videoMirror: false,
        videoResolution: "720p",
        videoOrientation: "portrait",

        layout: "Auto",
        maxUsers: 10,
        showFullscreenButton: true,
        showPinButton: true,
        showNonVideoUser: true,
        showOnlyAudioUser: true,

        userAvatarUrl: user.photoURL || undefined,

        onJoinRoom: () => {
          console.log("Successfully joined room")
          setIsConnected(true)
          setError("")
          setIsInitializing(false)
          
          // Update participant count
          participantCountRef.current = 1
          updateParticipantCount(1).catch(console.error)

          setTimeout(() => {
            if (settings.mirror) {
              applyMirrorEffect()
            }
          }, 1000)
        },
        onLeaveRoom: () => {
          console.log("User left the room - handling leave")

          if (isLeavingRef.current) {
            console.log("Already handling leave, skipping...")
            return
          }
          isLeavingRef.current = true

          // Update participant count
          const newCount = Math.max(0, participantCountRef.current - 1)
          updateParticipantCount(newCount).catch(console.error)

          zegoRef.current = null
          initializationRef.current = false

          setTimeout(() => {
            console.log("Navigating to post-meeting page")
            router.push("/post-meeting")
          }, 100)
        },
        onUserJoin: (users: any[]) => {
          console.log("Users joined:", users)
          participantCountRef.current = users.length + 1 // +1 for current user
          updateParticipantCount(participantCountRef.current).catch(console.error)
          
          setTimeout(() => {
            if (settings.mirror) {
              applyMirrorEffect()
            }
          }, 500)
        },
        onUserLeave: (users: any[]) => {
          console.log("Users left:", users)
          participantCountRef.current = users.length + 1 // +1 for current user
          updateParticipantCount(participantCountRef.current).catch(console.error)
        },
        onError: (error: any) => {
          console.error("ZegoCloud error:", error)
          setError("Failed to join meeting. Please check your connection and try again.")
          zegoRef.current = null
          initializationRef.current = false
          isLeavingRef.current = false
          setShowPreparation(true)
          setIsInitializing(false)
        },

        branding: {
          logoURL: "",
        },
      })

      console.log("ZegoCloud room joined successfully")
    } catch (error) {
      console.error("Error initializing ZegoCloud:", error)
      setError(`Failed to join meeting: ${error instanceof Error ? error.message : "Unknown error"}`)

      zegoRef.current = null
      initializationRef.current = false
      isLeavingRef.current = false
      setShowPreparation(true)
      setIsInitializing(false)
    }
  }

  const handleJoinMeeting = (settings: { video: boolean; audio: boolean; mirror: boolean }) => {
    console.log("Join meeting requested with settings:", settings)

    if (isInitializing || initializationRef.current) {
      console.log("Already joining, ignoring duplicate request")
      return
    }

    setMeetingSettings(settings)
    setShowPreparation(false)
    setError("")
  }

  const handleBackToHome = () => {
    if (zegoRef.current && !isLeavingRef.current) {
      try {
        isLeavingRef.current = true
        zegoRef.current.destroy()
      } catch (error) {
        console.warn("Error during cleanup:", error)
      } finally {
        zegoRef.current = null
        initializationRef.current = false
        isLeavingRef.current = false
      }
    }
    router.push("/home")
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleRetry = () => {
    if (zegoRef.current && !isLeavingRef.current) {
      try {
        isLeavingRef.current = true
        zegoRef.current.destroy()
      } catch (error) {
        console.warn("Error during cleanup:", error)
      } finally {
        zegoRef.current = null
        isLeavingRef.current = false
      }
    }

    initializationRef.current = false
    setError("")
    setIsInitializing(false)
    setIsConnected(false)
    setMeetingSettings(null)
    setShowPreparation(true)
  }

  const handleSendReaction = (reaction: { emoji: string; userId: string; userName: string }) => {
    console.log("Sending reaction:", reaction)

    if (zegoRef.current && zegoRef.current.sendInRoomMessage) {
      const reactionMessage = {
        type: "reaction",
        emoji: reaction.emoji,
        userId: reaction.userId,
        userName: reaction.userName,
        timestamp: Date.now(),
      }

      try {
        zegoRef.current.sendInRoomMessage(JSON.stringify(reactionMessage))
        console.log("Reaction sent via ZegoCloud messaging")
      } catch (error) {
        console.warn("Failed to send reaction via ZegoCloud:", error)
      }
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (zegoRef.current && !isLeavingRef.current) {
        try {
          console.log("Cleaning up ZegoCloud instance")
          isLeavingRef.current = true
          
          // Update participant count before leaving
          const newCount = Math.max(0, participantCountRef.current - 1)
          updateParticipantCount(newCount).catch(console.error)
          
          zegoRef.current.destroy()
        } catch (error) {
          console.warn("Error during ZegoCloud cleanup:", error)
        } finally {
          zegoRef.current = null
          initializationRef.current = false
          isLeavingRef.current = false
        }
      }
    }
  }, [])

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Unable to Join Meeting</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">{error}</p>

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
              >
                Try Again
              </button>
              <button
                onClick={handleBackToHome}
                className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!roomId) {
    return (
      <ProtectedRoute>
        <PageLoader animationData={animation} size="xl" />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      {showPreparation ? (
        <MeetingPreparation
          roomId={roomId}
          onJoin={handleJoinMeeting}
          onBack={handleBackToHome}
          userName={user?.displayName || user?.email?.split("@")[0] || "User"}
        />
      ) : (
        <div className="min-h-screen bg-black relative">
          <div
            ref={containerRef}
            className="w-full h-screen"
            style={{
              minHeight: "100vh",
              width: "100vw",
            }}
          />

          {(isInitializing || !isConnected) && (
            <PageLoader animationData={animation} size="xl" overlay={true} />
          )}

          {isConnected && (
            <CustomReactions
              roomId={roomId}
              userId={user?.uid || "anonymous"}
              userName={user?.displayName || user?.email?.split("@")[0] || "User"}
              onSendReaction={handleSendReaction}
            />
          )}

          {isConnected && (
            <button
              onClick={handleShare}
              className="fixed top-4 right-4 z-50 p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-lg transition-all duration-200 active:scale-95 touch-manipulation"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </button>
          )}

          <RoomShareModal roomId={roomId} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
        </div>
      )}
    </ProtectedRoute>
  )
}