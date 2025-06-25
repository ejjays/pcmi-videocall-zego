"use client"

import Link from "next/link"
import { Settings, Video } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import AvatarWithFallback from "@/components/ui/avatar-with-fallback"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
}

export default function Header({ title = "PCMI", showBackButton = false, backHref = "/home" }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="bg-gradient-to-r from-dark-900/95 to-dark-800/95 backdrop-blur-lg border-b border-dark-600/30 safe-area-top">
      <div className="flex items-center justify-between px-4 py-4 pt-safe-top">
        <div className="flex items-center">
          {showBackButton ? (
            <Link
              href={backHref}
              className="mr-3 p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation"
            >
              <svg className="w-6 h-6 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <Video className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>

        {!showBackButton && (
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation">
              <Settings className="w-6 h-6 text-dark-300" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation"
            >
              <AvatarWithFallback
                src={user?.photoURL}
                name={user?.displayName}
                email={user?.email}
                size="md"
                alt="Profile"
              />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
