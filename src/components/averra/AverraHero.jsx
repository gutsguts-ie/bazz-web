"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "../ui/button"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { useMouseParallax } from "./_hooks.js"
import { useSiteTheme } from "../../theme/ThemeProvider.jsx"

const COPY = {
  en: {
    kicker: "Singapore residency",
    titleA: "Secure permanent residency in",
    titleB: "Singapore.",
    titleC: "Trusted & transparent solutions",
    description:
      "Averra One advises a small number of families and founders each year on Permanent Residence and Citizenship. Senior counsel from first call to ICA decision — no anonymous pipelines, no template filings.",
    ctaPrimary: "Take the 3-minute eligibility check",
    ctaSecondary: "Speak with a partner",
    badge: "Direct partner access · no junior handoffs",
    credentials: [
      { value: "95%", label: "approval rate" },
      { value: "1,000+", label: "filings prepared" },
      { value: "15 yrs", label: "in private practice" },
      { value: "4", label: "languages in-house" },
    ],
  },
  zh: {
    kicker: "新加坡居留顾问",
    titleA: "新加坡居留",
    titleB: "稳健规划。",
    titleC: "值得信赖、公开透明的方案",
    description:
      "Averra One 每年只服务有限数量的家庭与创业者，专注于永久居民与公民申请。从首次咨询到 ICA 决定，全程由资深合伙人主理，绝不流水线、不套模板。",
    ctaPrimary: "3 分钟评估资格",
    ctaSecondary: "与合伙人直接对话",
    badge: "合伙人直接对接 · 案件不外包",
    credentials: [
      { value: "95%", label: "批准率" },
      { value: "1,000+", label: "成功案件" },
      { value: "15 年", label: "执业经验" },
      { value: "4 种", label: "团队语言" },
    ],
  },
}

const A1_COPY = {
  en: {
    kicker: "Singapore immigration consultancy",
    titleA: "Your trusted path to",
    titleB: "Singapore.",
    titleC: "Permanent residency, done right",
    description:
      "A1 Immigration Consultancy guides families and professionals through Permanent Residence and Citizenship — senior consultants from your first call to the ICA decision. No anonymous pipelines, no template filings.",
    ctaSecondary: "Speak with a consultant",
    badge: "Direct consultant access · no junior handoffs",
  },
  zh: {
    kicker: "新加坡移民顾问",
    titleA: "您通往新加坡的",
    titleB: "稳健之路。",
    titleC: "专业规划永久居留",
    description:
      "A1 移民顾问为家庭与专业人士提供永久居民与公民申请服务 —— 从首次咨询到 ICA 决定，全程由资深顾问主理，绝不流水线、不套模板。",
    ctaSecondary: "与顾问直接对话",
    badge: "顾问直接对接 · 案件不外包",
  },
}

export default function AverraHero() {
  const { i18n } = useTranslation()
  const theme = useSiteTheme()
  const isA1 = theme.id === "a1-consultancy"
  const lang = i18n.language?.startsWith("zh") ? "zh" : "en"
  const c = isA1 ? { ...COPY[lang], ...A1_COPY[lang] } : COPY[lang]
  const glows = isA1
    ? ["rgba(0,43,92,0.22)", "rgba(202,168,72,0.22)", "rgba(0,43,92,0.12)"]
    : ["rgba(56,84,153,0.18)", "rgba(180,128,232,0.18)", "rgba(255,180,140,0.16)"]
  const parallax = useMouseParallax(20)

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col bg-[#FAF8F4] overflow-hidden"
    >
      {/* Soft pastel blooms */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -left-32 w-[36rem] h-[36rem] rounded-full opacity-60 blur-[110px]"
          style={{
            background: `radial-gradient(circle, ${glows[0]} 0%, transparent 65%)`,
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[40rem] h-[40rem] rounded-full opacity-50 blur-[110px]"
          style={{
            background: `radial-gradient(circle, ${glows[1]} 0%, transparent 65%)`,
            transform: `translate3d(${-parallax.x}px, ${-parallax.y}px, 0)`,
          }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[42rem] h-[42rem] rounded-full opacity-50 blur-[110px]"
          style={{
            background: `radial-gradient(circle, ${glows[2]} 0%, transparent 65%)`,
            transform: `translate3d(${parallax.x * 0.5}px, ${-parallax.y * 0.5}px, 0)`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      <div className="relative z-10 flex-1 flex items-center w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-12 text-center">
          {/* Kicker */}
          <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-8">
            <span className={`w-8 h-px ${isA1 ? "bg-brand-gold-400" : "bg-brand-carbon-300"}`} />
            <span>{c.kicker}</span>
            <span className={`w-8 h-px ${isA1 ? "bg-brand-gold-400" : "bg-brand-carbon-300"}`} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold text-brand-carbon-900 leading-[1.02] tracking-tight">
            <span className="block">{c.titleA}</span>
            <span className="block mt-2">
              <span className="italic font-serif font-medium bg-clip-text text-transparent bg-gradient-to-r from-brand-navy-700 via-brand-royal-600 to-brand-navy-700">
                {c.titleB}
              </span>
            </span>
            <span className="block mt-3 text-2xl sm:text-3xl md:text-4xl text-brand-carbon-600 font-normal">
              {c.titleC}
            </span>
          </h1>

          <p className="mt-10 text-lg sm:text-xl text-brand-carbon-600 leading-relaxed max-w-2xl mx-auto">
            {c.description}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pr-assessment" className="group">
              <Button
                size="lg"
                className={`text-base sm:text-lg px-8 py-6 rounded-full text-white border-0 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] hover:shadow-[0_22px_50px_-12px_rgba(15,23,42,0.45)] transition-all duration-300 ${isA1 ? "bg-brand-navy-800 hover:bg-brand-navy-900" : "bg-brand-carbon-900 hover:bg-brand-carbon-800"}`}
              >
                {c.ctaPrimary}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg px-8 py-6 rounded-full bg-white/80 backdrop-blur-sm border border-brand-carbon-200 text-brand-carbon-900 hover:bg-white hover:border-brand-carbon-400 transition-all duration-300"
              >
                {c.ctaSecondary}
              </Button>
            </Link>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 text-sm text-brand-carbon-500">
            <ShieldCheck className={`w-4 h-4 ${isA1 ? "text-brand-gold-500" : "text-brand-navy-700"}`} />
            <span>{c.badge}</span>
          </div>
        </div>
      </div>

      {/* Full-bleed credentials strip at bottom */}
      <div className="relative z-10 border-t border-brand-carbon-200/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-brand-carbon-200/60">
            {c.credentials.map((s, i) => (
              <div
                key={i}
                className="py-6 sm:py-7 px-4 sm:px-6 flex flex-col items-center sm:items-start text-center sm:text-left"
              >
                <div className="text-3xl sm:text-4xl font-bold text-brand-carbon-900 tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-brand-carbon-500 mt-1 tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
