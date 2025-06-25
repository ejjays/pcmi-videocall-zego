"use client"

import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import { Users, Phone, Video } from "lucide-react"

export default function HistoryScreen() {
  const callHistory = [
    {
      id: 1,
      title: "Team Standup",
      type: "video",
      duration: "45 min",
      participants: 5,
      date: "Today, 10:00 AM",
      status: "completed",
    },
    {
      id: 2,
      title: "Client Call",
      type: "video",
      duration: "1h 20min",
      participants: 3,
      date: "Yesterday, 2:00 PM",
      status: "completed",
    },
    {
      id: 3,
      title: "Quick Sync",
      type: "audio",
      duration: "15 min",
      participants: 2,
      date: "Dec 23, 4:30 PM",
      status: "completed",
    },
    {
      id: 4,
      title: "Project Review",
      type: "video",
      duration: "2h 10min",
      participants: 8,
      date: "Dec 22, 9:00 AM",
      status: "completed",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark animate-fadeIn">
      <Header title="Call History" />

      <main className="px-4 py-6 pb-24">
        {/* Filter Tabs */}
        <div className="flex bg-dark-800/50 rounded-xl p-1 mb-6 border border-dark-600/30">
          <button className="flex-1 py-2 px-4 bg-gradient-primary text-white font-medium rounded-lg shadow-lg">
            All Calls
          </button>
          <button className="flex-1 py-2 px-4 text-dark-300 font-medium hover:text-white transition-colors">
            Missed
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {callHistory.map((call) => (
            <div key={call.id} className="card-interactive p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-dark-600 to-dark-700 rounded-xl flex items-center justify-center mr-4">
                    {call.type === "video" ? (
                      <Video className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Phone className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{call.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-dark-300">
                      <span>{call.date}</span>
                      <span>•</span>
                      <span>{call.duration}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-xs text-dark-400">{call.participants} participants</span>
                    </div>
                  </div>
                </div>

                <button className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors duration-200 touch-manipulation">
                  <Phone className="w-5 h-5 text-dark-300" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
