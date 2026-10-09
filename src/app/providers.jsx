"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import "@/i18n/config"
import LiveChatWidget from "@/components/LiveChatWidget"
import { ThemeProvider } from "@/theme/ThemeProvider.jsx"
import { AuthProvider } from "@/auth/AuthContext"
import { api } from "@/lib/api"

async function getGlobal() {}

// Validate the stored token by loading the applicant; clear it on failure.
async function doAuth() {
  try {
    return (await api.me()).data
  } catch {
    localStorage.removeItem("token")
    return null
  }
}

function AppLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-brand-navy-700" />
    </div>
  )
}

export default function Providers({ children }) {
  const [isInit, setIsInit] = useState(false)
  const [country, setCountry] = useState(null)
  const [applicant, setApplicant] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = localStorage.getItem("token")
      const tasks = [
        getGlobal(),
        fetch("https://api.country.is").then((res) => res.json()),
      ]
      // doAuth is pushed conditionally; remember its index so we can read it back.
      const authIndex = stored ? tasks.push(doAuth()) - 1 : -1
      const results = await Promise.all(tasks)
      if (cancelled) return
      setCountry(results[1].country)
      if (authIndex !== -1) setApplicant(results[authIndex])
      setIsInit(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!isInit) return <AppLoader />
  if (!country) return <AppLoader />
  if (country !== "MY" && country !== "SG" && country !== "JP") {
    return <AppLoader />
  }

  return (
    <AuthProvider initialApplicant={applicant}>
      <ThemeProvider>
        <LiveChatWidget />
        {children}
      </ThemeProvider>
    </AuthProvider>
  )
}
