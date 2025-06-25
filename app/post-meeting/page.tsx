"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Home } from "lucide-react"

export default function PostMeetingScreen() {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6 relative overflow-hidden animate-fadeIn">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-accent-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-accent-pink/10 to-primary-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="max-w-md w-full text-center relative z-10">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Meeting Ended</h1>
        <p className="text-dark-300 mb-8">Your meeting has ended successfully.</p>

        {/* Rating */}
        <div className="mb-6">
          <p className="text-lg font-medium text-white mb-4">Help us improve our app.</p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-colors duration-200 touch-manipulation"
              >
                <Star className={`w-8 h-8 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-8">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Any additional feedback? (optional)"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl resize-none h-24 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
          />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full bg-gradient-primary text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation shadow-lg hover:shadow-xl">
            Submit Feedback
          </button>

          <Link
            href="/home"
            className="flex items-center justify-center w-full bg-gradient-card border border-dark-600/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation hover:bg-gradient-to-br hover:from-dark-700 hover:to-dark-600"
          >
            <Home className="w-5 h-5 mr-2" />
            Skip
          </Link>
        </div>
      </div>
    </div>
  )
}
