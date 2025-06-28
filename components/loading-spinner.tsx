import LottieLoader from "@/components/lottie-loader"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { width: 60, height: 60 },
    md: { width: 120, height: 120 },
    lg: { width: 180, height: 180 },
  }

  const { width, height } = sizeMap[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LottieLoader width={width} height={height} />
    </div>
  )
}
