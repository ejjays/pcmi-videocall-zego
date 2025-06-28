"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Users, Bell, MessageCircle, Search, Plus, Heart, Phone, Send, Smile, Paperclip } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

// ZegoCloud ZIM SDK for messaging
let ZIM: any = null

interface Message {
  messageID: string
  message: string
  timestamp: number
  senderUserID: string
  senderUserName: string
  type: 'text' | 'image' | 'file'
  conversationID: string
}

interface Conversation {
  conversationID: string
  conversationName: string
  conversationType: number
  lastMessage?: Message
  unreadMessageCount: number
  participants: string[]
  avatar?: string
  isOnline?: boolean
}

export default function ChatAppPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("chats")
  const [isInitialized, setIsInitialized] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const zimRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { animation } = useLoadingAnimation()

  // Initialize ZegoCloud ZIM
  useEffect(() => {
    if (user && !isInitialized) {
      initializeZIM()
    }
  }, [user, isInitialized])

  const initializeZIM = async () => {
    try {
      setIsLoading(true)
      
      // Import ZIM SDK dynamically
      const { ZIM } = await import('@zegocloud/zego-uikit-prebuilt')
      
      const appId = Number.parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!

      if (!appId || !serverSecret) {
        throw new Error("ZegoCloud configuration missing")
      }

      // Create ZIM instance
      const zim = ZIM.create({
        appID: appId,
        appSign: serverSecret
      })

      zimRef.current = zim

      // Set up event listeners
      zim.on('connectionStateChanged', (state: any) => {
        console.log('ZIM connection state:', state)
      })

      zim.on('receiveMessage', (messageList: Message[], fromConversationID: string) => {
        console.log('Received messages:', messageList)
        setMessages(prev => [...prev, ...messageList])
        updateConversationLastMessage(fromConversationID, messageList[messageList.length - 1])
      })

      zim.on('conversationChanged', (conversationChangeInfoList: any[]) => {
        console.log('Conversations changed:', conversationChangeInfoList)
        loadConversations()
      })

      // Login to ZIM
      const userInfo = {
        userID: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User'
      }

      await zim.login(userInfo)
      console.log('ZIM login successful')

      setIsInitialized(true)
      await loadConversations()
      
    } catch (error) {
      console.error('ZIM initialization error:', error)
      setError('Failed to initialize chat. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      if (!zimRef.current) return

      const result = await zimRef.current.queryConversationList({
        count: 100,
        nextConversation: null
      })

      console.log('Loaded conversations:', result.conversationList)
      
      // Transform conversations with mock data for demo
      const transformedConversations: Conversation[] = result.conversationList.map((conv: any, index: number) => ({
        conversationID: conv.conversationID,
        conversationName: conv.conversationName || `Chat ${index + 1}`,
        conversationType: conv.conversationType,
        lastMessage: conv.lastMessage,
        unreadMessageCount: conv.unreadMessageCount || 0,
        participants: [user?.uid || '', conv.conversationID],
        avatar: "/placeholder-user.jpg",
        isOnline: Math.random() > 0.5
      }))

      // Add some demo conversations if none exist
      if (transformedConversations.length === 0) {
        const demoConversations: Conversation[] = [
          {
            conversationID: "demo_1",
            conversationName: "Manuelita Canoy Alloso",
            conversationType: 0,
            unreadMessageCount: 0,
            participants: [user?.uid || '', "demo_1"],
            avatar: "/placeholder-user.jpg",
            isOnline: false,
            lastMessage: {
              messageID: "msg_1",
              message: "Pwede ba dyan tumawa...",
              timestamp: Date.now() - 3600000,
              senderUserID: user?.uid || '',
              senderUserName: "You",
              type: 'text',
              conversationID: "demo_1"
            }
          },
          {
            conversationID: "demo_2",
            conversationName: "Paul Vincent Dalo",
            conversationType: 0,
            unreadMessageCount: 2,
            participants: [user?.uid || '', "demo_2"],
            avatar: "/placeholder-user.jpg",
            isOnline: true,
            lastMessage: {
              messageID: "msg_2",
              message: "Reacted ❤️ to your message",
              timestamp: Date.now() - 1800000,
              senderUserID: "demo_2",
              senderUserName: "Paul Vincent Dalo",
              type: 'text',
              conversationID: "demo_2"
            }
          },
          {
            conversationID: "demo_3",
            conversationName: "GTC Worship Team",
            conversationType: 1,
            unreadMessageCount: 5,
            participants: [user?.uid || '', "demo_3", "demo_4", "demo_5"],
            avatar: "/placeholder-user.jpg",
            isOnline: true,
            lastMessage: {
              messageID: "msg_3",
              message: "Qwncy deleted a message.",
              timestamp: Date.now() - 7200000,
              senderUserID: "demo_4",
              senderUserName: "Qwncy",
              type: 'text',
              conversationID: "demo_3"
            }
          }
        ]
        setConversations(demoConversations)
      } else {
        setConversations(transformedConversations)
      }

    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadMessages = async (conversationID: string) => {
    try {
      if (!zimRef.current) return

      const result = await zimRef.current.queryHistoryMessage({
        conversationID,
        conversationType: 0,
        count: 50,
        nextMessage: null
      })

      console.log('Loaded messages:', result.messageList)
      setMessages(result.messageList || [])
      
      // Add demo messages if none exist
      if (!result.messageList || result.messageList.length === 0) {
        const demoMessages: Message[] = [
          {
            messageID: "demo_msg_1",
            message: "Hello! How are you doing?",
            timestamp: Date.now() - 3600000,
            senderUserID: conversationID,
            senderUserName: conversations.find(c => c.conversationID === conversationID)?.conversationName || "Friend",
            type: 'text',
            conversationID
          },
          {
            messageID: "demo_msg_2",
            message: "I'm doing great! Thanks for asking 😊",
            timestamp: Date.now() - 3500000,
            senderUserID: user?.uid || '',
            senderUserName: "You",
            type: 'text',
            conversationID
          },
          {
            messageID: "demo_msg_3",
            message: "That's wonderful to hear!",
            timestamp: Date.now() - 3400000,
            senderUserID: conversationID,
            senderUserName: conversations.find(c => c.conversationID === conversationID)?.conversationName || "Friend",
            type: 'text',
            conversationID
          }
        ]
        setMessages(demoMessages)
      }

    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !zimRef.current) return

    try {
      const messageObj = {
        type: 1, // Text message
        message: newMessage.trim(),
        extendedData: ""
      }

      const result = await zimRef.current.sendMessage(messageObj, selectedConversation, 0)
      
      console.log('Message sent:', result)
      
      // Add message to local state immediately for better UX
      const localMessage: Message = {
        messageID: result.message.messageID || `local_${Date.now()}`,
        message: newMessage.trim(),
        timestamp: Date.now(),
        senderUserID: user?.uid || '',
        senderUserName: user?.displayName || 'You',
        type: 'text',
        conversationID: selectedConversation
      }

      setMessages(prev => [...prev, localMessage])
      setNewMessage("")
      
      // Update conversation last message
      updateConversationLastMessage(selectedConversation, localMessage)

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Still add to local state for demo purposes
      const localMessage: Message = {
        messageID: `local_${Date.now()}`,
        message: newMessage.trim(),
        timestamp: Date.now(),
        senderUserID: user?.uid || '',
        senderUserName: user?.displayName || 'You',
        type: 'text',
        conversationID: selectedConversation
      }

      setMessages(prev => [...prev, localMessage])
      setNewMessage("")
      updateConversationLastMessage(selectedConversation, localMessage)
    }
  }

  const updateConversationLastMessage = (conversationID: string, message: Message) => {
    setConversations(prev => prev.map(conv => 
      conv.conversationID === conversationID 
        ? { ...conv, lastMessage: message }
        : conv
    ))
  }

  const selectConversation = (conversationID: string) => {
    setSelectedConversation(conversationID)
    loadMessages(conversationID)
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup
  useEffect(() => {
    return () => {
      if (zimRef.current) {
        zimRef.current.logout()
        zimRef.current.destroy()
      }
    }
  }, [])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

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
          // Chat List View
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
                  onClick={() => selectConversation(conv.conversationID)}
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
                          (conv.lastMessage.senderUserID === user?.uid ? 'You: ' : '') + conv.lastMessage.message 
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
        ) : (
          // Chat View
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 pt-safe-top border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation mr-2"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={conversations.find(c => c.conversationID === selectedConversation)?.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    {conversations.find(c => c.conversationID === selectedConversation)?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-slate-900"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-white">
                      {conversations.find(c => c.conversationID === selectedConversation)?.conversationName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {conversations.find(c => c.conversationID === selectedConversation)?.isOnline ? 'Active now' : 'Last seen recently'}
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
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-700/50 transition-colors duration-200">
                    <Smile className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}