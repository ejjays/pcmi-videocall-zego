"use client"

import Link from "next/link"
import { Video } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
}

export default function Header({ title = "PCMI", showBackButton = false, backHref = "/home" }: HeaderProps) {
  const { user } = useAuth()

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
            
            {/* Admin Panel Link - Available to all authenticated users for testing */}
            <Link
              href="/admin/users"
              className="p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation"
              title="Admin Panel (Testing)"
            >
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </Link>
            
            <Link
              href="/profile"
              className="p-2 rounded-xl hover:bg-dark-700/50 active:bg-dark-600/50 transition-colors duration-200 touch-manipulation"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.photoURL || undefined} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}