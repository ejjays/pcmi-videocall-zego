"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Users, Bell, MessageCircle, Search, Plus, Heart, Phone } from "lucide-react"

export default function ChatAppPage() {
  const [activeTab, setActiveTab] = useState("chats")

  const stories = [
    { id: 1, name: "Create story", avatar: null, isCreate: true },
    { id: 2, name: "James Marl...", avatar: "/placeholder-user.jpg", isOnline: false, time: "6m" },
    { id: 3, name: "Jeremy", avatar: "/placeholder-user.jpg", isOnline: true, hasStory: true },
    { id: 4, name: "Jhomar", avatar: "/placeholder-user.jpg", isOnline: true },
  ]

  const chats = [
    {
      id: 1,
      name: "Manuelita Canoy Alloso",
      avatar: "/placeholder-user.jpg",
      lastMessage: "You: Pwede ba dyan tumawa...",
      time: "3:32 pm",
      isOnline: false,
      unread: 0,
      timeAgo: "9m"
    },
    {
      id: 2,
      name: "Paul Vincent Dalo",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Reacted ❤️ to your message",
      time: "3:32 pm",
      isOnline: false,
      unread: 0
    },
    {
      id: 3,
      name: "Jeremy Alloso",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Reacted ❤️ to your message",
      time: "3:10 pm",
      isOnline: false,
      unread: 0
    },
    {
      id: 4,
      name: "GTC Worship Team",
      avatar: "/placeholder-user.jpg",
      lastMessage: "Qwncy deleted a message.",
      time: "2:52 pm",
      isOnline: true,
      unread: 0
    },
    {
      id: 5,
      name: "Matthew Angelo",
      avatar: "/placeholder-user.jpg",
      lastMessage: "The audio call ended.",
      time: "11:54 am",
      isOnline: false,
      unread: 0
    },
    {
      id: 6,
      name: "Pressmaster.ai",
      avatar: "/placeholder-user.jpg",
      lastMessage: "AI-Agent for Agencies",
      time: "7:48 am",
      isOnline: false,
      unread: 0,
      isAd: true
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top">
        <Link
          href="/home"
          className="p-2 rounded-xl hover:bg-gray-800 transition-colors duration-200 touch-manipulation"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        
        <h1 className="text-2xl font-bold">messenger</h1>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-xl hover:bg-gray-800 transition-colors duration-200 touch-manipulation">
            <Edit className="w-6 h-6 text-white" />
          </button>
          <button className="p-2 rounded-xl hover:bg-gray-800 transition-colors duration-200 touch-manipulation relative">
            <Users className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">1</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
          <input
            type="text"
            placeholder="Ask Meta AI or search"
            className="w-full pl-12 pr-4 py-3 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stories Section */}
      <div className="px-4 mb-6">
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center min-w-[80px]">
              <div className="relative">
                {story.isCreate ? (
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-full overflow-hidden ${story.hasStory ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black' : ''}`}>
                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {story.isOnline && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-black"></div>
                )}
                {story.time && (
                  <div className="absolute bottom-0 right-0 bg-gray-800 text-xs px-1 rounded text-white">
                    {story.time}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-300 mt-1 text-center">{story.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 px-4">
        {chats.map((chat) => (
          <div key={chat.id} className="flex items-center py-3 hover:bg-gray-900 rounded-lg px-2 transition-colors duration-200">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              </div>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
              )}
              {chat.timeAgo && (
                <div className="absolute bottom-0 right-0 bg-gray-800 text-xs px-1 rounded text-white">
                  {chat.timeAgo}
                </div>
              )}
            </div>
            
            <div className="flex-1 ml-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{chat.name}</h3>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                {chat.isAd && (
                  <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 ml-2">Ad</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 safe-area-bottom">
        <div className="flex justify-around items-center py-2 pb-safe-bottom">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation relative ${
              activeTab === "chats" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Chats</span>
            {activeTab === "chats" && (
              <div className="absolute bottom-0 w-8 h-1 bg-blue-500 rounded-full"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("friends")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation ${
              activeTab === "friends" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Friends</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 touch-manipulation ${
              activeTab === "notifications" ? "text-blue-500" : "text-gray-400"
            }`}
          >
            <Bell className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Notifications</span>
          </button>
        </div>
      </div>
    </div>
  )
}