"use client"

import { useState, useEffect } from "react"

interface Reaction {
  id: string
  emoji: string
  x: number
  y: number
  timestamp: number
}

interface ReactionsOverlayProps {
  reactions: Reaction[]
}

export default function ReactionsOverlay({ reactions }: ReactionsOverlayProps) {
  const [activeReactions, setActiveReactions] = useState<Reaction[]>([])

  useEffect(() => {
    setActiveReactions(reactions)

    // Remove reactions after animation
    const timer = setTimeout(() => {
      setActiveReactions([])
    }, 3000)

    return () => clearTimeout(timer)
  }, [reactions])

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {activeReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute animate-bounce-up"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animation: "floatUp 3s ease-out forwards",
          }}
        >
          <span className="text-4xl drop-shadow-lg">{reaction.emoji}</span>
        </div>
      ))}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translateY(-200px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
