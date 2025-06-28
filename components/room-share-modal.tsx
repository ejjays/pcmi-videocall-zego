"use client"

import { useState } from "react"
import { Copy, Share2, X } from "lucide-react"

interface RoomShareModalProps {
  roomId: string
  isOpen: boolean
  onClose: () => void
}

export default function RoomShareModal({ roomId, isOpen, onClose }: RoomShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const meetingLink = `${window.location.origin}/join?roomId=${roomId}`
  const shortRoomId = roomId.split("_")[2] || roomId

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my meeting",
          text: `Join my video meeting using this link:`,
          url: meetingLink,
        })
      } catch (error) {
        console.error("Failed to share:", error)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-600/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Share Meeting</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Meeting ID */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Meeting ID</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg">
                <code className="text-white font-mono">{shortRoomId}</code>
              </div>
              <button
                onClick={() => copyToClipboard(shortRoomId)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Meeting Link</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg">
                <p className="text-white text-sm truncate">{meetingLink}</p>
              </div>
              <button
                onClick={() => copyToClipboard(meetingLink)}
                className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => copyToClipboard(meetingLink)}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 active:scale-95"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>

            {navigator.share && (
              <button
                onClick={shareNative}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
