"use client"

import { useEffect, useRef } from "react"
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt"
import { useAuth } from "@/contexts/auth-context"

interface VideoCallProps {
  roomId: string
  onLeave?: () => void
}

export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const zpRef = useRef<any>(null)

  useEffect(() => {
    if (!user || !containerRef.current || !roomId) return

    const appId = Number.parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!)
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!

    console.log("ZegoCloud Config:", { appId, hasServerSecret: !!serverSecret, roomId, userId: user.uid })

    if (!appId || !serverSecret) {
      console.error("Missing ZegoCloud configuration:", { appId, serverSecret })
      return
    }

    try {
      // Generate token for the user
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
      zpRef.current = zp

      console.log("ZegoUIKitPrebuilt instance created")

      // Join the room
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference, // Use VideoConference for group calls
        },
        showPreJoinView: false,
        showRoomTimer: true,
        showUserList: true,
        maxUsers: 10,
        layout: "Auto",
        showLayoutButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserName: true,
        showRemoveUserButton: false,
        turnOnCameraWhenJoining: true,
        turnOnMicrophoneWhenJoining: true,
        useFrontFacingCamera: true,
        showLeavingView: false,
        onLeaveRoom: () => {
          console.log("User left the room")
          onLeave?.()
        },
        onJoinRoom: () => {
          console.log("User joined the room:", roomId)
        },
        onUserJoin: (users: any[]) => {
          console.log("Users joined:", users)
        },
        onUserLeave: (users: any[]) => {
          console.log("Users left:", users)
        },
        // Custom styling to match your theme
        branding: {
          logoURL: "",
        },
        // UI customization
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
      })

      console.log("Joining room...")
    } catch (error) {
      console.error("Error setting up video call:", error)
    }

    // Cleanup function
    return () => {
      if (zpRef.current) {
        console.log("Cleaning up ZegoCloud instance")
        zpRef.current.destroy()
        zpRef.current = null
      }
    }
  }, [user, roomId, onLeave])

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-black"
      style={{
        minHeight: "100vh",
        width: "100vw",
      }}
    />
  )
}
