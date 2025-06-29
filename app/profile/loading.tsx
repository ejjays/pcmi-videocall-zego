"use client"

import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function ProfileLoading() {
  const { animation } = useLoadingAnimation()
  
  return <PageLoader animationData={animation} size="xl" />
}