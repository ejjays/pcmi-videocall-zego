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

export interface ChatUser {
  userID: string
  userName: string
  avatar?: string
  isOnline?: boolean
}