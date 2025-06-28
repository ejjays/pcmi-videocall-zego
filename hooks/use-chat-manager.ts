"use client"

import { useState, useEffect, useRef } from "react"
import { User } from "firebase/auth"
import { ChatConversation, ChatMessage } from "@/types/chat"

export function useChatManager(user: User | null) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize chat system
  useEffect(() => {
    if (user && !isInitialized) {
      initializeChat()
    }
  }, [user, isInitialized])

  const initializeChat = async () => {
    try {
      setIsLoading(true)
      
      // For now, we'll use demo data since ZIM SDK is not available
      // In a real implementation, you would initialize your chat service here
      console.log('Initializing chat for user:', user?.uid)
      
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsInitialized(true)
      await loadConversations()
      
    } catch (error) {
      console.error('Chat initialization error:', error)
      setError('Failed to initialize chat. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversations = async () => {
    try {
      // Demo conversations - replace with real API call
      const demoConversations: ChatConversation[] = [
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
          conversationName: "Jeremy Alloso",
          conversationType: 0,
          unreadMessageCount: 1,
          participants: [user?.uid || '', "demo_3"],
          avatar: "/placeholder-user.jpg",
          isOnline: true,
          lastMessage: {
            messageID: "msg_3",
            message: "Reacted ❤️ to your message",
            timestamp: Date.now() - 3600000,
            senderUserID: "demo_3",
            senderUserName: "Jeremy Alloso",
            type: 'text',
            conversationID: "demo_3"
          }
        },
        {
          conversationID: "demo_4",
          conversationName: "GTC Worship Team",
          conversationType: 1,
          unreadMessageCount: 5,
          participants: [user?.uid || '', "demo_4", "demo_5", "demo_6"],
          avatar: "/placeholder-user.jpg",
          isOnline: true,
          lastMessage: {
            messageID: "msg_4",
            message: "Qwncy deleted a message.",
            timestamp: Date.now() - 7200000,
            senderUserID: "demo_5",
            senderUserName: "Qwncy",
            type: 'text',
            conversationID: "demo_4"
          }
        },
        {
          conversationID: "demo_5",
          conversationName: "Matthew Angelo",
          conversationType: 0,
          unreadMessageCount: 0,
          participants: [user?.uid || '', "demo_5"],
          avatar: "/placeholder-user.jpg",
          isOnline: false,
          lastMessage: {
            messageID: "msg_5",
            message: "The audio call ended.",
            timestamp: Date.now() - 43200000,
            senderUserID: "system",
            senderUserName: "System",
            type: 'text',
            conversationID: "demo_5"
          }
        }
      ]
      
      setConversations(demoConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadMessages = async (conversationID: string) => {
    try {
      // Demo messages - replace with real API call
      const demoMessages: ChatMessage[] = [
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
          message: "That's wonderful to hear! How's your day going?",
          timestamp: Date.now() - 3400000,
          senderUserID: conversationID,
          senderUserName: conversations.find(c => c.conversationID === conversationID)?.conversationName || "Friend",
          type: 'text',
          conversationID
        }
      ]
      
      setMessages(demoMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (conversationID: string, message: string) => {
    try {
      // Create local message immediately for better UX
      const localMessage: ChatMessage = {
        messageID: `local_${Date.now()}`,
        message: message.trim(),
        timestamp: Date.now(),
        senderUserID: user?.uid || '',
        senderUserName: user?.displayName || 'You',
        type: 'text',
        conversationID
      }

      // Add to messages immediately
      setMessages(prev => [...prev, localMessage])
      
      // Update conversation last message
      updateConversationLastMessage(conversationID, localMessage)

      // In a real implementation, you would send the message to your chat service here
      console.log('Sending message:', message, 'to conversation:', conversationID)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Simulate a response from the other user (for demo purposes)
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          messageID: `response_${Date.now()}`,
          message: "Thanks for your message! 👍",
          timestamp: Date.now(),
          senderUserID: conversationID,
          senderUserName: conversations.find(c => c.conversationID === conversationID)?.conversationName || "Friend",
          type: 'text',
          conversationID
        }
        
        setMessages(prev => [...prev, responseMessage])
        updateConversationLastMessage(conversationID, responseMessage)
      }, 2000)

    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const updateConversationLastMessage = (conversationID: string, message: ChatMessage) => {
    setConversations(prev => prev.map(conv => 
      conv.conversationID === conversationID 
        ? { ...conv, lastMessage: message }
        : conv
    ))
  }

  return {
    conversations,
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages
  }
}