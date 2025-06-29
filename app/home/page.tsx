"use client"

import Link from "next/link"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { Video, Plus, Calendar, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomeScreen() {
  const { user } = useAuth()
  const router = useRouter()

  // Fixed meeting room ID - everyone joins the same room
  const FIXED_ROOM_ID = "kamustahan01"

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 animate-fadeIn">
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
              onClick={() => {
                // Always use the same fixed room ID
                router.push(`/meeting?roomId=${FIXED_ROOM_ID}`)
              }}
              className="block w-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl p-6 shadow-xl transition-all duration-200 active:scale-98 touch-manipulation hover:shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">New Meeting</h3>
                    <p className="text-white/80 text-sm">Join the main meeting room</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/60" />
              </div>
            </button>

            <Link
              href="/join"
              className="block w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/30 rounded-2xl p-6 shadow-xl transition-all duration-200 active:scale-98 touch-manipulation hover:from-slate-700 hover:to-slate-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Join a Meeting</h3>
                    <p className="text-slate-300 text-sm">Enter meeting ID: {FIXED_ROOM_ID}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400" />
              </div>
            </Link>
          </div>

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
                      <Link
                        href={`/meeting?roomId=${FIXED_ROOM_ID}`}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
                      >
                        Start
                      </Link>
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