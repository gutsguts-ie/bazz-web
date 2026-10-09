"use client"

import { useRef } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import {
  FileText,
  Users,
  Shield,
  DollarSign,
  Heart,
  GraduationCap,
  Award,
  Briefcase,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { useInView } from "./_hooks.js"

const COPY = {
  en: {
    eyebrow: "What we handle",
    heading: "Eight workstreams. One partner.",
    sub: "Most clients only need three or four of these. We scope to what you'll actually use — and write the price down up front.",
    featured: {
      tag: "Flagship engagement",
      title: "PR Application",
      body: "End-to-end Permanent Residence filing: profile narrative, document discipline, ICA submission, and follow-through until decision. Senior partner stays on the file throughout.",
      bullets: [
        "Profile diagnostic with three rewrite cycles",
        "Document checklist with translation handling",
        "Submission, tracking, and ICA correspondence",
      ],
      cta: "See full PR engagement",
    },
    indexLabel: "Other workstreams",
    sideCtaTitle: "Not sure which you need?",
    sideCtaBody: "Send a one-paragraph sketch of your situation. We'll reply within one business day with which workstreams apply.",
    sideCtaButton: "Send a sketch",
    learnMore: "Learn more",
    items: [
      { icon: Users, title: "Citizenship", body: "For PRs ready to commit. Renunciation logistics included." },
      { icon: Shield, title: "Strategic consultation", body: "One-off advisory when you need a second read, not a full mandate." },
      { icon: DollarSign, title: "Document & finance", body: "Bank statements, tax records, asset declarations — assembled cleanly." },
      { icon: Heart, title: "Charity & community", body: "Strengthen your community contribution narrative the honest way." },
      { icon: GraduationCap, title: "Family & education", body: "School placement, dependent passes, family-line coordination." },
      { icon: Award, title: "Ministerial appeals", body: "When a case has been declined and merits a second look." },
      { icon: Briefcase, title: "Administrative", body: "Renewals, re-entry permits, address updates — handled quietly." },
    ],
  },
  zh: {
    eyebrow: "我们的服务",
    heading: "八条业务线。一位合伙人。",
    sub: "多数客户只需要其中 3–4 项。我们按实际所需报价，提前白纸黑字写明费用。",
    featured: {
      tag: "核心业务",
      title: "永久居民申请",
      body: "永久居民申请全流程：履历叙事、文件梳理、ICA 递交、跟进至结果。合伙人全程主理，不交接、不外包。",
      bullets: [
        "履历诊断 + 三轮文案改写",
        "文件清单与翻译统一处理",
        "递交、跟进与 ICA 函件往来",
      ],
      cta: "查看完整 PR 服务说明",
    },
    indexLabel: "其他业务线",
    sideCtaTitle: "不确定需要哪一项？",
    sideCtaBody: "用一段话描述你的情况发给我们。我们将在一个工作日内回复，告诉你哪几条业务线适用。",
    sideCtaButton: "发送简述",
    learnMore: "了解更多",
    items: [
      { icon: Users, title: "公民申请", body: "面向准备承诺新加坡的 PR，含放弃他国国籍的流程协助。" },
      { icon: Shield, title: "策略咨询", body: "一次性顾问意见，无需全权委托即可获取第二意见。" },
      { icon: DollarSign, title: "文件与财务", body: "银行流水、税务记录、资产声明——一次性梳理清楚。" },
      { icon: Heart, title: "慈善与社区", body: "真实强化你在社区贡献方面的叙事，而非堆砌词藻。" },
      { icon: GraduationCap, title: "家庭与教育", body: "择校、家属准证、家庭线协调一并处理。" },
      { icon: Award, title: "部长上诉", body: "案件被拒、仍具复审价值时的二次申辩。" },
      { icon: Briefcase, title: "行政事务", body: "续签、重入许可、地址变更——安静办妥。" },
    ],
  },
}

export default function AverraServices() {
  const { i18n } = useTranslation()
  const c = COPY[i18n.language?.startsWith("zh") ? "zh" : "en"]
  const [headRef, headIn] = useInView()
  const scrollerRef = useRef(null)

  const scrollBy = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * 320, behavior: "smooth" })
  }

  return (
    <section id="services" className="relative bg-[#FAF8F4] py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[40rem] h-[40rem] bg-brand-royal-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[36rem] h-[36rem] bg-brand-navy-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headRef}
          className={`max-w-3xl mb-14 sm:mb-16 transition-all duration-1000 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-5">
            {c.eyebrow}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-carbon-900 leading-tight">
            {c.heading}
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-brand-carbon-600 leading-relaxed">{c.sub}</p>
        </div>

        {/* Featured + side CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-12">
          <article className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-carbon-900 via-brand-navy-800 to-brand-royal-700 text-white p-8 sm:p-10 lg:p-12 shadow-[0_30px_70px_-25px_rgba(15,23,42,0.4)]">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-12 w-72 h-72 bg-brand-royal-400/30 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-medium tracking-wider uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                {c.featured.tag}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-7">
                  <FileText className="w-10 h-10 text-white/80 mb-5" strokeWidth={1.5} />
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                    {c.featured.title}
                  </h3>
                  <p className="text-white/75 leading-relaxed text-base sm:text-lg max-w-md">
                    {c.featured.body}
                  </p>
                </div>
                <ul className="md:col-span-5 space-y-3 text-sm sm:text-base text-white/85">
                  {c.featured.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-white/15">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 text-white font-semibold hover:gap-3 transition-all"
                >
                  {c.featured.cta}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </article>

          <aside className="lg:col-span-4 rounded-3xl bg-white border border-brand-carbon-200 p-7 sm:p-8 flex flex-col justify-between shadow-[0_18px_48px_-24px_rgba(15,23,42,0.15)]">
            <div>
              <div className="text-xs font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-3">
                Triage
              </div>
              <h3 className="text-2xl font-bold text-brand-carbon-900 leading-snug mb-3">
                {c.sideCtaTitle}
              </h3>
              <p className="text-brand-carbon-600 leading-relaxed">{c.sideCtaBody}</p>
            </div>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-brand-carbon-900 text-white hover:bg-brand-carbon-800 transition-colors"
            >
              <span className="font-semibold">{c.sideCtaButton}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </aside>
        </div>

        {/* Horizontal snap-scroll of remaining services */}
        <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
          <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500">
            {c.indexLabel} · 02 — 08
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="w-10 h-10 rounded-full border border-brand-carbon-200 bg-white hover:border-brand-carbon-400 hover:bg-brand-silver-50 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-brand-carbon-700" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="w-10 h-10 rounded-full border border-brand-carbon-200 bg-white hover:border-brand-carbon-400 hover:bg-brand-silver-50 transition-colors flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 text-brand-carbon-700" />
            </button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {c.items.map((s, i) => {
            const Icon = s.icon
            const idx = i + 2
            return (
              <article
                key={i}
                className="snap-start shrink-0 w-[18rem] sm:w-[20rem] rounded-3xl bg-white border border-brand-carbon-200 p-7 hover:border-brand-carbon-400 hover:shadow-[0_22px_50px_-24px_rgba(15,23,42,0.2)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-silver-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-navy-700" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs text-brand-carbon-400 tabular-nums tracking-widest">
                    {String(idx).padStart(2, "0")} / 08
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brand-carbon-900 mb-2">{s.title}</h3>
                <p className="text-sm text-brand-carbon-600 leading-relaxed">{s.body}</p>
                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy-700 hover:gap-2 transition-all"
                >
                  {c.learnMore}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
