"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { checkIsAdmin, listenToMeetingStatus, initializeOfflineSupport } from "@/lib/admin"
import { MeetingStatus } from "@/types/admin"

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize offline support once
    initializeOfflineSupport()
  }, [])

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    
    // Check admin status
    checkIsAdmin(user.uid)
      .then(adminStatus => {
        setIsAdmin(adminStatus)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Error checking admin status:', error)
        setError('Failed to check admin status')
        setIsLoading(false)
      })
  }, [user])

  return { isAdmin, isLoading, error }
}

export function useMeetingStatus() {
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    
    // Set up listener
    const unsubscribe = listenToMeetingStatus((status) => {
      setMeetingStatus(status)
      setIsLoading(false)
      setError(null)
    })

    // Timeout for better UX
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Meeting status listener timeout')
        setIsLoading(false)
      }
    }, 3000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return { meetingStatus, isLoading, error }
}