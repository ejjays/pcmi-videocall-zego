"use client"

import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function ChatLoading() {
  const { animation } = useLoadingAnimation()
  
  return <PageLoader animationData={animation} size="xl" />
}