"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, ShieldCheck, Users, Search, Crown, UserCheck, UserX, Wifi, WifiOff, RefreshCw, Plus, FolderSync as Sync } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getAllUsers, makeUserAdmin, removeUserAdmin, checkNetworkStatus, syncFirebaseAuthUsers } from "@/lib/admin"
import { AdminUser } from "@/types/admin"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import ToastNotification from "@/components/ui/toast-notification"
import ProtectedRoute from "@/components/protected-route"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { animation } = useLoadingAnimation()
  
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  
  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: 'success' as 'success' | 'error' | 'info'
  })

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const online = checkNetworkStatus()
      setIsOnline(online)
    }

    updateNetworkStatus()
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  // Load users when component mounts
  useEffect(() => {
    loadUsers()
  }, [])

  // Filter users based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Loading all users...")
      
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      
      if (allUsers.length === 0) {
        if (isOnline) {
          showToast("🔥 No users found! Your Firebase Auth users need to be synced to Firestore. Click the SYNC button!", 'info')
        } else {
          showToast("No cached user data available", 'info')
        }
      } else {
        const legacyCount = allUsers.filter(u => u.isLegacyUser).length
        const newCount = allUsers.length - legacyCount
        
        if (legacyCount > 0) {
          showToast(`🎉 Loaded ${allUsers.length} users (${newCount} new, ${legacyCount} legacy)! 📊`, 'success')
        } else {
          showToast(`🎉 Loaded ${allUsers.length} users successfully! 📊`, 'success')
        }
      }
    } catch (error: any) {
      console.error("Error loading users:", error)
      showToast("Failed to load users. Try clicking the SYNC button!", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔥 NEW: Sync Firebase Auth users to Firestore
  const handleSyncUsers = async () => {
    if (!isOnline) {
      showToast("Cannot sync users while offline", 'error')
      return
    }

    setIsSyncing(true)
    
    try {
      console.log("🔄 Starting user sync...")
      showToast("🔄 Syncing Firebase Auth users to Firestore...", 'info')
      
      await syncFirebaseAuthUsers()
      
      // Wait a moment for sync to complete
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Reload users
      await loadUsers()
      
      showToast("🎉 User sync completed! All Firebase Auth users should now be visible! ✨", 'success')
    } catch (error: any) {
      console.error("Error syncing users:", error)
      showToast("❌ Failed to sync users. Check console for details.", 'error')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (userId === user?.uid) {
      showToast("You cannot change your own admin status", 'error')
      return
    }

    if (!isOnline) {
      showToast("Cannot modify admin status while offline", 'error')
      return
    }

    setIsUpdating(userId)
    
    try {
      if (currentAdminStatus) {
        await removeUserAdmin(userId)
        showToast("Admin privileges removed successfully! 🔓", 'success')
      } else {
        await makeUserAdmin(userId)
        showToast("User promoted to admin successfully! 👑", 'success')
      }
      
      // Reload users
      await loadUsers()
    } catch (error: any) {
      console.error("Error updating admin status:", error)
      showToast("Failed to update admin status", 'error')
    } finally {
      setIsUpdating(null)
    }
  }

  const adminUsers = filteredUsers.filter(u => u.isAdmin)
  const regularUsers = filteredUsers.filter(u => !u.isAdmin)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        {/* Toast Notification */}
        <ToastNotification
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
          type={toast.type}
          duration={4000}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-safe-top border-b border-slate-700/30">
          <button
            onClick={() => router.push("/home")}
            className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white mr-3">User Management</h1>
            {/* Network Status Indicator */}
            <div className={`p-1 rounded-full ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* 🔥 PROMINENT SYNC BUTTON */}
            <button
              onClick={handleSyncUsers}
              disabled={isSyncing || !isOnline}
              className="px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center"
              title="Sync Firebase Auth users to Firestore"
            >
              <Sync className={`w-4 h-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'SYNC'}
            </button>
            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Testing Mode Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-yellow-400 mr-2" />
              <div>
                <p className="text-yellow-400 font-medium text-sm">Testing Mode</p>
                <p className="text-yellow-300 text-xs">Admin restrictions temporarily disabled for testing purposes.</p>
              </div>
            </div>
          </div>

          {/* Network Status Banner */}
          {!isOnline && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <div className="flex items-center">
                <WifiOff className="w-5 h-5 text-orange-400 mr-2" />
                <div>
                  <p className="text-orange-400 font-medium text-sm">Offline Mode</p>
                  <p className="text-orange-300 text-xs">Showing cached data. Admin changes disabled.</p>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 SYNC INSTRUCTIONS BANNER */}
          {users.length === 0 && isOnline && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center">
                <Sync className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <p className="text-blue-400 font-medium text-sm mb-1">🔥 Firebase Auth Users Found!</p>
                  <p className="text-blue-300 text-xs leading-relaxed">
                    Your Firebase Authentication has users, but they need to be synced to Firestore to appear here. 
                    <strong className="text-blue-200"> Click the SYNC button above!</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 NEW: Legacy Users Info Banner */}
          {users.some(u => u.isLegacyUser) && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <div className="flex items-center">
                <Sync className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <p className="text-blue-400 font-medium text-sm">Legacy Users Detected</p>
                  <p className="text-blue-300 text-xs">Some users were created before Firestore integration. They've been automatically synced!</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                  <p className="text-slate-400 text-sm">Total Users</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center mr-3">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{adminUsers.length}</p>
                  <p className="text-slate-400 text-sm">Administrators</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Admin Access Info */}
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-cyan-400 mr-3 mt-0.5" />
              <div>
                <p className="text-cyan-400 font-medium text-sm mb-1">Admin Panel Access</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Direct URL: <code className="bg-slate-800/50 px-2 py-1 rounded text-cyan-300">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/admin/users
                  </code>
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  💡 If you don't see your old accounts, click the SYNC button above!
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-slate-400">Loading users...</span>
            </div>
          )}

          {/* No Users State */}
          {!isLoading && users.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
                {isOnline 
                  ? "🔥 Your Firebase Auth users need to be synced to Firestore! Click the SYNC button above to import all your existing users."
                  : "No cached user data available. Connect to the internet to load users."
                }
              </p>
              
              {isOnline && (
                <div className="space-y-3">
                  <button
                    onClick={handleSyncUsers}
                    disabled={isSyncing}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 active:scale-95 inline-flex items-center disabled:opacity-50 text-lg"
                  >
                    <Sync className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing Users...' : '🔥 SYNC ALL USERS NOW'}
                  </button>
                  <p className="text-slate-500 text-xs">
                    💡 This will import all your Firebase Authentication users to the admin panel
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Administrators Section */}
          {!isLoading && adminUsers.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Crown className="w-5 h-5 text-purple-400 mr-2" />
                <h2 className="text-lg font-bold text-white">Administrators ({adminUsers.length})</h2>
              </div>
              <div className="space-y-3">
                {adminUsers.map((adminUser) => (
                  <UserCard
                    key={adminUser.uid}
                    user={adminUser}
                    currentUserId={user?.uid}
                    isUpdating={isUpdating === adminUser.uid}
                    isOnline={isOnline}
                    onToggleAdmin={handleToggleAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Users Section */}
          {!isLoading && regularUsers.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-bold text-white">Users ({regularUsers.length})</h2>
              </div>
              <div className="space-y-3">
                {regularUsers.map((regularUser) => (
                  <UserCard
                    key={regularUser.uid}
                    user={regularUser}
                    currentUserId={user?.uid}
                    isUpdating={isUpdating === regularUser.uid}
                    isOnline={isOnline}
                    onToggleAdmin={handleToggleAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Search Results */}
          {!isLoading && users.length > 0 && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No users match your search</p>
              <p className="text-slate-500 text-sm">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

interface UserCardProps {
  user: AdminUser
  currentUserId?: string
  isUpdating: boolean
  isOnline: boolean
  onToggleAdmin: (userId: string, currentStatus: boolean) => void
}

function UserCard({ user, currentUserId, isUpdating, isOnline, onToggleAdmin }: UserCardProps) {
  const isCurrentUser = user.uid === currentUserId

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center mr-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="font-semibold text-white mr-2">
                {user.displayName || "Unknown User"}
              </h3>
              {user.isAdmin && (
                <Crown className="w-4 h-4 text-purple-400" />
              )}
              {isCurrentUser && (
                <span className="ml-2 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                  You
                </span>
              )}
              {/* 🔥 NEW: Legacy User Badge */}
              {user.isLegacyUser && (
                <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Legacy
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <p className="text-slate-500 text-xs">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleAdmin(user.uid, user.isAdmin)}
          disabled={isUpdating || isCurrentUser || !isOnline}
          className={`p-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            user.isAdmin
              ? "bg-red-600/20 hover:bg-red-600/30 text-red-400"
              : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-400"
          }`}
          title={!isOnline ? "Offline - Cannot modify admin status" : ""}
        >
          {isUpdating ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : user.isAdmin ? (
            <UserX className="w-5 h-5" />
          ) : (
            <UserCheck className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}