"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import ChatListView from "@/components/chat/chat-list-view"
import ChatView from "@/components/chat/chat-view"
import { useChatManager } from "@/hooks/use-chat-manager"

export default function ChatAppPage() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const { animation } = useLoadingAnimation()
  
  const {
    conversations,
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages
  } = useChatManager(user)

  const handleSelectConversation = (conversationID: string) => {
    setSelectedConversation(conversationID)
    loadMessages(conversationID)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageLoader animationData={animation} size="xl" />
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Chat Unavailable</h2>
            <p className="text-slate-300 mb-6 text-sm leading-relaxed">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        {!selectedConversation ? (
          <ChatListView 
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
          />
        ) : (
          <ChatView
            conversationID={selectedConversation}
            conversation={conversations.find(c => c.conversationID === selectedConversation)}
            messages={messages}
            onBack={handleBackToList}
            onSendMessage={sendMessage}
            user={user}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}