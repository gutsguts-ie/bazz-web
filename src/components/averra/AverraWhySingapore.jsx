"use client"

import { useTranslation } from "react-i18next"
import {
  TrendingUp,
  GraduationCap,
  Shield,
  MapPin,
  Building2,
  Users,
  ArrowRight,
} from "lucide-react"
import { useInView } from "./_hooks.js"

const COPY = {
  en: {
    eyebrow: "Why our clients chose Singapore",
    heading: "A small island, weighed and chosen.",
    sub: "These aren't tourism brochure reasons. They're the questions our clients actually asked us before they moved their household here.",
    facts: [
      {
        icon: TrendingUp,
        stat: "AAA",
        title: "Sovereign credit",
        body: "Rated AAA by all three major agencies. Currency, central bank, and budget discipline that age well.",
        span: "lg:col-span-2",
      },
      {
        icon: GraduationCap,
        stat: "Top 5",
        title: "Schools children actually attend",
        body: "International schools and local schools that send students to top universities — without the boarding-school detour.",
        span: "",
      },
      {
        icon: Shield,
        stat: "#1",
        title: "Safe to walk at night",
        body: "Safe Cities Index, year after year. The kind of place a teenager can take the MRT home alone.",
        span: "",
      },
      {
        icon: Building2,
        stat: "17%",
        title: "Personal income tax · top marginal",
        body: "No tax on most overseas income, no capital gains tax, no estate duty. Filing is one short online form.",
        span: "lg:col-span-2",
      },
      {
        icon: MapPin,
        stat: "192",
        title: "Visa-free destinations",
        body: "Singapore passport is consistently ranked the world's strongest. Useful when family is spread across timezones.",
        span: "",
      },
      {
        icon: Users,
        stat: "4",
        title: "Languages, on every signpost",
        body: "English, Mandarin, Malay, Tamil. A bilingual household feels at home from day one.",
        span: "",
      },
    ],
    imagery: [
      { src: "/images/marina-bay-sands.jpeg", label: "Marina Bay", caption: "Where most of our partner meetings happen" },
      { src: "/images/garden-by-the-bay.jpeg", label: "Gardens by the Bay", caption: "The city is engineered around its parks" },
      { src: "/images/singapore-business.jpeg", label: "CBD", caption: "Twelve minutes from anywhere by train" },
      { src: "/images/singapore-culture.jpeg", label: "Heritage districts", caption: "Where the household actually lives" },
    ],
    cta: {
      kicker: "Ready to move?",
      title: "Let's see if your case stands up.",
      body: "Most enquiries that come through this page get a partner reply the same business day. Send us a paragraph; we'll tell you honestly where you stand.",
      button: "Send an enquiry",
    },
  },
  zh: {
    eyebrow: "我们的客户为什么选择新加坡",
    heading: "一座小岛，被慎重权衡，最终选择。",
    sub: "这些不是旅游宣传册上的理由，而是我们客户在搬家前真正问过的问题。",
    facts: [
      { icon: TrendingUp, stat: "AAA", title: "主权信用评级", body: "三大评级机构一致给出 AAA。币值、央行与财政纪律经得起时间检验。", span: "lg:col-span-2" },
      { icon: GraduationCap, stat: "全球前 5", title: "孩子真能就读的学校", body: "国际学校与本地学校都能直送世界顶级大学，无需绕道寄宿。", span: "" },
      { icon: Shield, stat: "全球第 1", title: "夜晚可独行的城市", body: "Safe Cities Index 常年居首。十几岁的孩子可以独自坐地铁回家。", span: "" },
      { icon: Building2, stat: "17%", title: "个人所得税最高税档", body: "海外收入多免税，无资本利得税，无遗产税。年度申报一张在线表。", span: "lg:col-span-2" },
      { icon: MapPin, stat: "192 国", title: "免签国家数", body: "新加坡护照常年全球最强。家人分散在不同时区时尤为有用。", span: "" },
      { icon: Users, stat: "4 种", title: "每个路牌都有的语言", body: "英、华、马来、淡米尔。双语家庭从第一天就毫不陌生。", span: "" },
    ],
    imagery: [
      { src: "/images/marina-bay-sands.jpeg", label: "滨海湾", caption: "我们大部分合伙人会议在此" },
      { src: "/images/garden-by-the-bay.jpeg", label: "滨海湾花园", caption: "整座城市围绕公园而建" },
      { src: "/images/singapore-business.jpeg", label: "金融区", caption: "地铁 12 分钟到达任何地方" },
      { src: "/images/singapore-culture.jpeg", label: "历史街区", caption: "真正的家庭居所就在这里" },
    ],
    cta: {
      kicker: "准备好移居？",
      title: "让我们看看你的案件是否成立。",
      body: "从这页提交的咨询，多数都能在同一工作日得到合伙人回复。发送一段简介，我们会直白告诉你目前的位置。",
      button: "发送咨询",
    },
  },
}

export default function AverraWhySingapore() {
  const { i18n } = useTranslation()
  const c = COPY[i18n.language?.startsWith("zh") ? "zh" : "en"]
  const [headRef, headIn] = useInView()

  return (
    <section
      id="why-singapore"
      className="relative bg-white py-24 sm:py-32 overflow-hidden"
    >
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

        {/* Editorial mosaic: stat cards with varied widths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 sm:mb-20">
          {c.facts.map((f, i) => (
            <FactCard key={i} fact={f} delay={i * 80} />
          ))}
        </div>

        {/* Imagery strip with captions */}
        <div className="mb-16 sm:mb-20">
          <div className="text-xs font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-5">
            On the ground
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {c.imagery.map((im, i) => (
              <figure key={i} className="group">
                <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden">
                  <img
                    src={im.src}
                    alt={im.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <p className="text-white font-bold text-sm">{im.label}</p>
                  </div>
                </div>
                <figcaption className="mt-3 text-xs sm:text-sm text-brand-carbon-500 leading-snug">
                  {im.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* CTA strip */}
        <div className="relative overflow-hidden rounded-3xl border border-brand-carbon-200 bg-gradient-to-br from-brand-silver-50 via-white to-brand-navy-50 px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="text-xs font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-4">
                {c.cta.kicker}
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-carbon-900 leading-tight mb-4">
                {c.cta.title}
              </h3>
              <p className="text-base sm:text-lg text-brand-carbon-600 leading-relaxed max-w-2xl">
                {c.cta.body}
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <a
                href="/contact"
                className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-brand-carbon-900 text-white font-semibold hover:bg-brand-carbon-800 transition-all duration-300 shadow-[0_18px_40px_-12px_rgba(15,23,42,0.4)] hover:shadow-[0_22px_50px_-12px_rgba(15,23,42,0.5)]"
              >
                {c.cta.button}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FactCard({ fact, delay }) {
  const [ref, inView] = useInView()
  const Icon = fact.icon
  return (
    <article
      ref={ref}
      className={`group relative rounded-3xl bg-white border border-brand-carbon-200 p-6 sm:p-7 hover:border-brand-carbon-400 hover:shadow-[0_22px_50px_-24px_rgba(15,23,42,0.18)] hover:-translate-y-1 transition-all duration-500 ${fact.span} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl bg-brand-silver-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-navy-700" strokeWidth={1.75} />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-brand-carbon-900 tabular-nums">
          {fact.stat}
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-brand-carbon-900 mb-2 leading-snug">
        {fact.title}
      </h3>
      <p className="text-sm text-brand-carbon-600 leading-relaxed">{fact.body}</p>
    </article>
  )
}
