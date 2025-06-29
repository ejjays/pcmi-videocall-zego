"use client"

import { useState, useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface ToastNotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
  type?: 'success' | 'error' | 'info'
  duration?: number
}

export default function ToastNotification({ 
  message, 
  isVisible, 
  onClose, 
  type = 'success',
  duration = 3000 
}: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-green-500'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      default:
        return 'bg-gradient-to-r from-emerald-500 to-green-500'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />
      case 'error':
        return <X className="w-5 h-5 text-white" />
      case 'info':
        return <CheckCircle className="w-5 h-5 text-white" />
      default:
        return <CheckCircle className="w-5 h-5 text-white" />
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <div 
        className={`
          ${getToastStyles()}
          mt-4 mx-4 px-4 py-3 rounded-2xl shadow-2xl
          flex items-center space-x-3 min-w-[280px] max-w-[90vw]
          animate-in slide-in-from-top-2 duration-300
          pointer-events-auto
          backdrop-blur-sm border border-white/10
        `}
        style={{
          paddingTop: `max(12px, env(safe-area-inset-top))`,
          marginTop: `max(16px, calc(env(safe-area-inset-top) + 16px))`
        }}
      >
        {getIcon()}
        <span className="text-white font-medium text-sm flex-1 text-center">
          {message}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </div>
  )
}