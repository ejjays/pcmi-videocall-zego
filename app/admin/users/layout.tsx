"use client"

import { useAuth } from "@/contexts/auth-context"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const { animation } = useLoadingAnimation()

  // Show loading while checking authentication
  if (authLoading) {
    return <PageLoader animationData={animation} size="xl" />
  }

  // If not authenticated, redirect will happen in ProtectedRoute
  if (!user) {
    return <PageLoader animationData={animation} size="xl" />
  }

  // Allow any authenticated user to access admin panel for testing
  return <>{children}</>
}