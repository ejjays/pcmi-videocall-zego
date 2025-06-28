"use client"

import { useState, useEffect } from "react"

export function useLoadingAnimation() {
  const [animation, setAnimation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const loadingAnim = await import("@/public/animations/loading.json")
        setAnimation(loadingAnim.default)
      } catch (error) {
        console.warn("Failed to load Lottie animation:", error)
        // Animation will remain null and CSS fallback will be used
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimation()
  }, [])

  return { animation, isLoading }
}