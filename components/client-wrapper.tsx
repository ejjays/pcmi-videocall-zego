"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { animation } = useLoadingAnimation()

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
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
    return <PageLoader animationData={animation} size="xl" />
  }

  return <AuthProvider>{children}</AuthProvider>
}