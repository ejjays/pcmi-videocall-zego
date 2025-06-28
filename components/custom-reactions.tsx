"use client"

import { useState, useEffect } from "react"
import { Heart, Smile } from "lucide-react"

interface CustomReactionsProps {
  roomId: string
  userId: string
  userName: string
  onSendReaction: (reaction: { emoji: string; userId: string; userName: string }) => void
}

interface FloatingReaction {
  id: string
  emoji: string
  x: number
  y: number
  userName: string
}

const REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "👍", label: "Like" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "⭐", label: "Star" },
]

export default function CustomReactions({ roomId, userId, userName, onSendReaction }: CustomReactionsProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([])
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  // Auto-hide reactions panel after 4 seconds of inactivity
  useEffect(() => {
    if (showReactions) {
      if (hideTimeout) clearTimeout(hideTimeout)
      const timeout = setTimeout(() => {
        setShowReactions(false)
      }, 4000)
      setHideTimeout(timeout)
    }
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout)
    }
  }, [showReactions])

  const handleReactionClick = (emoji: string) => {
    // Send reaction to parent component
    onSendReaction({ emoji, userId, userName })

    // Create floating reaction
    const reaction: FloatingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.random() * 80 + 10, // Random position between 10% and 90%
      y: Math.random() * 60 + 20, // Random position between 20% and 80%
      userName,
    }

    setFloatingReactions((prev) => [...prev, reaction])

    // Remove floating reaction after animation
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id))
    }, 3000)

    // Keep reactions panel open
    setShowReactions(true)
  }

  const handleDemoReaction = () => {
    const randomEmoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)].emoji
    handleReactionClick(randomEmoji)
  }

  return (
    <>
      {/* Floating Reactions */}
      {floatingReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="fixed pointer-events-none z-40 animate-bounce"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animation: "float-up 3s ease-out forwards",
          }}
        >
          <div className="text-4xl drop-shadow-lg">{reaction.emoji}</div>
          <div className="text-xs text-white/80 text-center mt-1 font-medium">{reaction.userName}</div>
        </div>
      ))}

      {/* Heart Button - Always Visible */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 touch-manipulation hover:shadow-pink-500/40"
        style={{
          boxShadow: "0 8px 32px rgba(236, 72, 153, 0.3)",
        }}
      >
        <Heart className="w-7 h-7 text-white fill-white" />
      </button>

      {/* Reactions Panel */}
      {showReactions && (
        <div className="fixed bottom-36 right-6 z-50 bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/10 animate-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => handleReactionClick(reaction.emoji)}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 touch-manipulation border border-white/5"
                title={reaction.label}
              >
                <span className="text-2xl">{reaction.emoji}</span>
              </button>
            ))}
          </div>

          {/* Demo Button */}
          <button
            onClick={handleDemoReaction}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium py-2 px-4 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation"
          >
            <Smile className="w-4 h-4 inline mr-2" />
            Demo Reaction
          </button>
        </div>
      )}

      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-50px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.8);
          }
        }
      `}</style>
    </>
  )
}
