"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { LogOut } from "lucide-react"
import { Button } from "./ui/button"
import LanguageSwitcher from "./LanguageSwitcher"
import { useAuth } from "../auth/AuthContext"
import { useSiteTheme } from "../theme/ThemeProvider.jsx"
import { getHomeSkin } from "../theme/homeSkins.js"

/**
 * Minimal chrome for the signed-in applicant panel: logo, "My Application",
 * and a Log out button. No public navigation — this is a user panel.
 * Shares the public Navbar's frosted, scroll-aware surface.
 */
export default function PanelLayout({ children }) {
  const { t } = useTranslation()
  const theme = useSiteTheme()
  const skin = getHomeSkin(theme.id)
  const { navVariant } = theme.design
  const router = useRouter()
  const { logout } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 5)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      router.push("/login")
    }
  }

  // Same surface logic as Navbar.jsx
  const navSurface =
    navVariant === "solid"
      ? isScrolled
        ? "bg-white shadow-md border-b border-gray-100"
        : "bg-white/95 backdrop-blur-md border-b border-brand-silver-200"
      : navVariant === "bordered"
        ? isScrolled
          ? "bg-white/98 backdrop-blur-lg shadow-md border-b-2 border-brand-navy-700"
          : "bg-transparent border-b border-transparent"
        : isScrolled
          ? "bg-white/98 backdrop-blur-lg shadow-md border-b border-gray-100"
          : "bg-transparent"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navSurface}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24 gap-4">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Link
                href="/"
                className="flex items-center flex-shrink-0 rounded-xl px-1.5 py-1 -ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy-600 focus-visible:ring-offset-2"
              >
                <img
                  src={theme.logo}
                  alt={theme.displayName}
                  className={skin.navLogoClass}
                  decoding="async"
                />
              </Link>
              <Link
                href="/"
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isScrolled
                    ? "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50"
                    : "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50/80"
                }`}
              >
                {t("nav.home")}
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <LanguageSwitcher />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1.5" />
                {t("auth.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}
