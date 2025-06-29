"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { syncFirebaseAuthUsers } from "@/lib/admin"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener")

    if (!auth) {
      console.error("Firebase auth not initialized")
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log("Auth state changed:", user ? `User: ${user.email}` : "No user")
        
        // Set user immediately without waiting for Firestore operations
        setUser(user)
        setLoading(false)
        
        // Handle Firestore operations in background (non-blocking)
        if (user) {
          ensureUserDocument(user).catch(error => {
            console.warn("Background user document creation failed:", error)
          })
          
          // 🔥 NEW: Sync Firebase Auth users to ensure all users are visible in admin panel
          syncFirebaseAuthUsers().catch(error => {
            console.warn("Background user sync failed:", error)
          })
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        setLoading(false)
      },
    )

    // Shorter fallback timeout
    const timeout = setTimeout(() => {
      console.warn("Auth loading timeout - forcing loading to false")
      setLoading(false)
    }, 2000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // Ensure user document exists in Firestore (non-blocking background operation)
  const ensureUserDocument = async (user: User) => {
    if (!db) {
      console.warn("Firestore not available, skipping user document creation")
      return
    }

    try {
      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        console.log("Creating user document for:", user.email)
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split("@")[0] || "User",
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          status: "online",
          isAdmin: false, // Default to non-admin
        })
        console.log("✅ User document created successfully")
      } else {
        // Update last active time
        await setDoc(userDocRef, {
          lastActive: new Date().toISOString(),
          status: "online",
          photoURL: user.photoURL,
        }, { merge: true })
        console.log("✅ User last active time updated")
      }
    } catch (error) {
      console.warn("Failed to ensure user document:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Signing in user:", email)
    const result = await signInWithEmailAndPassword(auth, email, password)
    console.log("Sign in successful:", result.user.uid)
    
    // Don't wait for Firestore operations - they happen in background
    ensureUserDocument(result.user).catch(console.warn)
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Creating user account:", email)
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    console.log("Updating user profile...")
    await updateProfile(user, { displayName: fullName })

    // Create Firestore document in background (non-blocking)
    if (db) {
      setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: fullName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        status: "online",
        isAdmin: false, // Default to non-admin
      }).then(() => {
        console.log("✅ User document created in Firestore")
      }).catch(error => {
        console.warn("Failed to create Firestore document:", error)
      })
    }

    console.log("Sign up successful:", user.uid)
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Starting Google sign in...")
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)

    // Don't wait for Firestore operations - they happen in background
    ensureUserDocument(user).catch(console.warn)

    console.log("Google sign in successful:", user.uid)
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    // Update user status to offline before signing out (background operation)
    if (user && db) {
      setDoc(doc(db, "users", user.uid), {
        status: "offline",
        lastActive: new Date().toISOString()
      }, { merge: true }).catch(error => {
        console.warn("Failed to update user status on logout:", error)
      })
    }

    console.log("Signing out user")
    await signOut(auth)
    console.log("Sign out successful")
  }

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const refreshedUser = auth.currentUser;
      setUser(refreshedUser);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}