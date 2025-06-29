"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { checkIsAdmin, listenToMeetingStatus } from "@/lib/admin"
import { MeetingStatus } from "@/types/admin"

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      checkIsAdmin(user.uid).then(adminStatus => {
        setIsAdmin(adminStatus)
        setIsLoading(false)
      })
    } else {
      setIsAdmin(false)
      setIsLoading(false)
    }
  }, [user])

  return { isAdmin, isLoading }
}

export function useMeetingStatus() {
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = listenToMeetingStatus((status) => {
      setMeetingStatus(status)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  return { meetingStatus, isLoading }
}