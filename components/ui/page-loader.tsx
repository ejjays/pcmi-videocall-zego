"use client"

import LottieLoader from "./lottie-loader"

interface PageLoaderProps {
  animationData?: any
  size?: "sm" | "md" | "lg" | "xl"
  overlay?: boolean // New prop to control overlay vs full page
}

export default function PageLoader({
  animationData,
  size = "lg",
  overlay = false,
}: PageLoaderProps) {
  if (overlay) {
    // Professional blurred overlay - shows current page content blurred in background
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Blurred backdrop */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/20" />
        
        {/* Loading animation on top */}
        <div className="relative z-10">
          <LottieLoader animationData={animationData} size={size} />
        </div>
      </div>
    )
  }

  // Full page loader (for initial app loading)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <LottieLoader animationData={animationData} size={size} />
    </div>
  )
}