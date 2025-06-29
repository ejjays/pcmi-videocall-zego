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
    // Initialize offline support
    initializeOfflineSupport()
  }, [])

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      setError(null)
      
      checkIsAdmin(user.uid)
        .then(adminStatus => {
          setIsAdmin(adminStatus)
          // Cache the result
          localStorage.setItem(`admin_status_${user.uid}`, JSON.stringify(adminStatus))
        })
        .catch(error => {
          console.error('Error checking admin status:', error)
          setError('Failed to check admin status')
          
          // Try to use cached value
          const cached = localStorage.getItem(`admin_status_${user.uid}`)
          if (cached) {
            setIsAdmin(JSON.parse(cached))
          }
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsAdmin(false)
      setIsLoading(false)
      setError(null)
    }
  }, [user])

  return { isAdmin, isLoading, error }
}

export function useMeetingStatus() {
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    
    const unsubscribe = listenToMeetingStatus((status) => {
      setMeetingStatus(status)
      setIsLoading(false)
      setError(null)
    })

    // Set a timeout to handle cases where the listener doesn't respond
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Meeting status listener timeout, using cached data')
        const cached = localStorage.getItem('meeting_status')
        if (cached) {
          setMeetingStatus(JSON.parse(cached))
        }
        setIsLoading(false)
      }
    }, 5000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return { meetingStatus, isLoading, error }
}