import "@/index.css"
import { activeThemeId, getTheme } from "@/theme/themes.js"
import Providers from "./providers"

const theme = getTheme(activeThemeId)

const NOINDEX = "noindex, nofollow"
const CRAWLERS = [
  "ccbot", "rogerbot", "applebot", "bingbot", "semrushbot", "duckduckbot",
  "twitterbot", "petalbot", "sogoubot", "dotbot", "facebookexternalhit",
  "360bot", "yandexbot", "slurp", "ahrefsbot", "linkedinbot", "bytespider",
  "blekkobot", "amazonbot", "baidubot", "ia_archiver", "msnbot",
  "pinterestbot", "sherlockbot", "mj12bot", "majesticbot", "facebot",
]

export const metadata = {
  title: theme.displayName,
  icons: { icon: theme.logo, apple: theme.logo },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  other: Object.fromEntries(CRAWLERS.map((bot) => [bot, NOINDEX])),
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

// Theme is applied server-side so `data-theme` and CSS variables are in the
// first paint (previously done by applyInitialDocumentTheme before mount).
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme={theme.id} style={theme.cssVars} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
