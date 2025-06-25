import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientWrapper from "@/components/client-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PCMI - Professional Communication Made Intuitive",
  description: "Modern video calling application with beautiful dark theme and professional features",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#06b6d4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PCMI",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="overscroll-none">
        <ClientWrapper>
          <div className="min-h-screen bg-gradient-dark">{children}</div>
        </ClientWrapper>
      </body>
    </html>
  )
}
