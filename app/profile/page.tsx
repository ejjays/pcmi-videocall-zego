"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, User, Mail, Phone, Lock, Shield, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { db, storage } from "@/lib/firebase" // Import storage
import { ref, uploadString, getDownloadURL } from "firebase/storage" // Import storage functions
import ProtectedRoute from "@/components/protected-route"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"
import ImageCropper from "@/components/ui/image-cropper"
import ToastNotification from "@/components/ui/toast-notification"

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { animation } = useLoadingAnimation()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editField, setEditField] = useState<'name' | 'email' | 'phone'>('name')
  const [profileImageData, setProfileImageData] = useState<string | null>(null)
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImageForCrop, setSelectedImageForCrop] = useState<string>("")
  
  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: 'success' as 'success' | 'error' | 'info'
  })
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      isVisible: true,
      message,
      type
    })
  }

  // Hide toast notification
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image file size must be less than 5MB", 'error')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file", 'error')
      return
    }

    setError("")

    try {
      // Create a data URL for cropping
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setSelectedImageForCrop(dataUrl)
        setShowImageCropper(true)
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      showToast(error.message || "Failed to load image", 'error')
    }
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!user) return

    setIsUpdating(true);
    setShowImageCropper(false);
  
    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      
      // Upload the image
      await uploadString(storageRef, croppedImage, 'data_url');
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // This is the key: update the photoURL in Firebase Auth
      await updateProfile(user, {
        photoURL: downloadURL,
      });
  
      // Also update Firestore to keep everything in sync
      if (db) {
        await updateDoc(doc(db, "users", user.uid), {
          photoURL: downloadURL,
          updatedAt: new Date().toISOString(),
        });
      }
  
      // Now, refresh the user state to get the updated photoURL
      await refreshUser();
  
      showToast("Profile picture updated successfully! 脂");
    } catch (error: any) {
      console.warn("Failed to update profile image:", error);
      showToast("Failed to update profile picture.", 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCropCancel = () => {
    console.log('Crop cancelled')
    setShowImageCropper(false)
    setSelectedImageForCrop("")
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setIsUpdating(true)
    setError("")

    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: formData.displayName
      })

      // Update Firestore if available
      if (db) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            displayName: formData.displayName,
            phone: formData.phone,
            updatedAt: new Date().toISOString()
          })
        } catch (error) {
          console.warn("Failed to update Firestore:", error)
        }
      }

      await refreshUser();

      const fieldName = editField === 'name' ? 'Name' : editField === 'phone' ? 'Phone number' : 'Profile'
      showToast(`${fieldName} updated successfully! 脂`)
      setShowEditModal(false)
    } catch (error: any) {
      showToast(error.message || "Failed to update profile", 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user || !user.email) return

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords don't match", 'error')
      return
    }

    if (formData.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", 'error')
      return
    }

    setIsUpdating(true)
    setError("")

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, formData.newPassword)

      showToast("Password updated successfully! 白")
      setShowPasswordModal(false)
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        showToast("Current password is incorrect", 'error')
      } else {
        showToast(error.message || "Failed to update password", 'error')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (field: 'name' | 'email' | 'phone') => {
    setEditField(field)
    setShowEditModal(true)
    setError("")
  }

  // Get the profile image to display
  const getProfileImage = () => {
    return user?.photoURL || null;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        {/* Toast Notification */}
        <ToastNotification
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
          type={toast.type}
          duration={3000}
        />

        {/* Professional Loading Overlay */}
        {(isLoading || isUpdating) && (
          <PageLoader animationData={animation} size="xl" overlay={true} />
        )}

        {/* Image Cropper Modal */}
        <ImageCropper
          imageSrc={selectedImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isOpen={showImageCropper}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-safe-top border-b border-slate-700/30">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors duration-200 touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Account Settings</h1>
          <div className="w-10" />
        </div>

        <div className="p-4 space-y-6">
          {/* Error Messages */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/30 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                  {getProfileImage() ? (
                    <img 
                      src={getProfileImage()!} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleProfilePictureClick}
                  disabled={isUpdating}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mt-4">
                {user?.displayName || "User"}
              </h2>
              <p className="text-slate-400 text-sm">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Settings Options */}
          <div className="space-y-3">
            {/* Full Name */}
            <button
              onClick={() => openEditModal('name')}
              className="w-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm transition-all duration-200 active:scale-98 hover:from-slate-700/50 hover:to-slate-600/50"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Full Name</h3>
                  <p className="text-slate-400 text-sm">{user?.displayName || "Not set"}</p>
                </div>
                <div className="text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Email Address */}
            <button
              onClick={() => openEditModal('email')}
              className="w-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm transition-all duration-200 active:scale-98 hover:from-slate-700/50 hover:to-slate-600/50"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Email Address</h3>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                </div>
                <div className="text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Phone Number */}
            <button
              onClick={() => openEditModal('phone')}
              className="w-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm transition-all duration-200 active:scale-98 hover:from-slate-700/50 hover:to-slate-600/50"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mr-4">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Phone Number</h3>
                  <p className="text-slate-400 text-sm">{formData.phone || "Not set"}</p>
                </div>
                <div className="text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Change Password */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm transition-all duration-200 active:scale-98 hover:from-slate-700/50 hover:to-slate-600/50"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center mr-4">
                  <Lock className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Change Password</h3>
                  <p className="text-slate-400 text-sm">Update your password</p>
                </div>
                <div className="text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Privacy */}
            <button className="w-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm transition-all duration-200 active:scale-98 hover:from-slate-700/50 hover:to-slate-600/50">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-600/20 rounded-xl flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Privacy</h3>
                  <p className="text-slate-400 text-sm">Privacy and data settings</p>
                </div>
                <div className="text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 shadow-xl transition-all duration-200 active:scale-98 hover:from-red-700 hover:to-red-800 mt-8"
          >
            <div className="flex items-center justify-center">
              <LogOut className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-semibold">Sign Out</span>
            </div>
          </button>

          {/* Version Info */}
          <div className="text-center pt-6 pb-8">
            <p className="text-slate-500 text-sm">Version 2.1.0</p>
            <p className="text-slate-500 text-xs mt-1">ﾂｩ 2024 PCMI</p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 backdrop-blur-sm w-full max-w-md rounded-2xl border border-slate-600/30">
              <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
                <h3 className="text-lg font-bold text-white">
                  Edit {editField === 'name' ? 'Full Name' : editField === 'email' ? 'Email' : 'Phone Number'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 space-y-4">
                {editField === 'name' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                {editField === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="text-xs text-slate-400 mt-2">Email cannot be changed for security reasons</p>
                  </div>
                )}

                {editField === 'phone' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={editField === 'email'}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl transition-all duration-200 active:scale-95 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/95 backdrop-blur-sm w-full max-w-md rounded-2xl border border-slate-600/30">
              <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl transition-all duration-200 active:scale-95 font-medium"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}