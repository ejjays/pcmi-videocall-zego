"use client"

import { useEffect, useRef } from "react"

interface LottieLoaderProps {
  size?: number
  className?: string
}

export default function LottieLoader({ size = 120, className = "" }: LottieLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let animationInstance: any = null

    const loadLottie = async () => {
      try {
        const lottie = (await import("lottie-web")).default

        if (containerRef.current) {
          const response = await fetch("/animations/loading.json")
          const animationData = await response.json()

          animationInstance = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: animationData,
          })
        }
      } catch (error) {
        console.error("Failed to load Lottie animation:", error)
      }
    }

    loadLottie()

    return () => {
      if (animationInstance) {
        animationInstance.destroy()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
