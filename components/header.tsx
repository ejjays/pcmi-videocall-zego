"use client"

import Link from "next/link"
import { Video } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

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
            <Link
              href="/chat-app"
              className="p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation"
            >
              <Image
                src="/chats.svg"
                alt="Chat"
                width={28}
                height={28}
                className="w-7 h-7"
                style={{ filter: 'none' }}
              />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.photoURL || undefined} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}