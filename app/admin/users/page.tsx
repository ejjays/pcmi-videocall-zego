"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, ShieldCheck, Users, Search, Crown, UserCheck, UserX } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { getAllUsers, makeUserAdmin, removeUserAdmin } from "@/lib/admin"
import { AdminUser } from "@/types/admin"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import ToastNotification from "@/components/ui/toast-notification"

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const router = useRouter()
  const { animation } = useLoadingAnimation()
  
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  
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

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push("/home")
    }
  }, [isAdmin, adminLoading, router])

  // Load users
  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

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
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error("Error loading users:", error)
      showToast("Failed to load users", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (userId === user?.uid) {
      showToast("You cannot change your own admin status", 'error')
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
    } catch (error) {
      console.error("Error updating admin status:", error)
      showToast("Failed to update admin status", 'error')
    } finally {
      setIsUpdating(null)
    }
  }

  if (adminLoading || isLoading) {
    return <PageLoader animationData={animation} size="xl" />
  }

  if (!isAdmin) {
    return null // Will redirect
  }

  const adminUsers = filteredUsers.filter(u => u.isAdmin)
  const regularUsers = filteredUsers.filter(u => !u.isAdmin)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
        type={toast.type}
        duration={3000}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top border-b border-slate-700/30">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">User Management</h1>
        <div className="w-10" />
      </div>

      <div className="p-4 space-y-6">
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

        {/* Administrators Section */}
        {adminUsers.length > 0 && (
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
                  onToggleAdmin={handleToggleAdmin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Users Section */}
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
                onToggleAdmin={handleToggleAdmin}
              />
            ))}
          </div>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface UserCardProps {
  user: AdminUser
  currentUserId?: string
  isUpdating: boolean
  onToggleAdmin: (userId: string, currentStatus: boolean) => void
}

function UserCard({ user, currentUserId, isUpdating, onToggleAdmin }: UserCardProps) {
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
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <p className="text-slate-500 text-xs">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleAdmin(user.uid, user.isAdmin)}
          disabled={isUpdating || isCurrentUser}
          className={`p-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            user.isAdmin
              ? "bg-red-600/20 hover:bg-red-600/30 text-red-400"
              : "bg-purple-600/20 hover:bg-purple-600/30 text-purple-400"
          }`}
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