"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

interface LottieLoaderProps {
  animationData?: any
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export default function LottieLoader({
  animationData,
  size = "md",
  className = "",
}: LottieLoaderProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  }

  // Show CSS fallback while loading or if no animation data
  if (!isClient || !animationData) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
        <div className="w-8 h-8 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <Lottie
        animationData={animationData}
        loop={true}
        autoplay={true}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid meet',
          clearCanvas: true,
          progressiveLoad: false,
          hideOnTransparent: true
        }}
      />
    </div>
  )
}