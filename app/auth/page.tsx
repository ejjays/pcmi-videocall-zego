"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Video, Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useLoadingAnimation } from "@/hooks/use-loading-animation"
import PageLoader from "@/components/ui/page-loader"

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth()
  const router = useRouter()
  const { animation } = useLoadingAnimation()

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Auth page - Auth state:", { user: !!user, loading })

    if (!loading && user) {
      console.log("User already authenticated, redirecting to home...")
      router.push("/home")
    }
  }, [user, loading, router])

  const handleInputChange = (field: string, value: string) => {
    console.log("Input change:", field, value)
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("") // Clear error when user types
    setSuccess("") // Clear success when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", { isLogin, formData })

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isLogin) {
        console.log("Attempting sign in...")
        await signIn(formData.email, formData.password)
        setSuccess("Sign in successful!")
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match")
          setIsLoading(false)
          return
        }
        console.log("Attempting sign up...")
        await signUp(formData.email, formData.password, formData.fullName)
        setSuccess("Account created successfully!")
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    console.log("Google sign in clicked")
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      await signInWithGoogle()
      setSuccess("Google sign in successful!")
    } catch (error: any) {
      console.error("Google sign in error:", error)
      setError(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAuthMode = () => {
    if (isTransitioning || isLoading) return

    console.log("Toggling auth mode from", isLogin ? "login" : "signup")
    setIsTransitioning(true)
    setError("")
    setSuccess("")

    setTimeout(() => {
      setIsLogin(!isLogin)
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
      })
    }, 150)

    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  // Show loading while checking auth state
  if (loading) {
    return <PageLoader animationData={animation} size="xl" />
  }

  // Don't show auth page if user is authenticated - show loading while redirecting
  if (user) {
    return <PageLoader animationData={animation} size="xl" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-60 h-60 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-gradient-to-br from-pink-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Professional Blurred Loading Overlay for form submission */}
      {isLoading && (
        <PageLoader animationData={animation} size="xl" overlay={true} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe-top relative z-10">
        <Link
          href="/"
          className="p-2 rounded-xl hover:bg-slate-700/50 active:bg-slate-600/50 transition-colors duration-200 touch-manipulation glass-effect"
        >
          <ArrowLeft className="w-6 h-6 text-slate-300" />
        </Link>
        <div className="text-sm text-slate-300">
          {isLogin ? "Just new here?" : "Already have an account?"}
          <button
            onClick={toggleAuthMode}
            disabled={isTransitioning || isLoading}
            className="ml-1 text-cyan-400 font-medium hover:text-cyan-300 transition-colors duration-200 disabled:opacity-50"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{isLogin ? "Welcome back" : "Create account"}</h1>
            <p className="text-slate-300">
              {isLogin ? "Sign in to continue to PCMI" : "Join PCMI for professional communication"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-sm text-center">{success}</p>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - Only for signup */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    required={!isLogin}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                  required
                  disabled={isLoading}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 z-10"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password - Only for signup */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all duration-200 text-white placeholder-slate-400 backdrop-blur-sm"
                    required={!isLogin}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-2xl transition-all duration-200 active:scale-95 touch-manipulation mt-6 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Forgot Password - Only for login */}
          {isLogin && (
            <div className="text-center mt-3">
              <button
                type="button"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-200"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-600/30"></div>
            <span className="px-4 text-sm text-slate-400">or</span>
            <div className="flex-1 border-t border-slate-600/30"></div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/30 hover:from-slate-700 hover:to-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation flex items-center justify-center backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Terms and Privacy - Only for signup */}
          {!isLogin && (
            <p className="text-xs text-slate-400 text-center mt-6 leading-relaxed">
              By creating an account, you agree to our{" "}
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                Terms of Service
              </button>{" "}
              and{" "}
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200">
                Privacy Policy
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}