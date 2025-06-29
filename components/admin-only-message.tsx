"use client"

import { ArrowLeft, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function AdminOnlyMessage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="text-center max-w-md relative z-10">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Shield className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">Admin Access Required</h1>
        
        {/* Message */}
        <p className="text-slate-300 text-lg mb-2">
          Only administrators can start new meetings.
        </p>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Please use the "Join Meeting" option to enter an existing meeting, or contact an administrator to start a new session.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/join"
            className="block w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-2xl transition-all duration-200 active:scale-95 touch-manipulation hover:shadow-3xl"
          >
            <div className="flex items-center justify-center">
              <Users className="w-5 h-5 mr-2" />
              Join Meeting Instead
            </div>
          </Link>

          <Link
            href="/home"
            className="block w-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation border border-slate-600/30"
          >
            <div className="flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-slate-800/30 rounded-xl border border-slate-600/20">
          <p className="text-xs text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">Tip:</strong> Administrators can manage user permissions and start meetings for the community.
          </p>
        </div>
      </div>
    </div>
  )
}