import { ZIM } from '@zegocloud/zego-zim-web'

export interface ChatMessage {
  messageID: string
  message: string
  timestamp: number
  senderUserID: string
  senderUserName: string
  type: 'text' | 'image' | 'file'
  conversationID: string
}

export interface ChatConversation {
  conversationID: string
  conversationName: string
  conversationType: number
  lastMessage?: ChatMessage
  unreadMessageCount: number
  participants: string[]
  avatar?: string
  isOnline?: boolean
}

export class ZIMChatManager {
  private zim: any = null
  private isInitialized = false
  private eventListeners: { [key: string]: Function[] } = {}

  constructor() {
    this.eventListeners = {
      messageReceived: [],
      conversationChanged: [],
      connectionStateChanged: []
    }
  }

  async initialize(appId: number, userID: string, userName: string) {
    try {
      // Create ZIM instance
      this.zim = ZIM.create({
        appID: appId,
        appSign: process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!
      })

      // Set up event listeners
      this.zim.on('receiveMessage', (messageList: any[], fromConversationID: string) => {
        const messages: ChatMessage[] = messageList.map(msg => ({
          messageID: msg.messageID,
          message: msg.message,
          timestamp: msg.timestamp,
          senderUserID: msg.senderUserID,
          senderUserName: msg.senderUserName,
          type: 'text',
          conversationID: fromConversationID
        }))
        
        this.emit('messageReceived', messages, fromConversationID)
      })

      this.zim.on('conversationChanged', (conversationChangeInfoList: any[]) => {
        this.emit('conversationChanged', conversationChangeInfoList)
      })

      this.zim.on('connectionStateChanged', (state: any) => {
        this.emit('connectionStateChanged', state)
      })

      // Login
      const userInfo = { userID, userName }
      await this.zim.login(userInfo)
      
      this.isInitialized = true
      console.log('ZIM Chat Manager initialized successfully')
      
      return true
    } catch (error) {
      console.error('ZIM initialization error:', error)
      throw error
    }
  }

  async getConversations(): Promise<ChatConversation[]> {
    if (!this.zim || !this.isInitialized) {
      throw new Error('ZIM not initialized')
    }

    try {
      const result = await this.zim.queryConversationList({
        count: 100,
        nextConversation: null
      })

      return result.conversationList.map((conv: any) => ({
        conversationID: conv.conversationID,
        conversationName: conv.conversationName,
        conversationType: conv.conversationType,
        lastMessage: conv.lastMessage ? {
          messageID: conv.lastMessage.messageID,
          message: conv.lastMessage.message,
          timestamp: conv.lastMessage.timestamp,
          senderUserID: conv.lastMessage.senderUserID,
          senderUserName: conv.lastMessage.senderUserName,
          type: 'text',
          conversationID: conv.conversationID
        } : undefined,
        unreadMessageCount: conv.unreadMessageCount || 0,
        participants: [conv.conversationID],
        avatar: "/placeholder-user.jpg",
        isOnline: Math.random() > 0.5
      }))
    } catch (error) {
      console.error('Error getting conversations:', error)
      return []
    }
  }

  async getMessages(conversationID: string): Promise<ChatMessage[]> {
    if (!this.zim || !this.isInitialized) {
      throw new Error('ZIM not initialized')
    }

    try {
      const result = await this.zim.queryHistoryMessage({
        conversationID,
        conversationType: 0,
        count: 50,
        nextMessage: null
      })

      return (result.messageList || []).map((msg: any) => ({
        messageID: msg.messageID,
        message: msg.message,
        timestamp: msg.timestamp,
        senderUserID: msg.senderUserID,
        senderUserName: msg.senderUserName,
        type: 'text',
        conversationID
      }))
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  }

  async sendMessage(conversationID: string, message: string): Promise<ChatMessage> {
    if (!this.zim || !this.isInitialized) {
      throw new Error('ZIM not initialized')
    }

    try {
      const messageObj = {
        type: 1, // Text message
        message: message.trim(),
        extendedData: ""
      }

      const result = await this.zim.sendMessage(messageObj, conversationID, 0)
      
      return {
        messageID: result.message.messageID,
        message: message.trim(),
        timestamp: Date.now(),
        senderUserID: result.message.senderUserID,
        senderUserName: result.message.senderUserName,
        type: 'text',
        conversationID
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  private emit(event: string, ...args: any[]) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(...args))
    }
  }

  async destroy() {
    if (this.zim && this.isInitialized) {
      try {
        await this.zim.logout()
        this.zim.destroy()
        this.isInitialized = false
        console.log('ZIM Chat Manager destroyed')
      } catch (error) {
        console.error('Error destroying ZIM:', error)
      }
    }
  }
}

export const zimChatManager = new ZIMChatManager()