"use client"

import Link from "next/link"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useMeetingStatus } from "@/hooks/use-admin"
import { startMeeting, FIXED_ROOM_ID } from "@/lib/admin"
import { Video, Plus, Calendar, ChevronRight, Users, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import ToastNotification from "@/components/ui/toast-notification"

export default function HomeScreen() {
  const { user } = useAuth()
  const { meetingStatus, isLoading: meetingLoading } = useMeetingStatus()
  const router = useRouter()
  const { animation } = useLoadingAnimation()
  
  const [isStartingMeeting, setIsStartingMeeting] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: 'success' as 'success' | 'error' | 'info'
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const upcomingMeetings = [
    {
      id: 1,
      title: "Triumph over Fear",
      time: "7:00 PM",
      date: "Sunday",
      participants: 8,
      canStart: true,
    },
    {
      id: 2,
      title: "Finding Purpose",
      time: "7:20 PM",
      date: "Sunday",
      participants: 11,
      canStart: false,
    },
    {
      id: 3,
      title: "Reliability: Trait that is at times uncommon",
      time: "8:00 PM",
      date: "Sunday",
      participants: 12,
      canStart: false,
    },
  ]

  const handleNewMeeting = async () => {
    if (!user) return

    setIsStartingMeeting(true)
    
    try {
      await startMeeting(user.uid, user.displayName || user.email || "User")
      showToast("Meeting started successfully! 🎉", 'success')
      
      // Navigate to meeting after a short delay
      setTimeout(() => {
        router.push(`/meeting?roomId=${FIXED_ROOM_ID}`)
      }, 1000)
    } catch (error) {
      console.error("Error starting meeting:", error)
      showToast("Failed to start meeting", 'error')
      setIsStartingMeeting(false)
    }
  }

  const handleJoinMeeting = () => {
    if (meetingStatus?.isActive) {
      router.push(`/meeting?roomId=${FIXED_ROOM_ID}`)
    } else {
      router.push("/join")
    }
  }

  if (meetingLoading) {
    return (
      <ProtectedRoute>
        <PageLoader animationData={animation} size="xl" />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 animate-fadeIn">
        {/* Toast Notification */}
        <ToastNotification
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
          type={toast.type}
          duration={3000}
        />

        {/* Loading Overlay */}
        {isStartingMeeting && (
          <PageLoader animationData={animation} size="xl" overlay={true} />
        )}

        <Header />

        <main className="px-4 py-6 pb-24">
          {/* Welcome Message */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {user?.displayName?.split(" ")[0] || "User"}! 👋
            </h1>
            <p className="text-slate-300">Ready for the Word of God?</p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleNewMeeting}
              disabled={isStartingMeeting}
              className="block w-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl p-6 shadow-xl transition-all duration-200 active:scale-98 touch-manipulation hover:shadow-2xl disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Start Meeting</h3>
                    <p className="text-white/80 text-sm">Start the main meeting room</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/60" />
              </div>
            </button>

            <button
              onClick={handleJoinMeeting}
              className={`block w-full rounded-2xl p-6 shadow-xl transition-all duration-200 active:scale-98 touch-manipulation border ${
                meetingStatus?.isActive
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 animate-breathing-glow border-emerald-400/50"
                  : "bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/30 hover:from-slate-700 hover:to-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm ${
                    meetingStatus?.isActive
                      ? "bg-white/20"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-500"
                  }`}>
                    {meetingStatus?.isActive ? (
                      <Sparkles className="w-6 h-6 text-white" />
                    ) : (
                      <Plus className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {meetingStatus?.isActive ? "Join Live Meeting" : "Join Meeting"}
                    </h3>
                    <p className={`text-sm ${
                      meetingStatus?.isActive ? "text-white/80" : "text-slate-300"
                    }`}>
                      {meetingStatus?.isActive 
                        ? `${meetingStatus.participantCount} people joined`
                        : "Join an existing meeting"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {meetingStatus?.isActive && (
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  )}
                  <ChevronRight className={`w-6 h-6 ${
                    meetingStatus?.isActive ? "text-white/60" : "text-slate-400"
                  }`} />
                </div>
              </div>
            </button>
          </div>

          {/* Meeting Status Info */}
          {meetingStatus && (
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Meeting Status</p>
                  <p className="text-slate-400 text-sm">
                    {meetingStatus.isActive ? "Live meeting in progress" : "No active meeting"}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  meetingStatus.isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
                }`}></div>
              </div>
            </div>
          )}

          {/* Upcoming Meetings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Meetings</h2>
              <button className="text-cyan-400 font-medium text-sm hover:text-cyan-300 transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="card-interactive p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mr-3">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{meeting.title}</h3>
                        <p className="text-sm text-slate-300">
                          {meeting.date} • {meeting.time}
                        </p>
                        <p className="text-xs text-slate-400">{meeting.participants} participants</p>
                      </div>
                    </div>

                    {meeting.canStart ? (
                      <button
                        onClick={() => router.push(`/meeting?roomId=${FIXED_ROOM_ID}`)}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                      >
                        Start
                      </button>
                    ) : (
                      <button className="bg-slate-700/50 text-slate-300 px-4 py-2 rounded-xl font-medium text-sm border border-slate-600/30">
                        Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  )
}