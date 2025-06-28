"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Phone, Users, Send, Smile, Paperclip } from "lucide-react"
import { ChatConversation, ChatMessage } from "@/types/chat"
import { User } from "firebase/auth"

interface ChatViewProps {
  conversationID: string
  conversation?: ChatConversation
  messages: ChatMessage[]
  onBack: () => void
  onSendMessage: (conversationID: string, message: string) => Promise<void>
  user: User | null
}

export default function ChatView({ 
  conversationID, 
  conversation, 
  messages, 
  onBack, 
  onSendMessage, 
  user 
}: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(conversationID, newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation mr-2"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={conversation?.avatar || "/placeholder-user.jpg"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              {conversation?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-slate-900"></div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-white">
                {conversation?.conversationName || "Chat"}
              </h3>
              <p className="text-xs text-slate-400">
                {conversation?.isOnline ? 'Active now' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation">
            <Phone className="w-5 h-5 text-slate-300" />
          </button>
          <button className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation">
            <Users className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 140px)' }}>
        {messages.map((message) => (
          <div
            key={message.messageID}
            className={`flex ${message.senderUserID === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.senderUserID === user?.uid ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.senderUserID === user?.uid
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-slate-700/50 text-white border border-slate-600/30'
                }`}
              >
                <p className="text-sm">{message.message}</p>
              </div>
              <p className={`text-xs text-slate-400 mt-1 ${message.senderUserID === user?.uid ? 'text-right' : 'text-left'}`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation">
            <Paperclip className="w-5 h-5 text-slate-300" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              disabled={isSending}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm disabled:opacity-50"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-700/50 transition-colors duration-200">
              <Smile className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </>
  )
}