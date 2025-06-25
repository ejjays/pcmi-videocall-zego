"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function WelcomeScreen() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Redirect authenticated users directly to home
  useEffect(() => {
    console.log("Welcome page - Auth state:", { user: !!user, loading })

    if (!loading && user) {
      console.log("User is authenticated, redirecting to home...")
      setIsNavigating(true)
      router.push("/home")
    }
  }, [user, loading, router])

  const handleGetStarted = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Get started clicked")
    setIsNavigating(true)

    // Add a smooth delay for the animation
    setTimeout(() => {
      router.push("/auth")
    }, 300)
  }

  const handleGuestAccess = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("Guest access clicked")
    setIsNavigating(true)

    // Add a smooth delay for the animation
    setTimeout(() => {
      router.push("/home")
    }, 300)
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
            <Video className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't show welcome page if user is authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Video className="w-8 h-8 text-white" />
          </div>
          <p className="text-white font-medium">Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-medium">Loading...</p>
          </div>
        </div>
      )}

      <div
        className={`text-center transition-all duration-1000 relative z-10 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } ${isNavigating ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
      >
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Video className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">Kamustahan</h1>
          <p className="text-slate-300 text-lg">Hello church 👋, we're so glad you're here. Join now!</p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          <button
            onClick={handleGetStarted}
            disabled={isNavigating}
            className="block w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-2xl transition-all duration-300 touch-manipulation text-center relative overflow-hidden hover:shadow-3xl active:scale-95 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isNavigating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : (
              "Get Started"
            )}
          </button>

          <button
            onClick={handleGuestAccess}
            disabled={isNavigating}
            className="block w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/30 text-white font-medium py-3 px-8 rounded-2xl transition-all duration-300 touch-manipulation text-center backdrop-blur-sm hover:from-slate-700 hover:to-slate-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isNavigating ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : (
              "Continue as Guest"
            )}
          </button>
        </div>

        {/* Version info */}
        <p className="text-slate-400 text-sm mt-8">Version 1.0.0</p>
      </div>
    </div>
  )
}
