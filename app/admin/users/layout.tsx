"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const router = useRouter()
  const { animation } = useLoadingAnimation()

  useEffect(() => {
    // Only redirect if we're sure the user is not an admin
    if (!authLoading && !adminLoading && user && !isAdmin) {
      console.log("Non-admin user trying to access admin route, redirecting...")
      router.replace("/home")
    }
  }, [user, isAdmin, authLoading, adminLoading, router])

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading) {
    return <PageLoader animationData={animation} size="xl" />
  }

  // If not authenticated, redirect will happen in ProtectedRoute
  if (!user) {
    return <PageLoader animationData={animation} size="xl" />
  }

  // If not admin, show loading while redirecting
  if (!isAdmin) {
    return <PageLoader animationData={animation} size="xl" />
  }

  // User is authenticated and is admin, show the admin content
  return <>{children}</>
}