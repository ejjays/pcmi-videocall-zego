"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Clock } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/contacts", icon: Users, label: "Contacts" },
    { href: "/history", icon: Clock, label: "History" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-dark-900/95 to-dark-800/95 backdrop-blur-lg border-t border-dark-600/30 safe-area-bottom">
      <div className="flex justify-around items-center py-2 pb-safe-bottom">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation ${
                isActive
                  ? "text-primary-400 bg-gradient-to-br from-primary-500/20 to-accent-purple/20 shadow-lg"
                  : "text-dark-400 hover:text-dark-200 active:bg-dark-700/50"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? "text-primary-400" : "text-dark-400"}`} />
              <span className={`text-xs font-medium ${isActive ? "text-primary-400" : "text-dark-400"}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
