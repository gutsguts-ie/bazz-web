"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Button } from "./ui/button"
import { Menu, X } from "lucide-react"
import LanguageSwitcher from "./LanguageSwitcher"
import { useSiteTheme } from "../theme/ThemeProvider.jsx"
import { getHomeSkin } from "../theme/homeSkins.js"

export default function Navbar() {
  const theme = useSiteTheme()
  const skin = getHomeSkin(theme.id)
  const { navVariant } = theme.design
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 5)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { labelKey: "nav.home", href: "/" },
    { labelKey: "nav.services", href: "/services" },
    { labelKey: "nav.about", href: "/about" },
    { labelKey: "nav.faq", href: "/faq" },
    { labelKey: "nav.contact", href: "/contact" },
  ]

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navSurface}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center rounded-xl px-1.5 py-1 -ml-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy-600 focus-visible:ring-offset-2 group"
            >
              <img
                src={theme.logo}
                alt={theme.displayName}
                className={skin.navLogoClass}
                decoding="async"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.labelKey}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                  pathname === item.href
                    ? isScrolled
                      ? "text-brand-navy-700 bg-brand-navy-50"
                      : "text-brand-navy-700 bg-brand-navy-50/80"
                    : isScrolled
                      ? "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50"
                      : "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50/80"
                }`}
              >
                {t(item.labelKey)}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-navy-700 rounded-full"></span>
                )}
              </Link>
            ))}
            
            {/* Application — direct link */}
            <Link
              href="/my-application"
              className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
                pathname === "/my-application"
                  ? isScrolled
                    ? "text-brand-navy-700 bg-brand-navy-50"
                    : "text-brand-navy-700 bg-brand-navy-50/80"
                  : isScrolled
                    ? "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50"
                    : "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50/80"
              }`}
            >
              {t("nav.assessments")}
              {pathname === "/my-application" && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-navy-700 rounded-full"></span>
              )}
            </Link>

            <div className={`ml-4 pl-4 flex items-center space-x-3 ${
              isScrolled ? "border-l border-gray-200" : "border-l border-gray-200"
            }`}>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg transition-all duration-200 text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden pb-6 border-t border-gray-100 shadow-lg transition-all duration-300 ${
            isScrolled
              ? "bg-white/98 backdrop-blur-lg"
              : "bg-white/95 backdrop-blur-md"
          }`}>
            <div className="flex flex-col space-y-1 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-6 py-3 text-base font-semibold transition-all duration-200 ${
                    pathname === item.href
                      ? "text-brand-navy-700 bg-brand-navy-50 border-l-4 border-brand-navy-700"
                      : "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              
              {/* Application — direct link */}
              <Link
                href="/my-application"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-3 text-base font-semibold transition-all duration-200 ${
                  pathname === "/my-application"
                    ? "text-brand-navy-700 bg-brand-navy-50 border-l-4 border-brand-navy-700"
                    : "text-brand-carbon-700 hover:text-brand-navy-700 hover:bg-brand-silver-50"
                }`}
              >
                {t("nav.assessments")}
              </Link>

            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

