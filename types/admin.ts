export interface AdminUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  isAdmin: boolean
  createdAt: string
  lastActive?: string
  status?: string
  isLegacyUser?: boolean // 🔥 NEW: Flag for users created before Firestore integration
  legacyCreatedAt?: string // 🔥 NEW: When the legacy user was synced
}

export interface MeetingStatus {
  roomId: string
  isActive: boolean
  participantCount: number
  startedBy?: string
  startedAt?: string
  lastUpdated: string
}

export interface AdminStats {
  totalUsers: number
  totalAdmins: number
  activeMeetings: number
  totalMeetings: number
}