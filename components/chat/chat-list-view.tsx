"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Users, Search, Plus, MessageCircle, Bell } from "lucide-react"
import { ChatConversation } from "@/types/chat"

interface ChatListViewProps {
  conversations: ChatConversation[]
  onSelectConversation: (conversationID: string) => void
}

export default function ChatListView({ conversations, onSelectConversation }: ChatListViewProps) {
  const [activeTab, setActiveTab] = useState("chats")

  const formatLastMessageTime = (timestamp: number) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top border-b border-slate-700/30">
        <Link
          href="/home"
          className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          messenger
        </h1>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation">
            <Edit className="w-6 h-6 text-slate-300" />
          </button>
          <button className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation relative">
            <Users className="w-6 h-6 text-slate-300" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">1</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Search className="w-3 h-3 text-white" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Ask Meta AI or search"
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Stories Section */}
      <div className="px-4 mb-6">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full flex items-center justify-center border border-slate-600/30">
              <Plus className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-xs text-slate-400 mt-1 text-center">Create story</span>
          </div>
          
          {conversations.slice(0, 4).map((conv) => (
            <div key={conv.conversationID} className="flex flex-col items-center min-w-[80px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900">
                  <img src={conv.avatar} alt={conv.conversationName} className="w-full h-full object-cover" />
                </div>
                {conv.isOnline && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                )}
              </div>
              <span className="text-xs text-slate-300 mt-1 text-center truncate w-full">{conv.conversationName.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 px-4 pb-24">
        {conversations.map((conv) => (
          <div 
            key={conv.conversationID} 
            onClick={() => onSelectConversation(conv.conversationID)}
            className="flex items-center py-3 hover:bg-slate-800/30 rounded-xl px-3 transition-all duration-200 cursor-pointer active:scale-98"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img src={conv.avatar} alt={conv.conversationName} className="w-full h-full object-cover" />
              </div>
              {conv.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
              )}
            </div>
            
            <div className="flex-1 ml-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{conv.conversationName}</h3>
                <div className="flex items-center space-x-2">
                  {conv.lastMessage && (
                    <span className="text-xs text-slate-400">
                      {formatLastMessageTime(conv.lastMessage.timestamp)}
                    </span>
                  )}
                  {conv.unreadMessageCount > 0 && (
                    <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{conv.unreadMessageCount}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400 truncate">
                  {conv.lastMessage ? 
                    (conv.lastMessage.senderUserID === conv.conversationID ? 'You: ' : '') + conv.lastMessage.message 
                    : 'No messages yet'
                  }
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-lg border-t border-slate-600/30 safe-area-bottom">
        <div className="flex justify-around items-center py-2 pb-safe-bottom">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation relative ${
              activeTab === "chats" ? "text-cyan-400" : "text-slate-400"
            }`}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Chats</span>
            {activeTab === "chats" && (
              <div className="absolute bottom-0 w-8 h-1 bg-cyan-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation ${
              activeTab === "friends" ? "text-cyan-400" : "text-slate-400"
            }`}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Friends</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation ${
              activeTab === "notifications" ? "text-cyan-400" : "text-slate-400"
            }`}
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Notifications</span>
          </button>
        </div>
      </div>
    </>
  )
}