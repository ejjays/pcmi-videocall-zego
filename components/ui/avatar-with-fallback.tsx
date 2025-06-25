"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface AvatarWithFallbackProps {
  src?: string | null
  alt?: string
  name?: string | null
  email?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export default function AvatarWithFallback({
  src,
  alt = "Profile",
  name,
  email,
  size = "md",
  className,
}: AvatarWithFallbackProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(!!src) // Only loading if we have a src
  const [uiAvatarError, setUiAvatarError] = useState(false)

  // Reset states when src changes
  useEffect(() => {
    setImageError(false)
    setUiAvatarError(false)
    setIsLoading(!!src) // Only set loading if we have a src to load
  }, [src])

  // Size classes
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  }

  // Get initials from name or email
  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Generate UI Avatars URL
  const getUIAvatarUrl = () => {
    const initials = getInitials()
    const colors = [
      "8b5cf6,ffffff", // Purple
      "06b6d4,ffffff", // Cyan
      "10b981,ffffff", // Emerald
      "f59e0b,ffffff", // Amber
      "ef4444,ffffff", // Red
      "ec4899,ffffff", // Pink
    ]

    // Use email/name to consistently pick a color
    const colorIndex = (name || email || "").length % colors.length
    const [bg, color] = colors[colorIndex].split(",")

    const sizeValue = sizeClasses[size].includes("w-6")
      ? 32
      : sizeClasses[size].includes("w-8")
        ? 48
        : sizeClasses[size].includes("w-12")
          ? 64
          : 80

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${sizeValue}&background=${bg}&color=${color}&bold=true&format=png`
  }

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleUIAvatarError = () => {
    setUiAvatarError(true)
    setIsLoading(false)
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-slate-600 flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      {/* Primary image (Google profile) */}
      {src && !imageError && (
        <>
          <img
            src={src || "/placeholder.svg"}
            alt={alt}
            className={cn("w-full h-full object-cover", isLoading ? "opacity-0" : "opacity-100")}
            onLoad={handleImageLoad}
            onError={handleImageError}
            crossOrigin="anonymous"
          />
          {/* Loading overlay only for primary image */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-600 flex items-center justify-center">
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </>
      )}

      {/* Fallback to UI Avatars service */}
      {(!src || imageError) && !uiAvatarError && (
        <img
          src={getUIAvatarUrl() || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleUIAvatarError}
        />
      )}

      {/* Final fallback to initials */}
      {(!src || imageError) && uiAvatarError && <span className="text-white font-medium">{getInitials()}</span>}
    </div>
  )
}
