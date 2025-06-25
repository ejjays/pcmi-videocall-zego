"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AuthProvider } from "@/contexts/auth-context"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100) // Very short timeout to ensure mounting

    // Cleanup timer
    return () => clearTimeout(timer)
  }, [])

  // Add error boundary for debugging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Client error:", event.error)
      setError(event.error?.message || "An error occurred")
      setMounted(true) // Still mount even if there's an error
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">!</span>
          </div>
          <p className="text-white font-medium mb-2">Something went wrong</p>
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Reload App
          </button>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-white font-medium">Loading PCMI...</p>
        </div>
      </div>
    )
  }

  return <AuthProvider>{children}</AuthProvider>
}
