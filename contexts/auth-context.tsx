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

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
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
      (user) => {
        console.log("Auth state changed:", user ? `User: ${user.email}` : "No user")
        setUser(user)
        setLoading(false)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setLoading(false)
      },
    )

    // Fallback timeout
    const timeout = setTimeout(() => {
      console.warn("Auth loading timeout - forcing loading to false")
      setLoading(false)
    }, 3000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Signing in user:", email)
    const result = await signInWithEmailAndPassword(auth, email, password)
    console.log("Sign in successful:", result.user.uid)
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Creating user account:", email)
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    console.log("Updating user profile...")
    await updateProfile(user, { displayName: fullName })

    // Try to create Firestore document if available
    if (db) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          createdAt: new Date().toISOString(),
          status: "online",
        })
        console.log("User document created in Firestore")
      } catch (error) {
        console.warn("Failed to create Firestore document:", error)
      }
    }

    console.log("Sign up successful:", user.uid)
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Starting Google sign in...")
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)

    // Try to create/update Firestore document if available
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            status: "online",
          })
          console.log("Google user document created in Firestore")
        }
      } catch (error) {
        console.warn("Failed to create/check Firestore document:", error)
      }
    }

    console.log("Google sign in successful:", user.uid)
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase auth not initialized")

    console.log("Signing out user")
    await signOut(auth)
    console.log("Sign out successful")
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
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
