"use client"

import { useTranslation } from "react-i18next"
import { Phone, MapPin, Clock, Mail } from "lucide-react"
import ContactForm from "../ContactForm"
import { useSiteTheme } from "../../theme/ThemeProvider.jsx"
import { getThemeContact } from "../../theme/themeContact.js"
import { useInView } from "./_hooks.js"

const COPY = {
  en: {
    eyebrow: "Begin the conversation",
    heading: "Tell us your situation. We'll tell you honestly where you stand.",
    sub: "Most enquiries get a partner reply the same business day. We read every message — there is no junior screen.",
    promises: [
      { tag: "Same business day", body: "Partner reply, not auto-acknowledgement." },
      { tag: "Plain English", body: "No template-speak. No legalese unless it matters." },
      { tag: "Honest scope", body: "If it isn't worth filing, we'll say so." },
    ],
    hoursTitle: "Office hours",
    hoursValue: "Mon — Fri · 09:00 — 18:00 SGT",
    phoneLabel: "Direct line",
    addressLabel: "Office",
    emailLabel: "Email",
    emailValue: "advisory@averra.one",
    formNote: "Your details are read only by partners. They are never added to any marketing list.",
  },
  zh: {
    eyebrow: "开启对话",
    heading: "告诉我们你的情况。我们会直白告诉你目前的位置。",
    sub: "多数来信能在同一个工作日得到合伙人回复。每一封都由合伙人亲阅，无初级筛选。",
    promises: [
      { tag: "当日回复", body: "合伙人亲复，非系统回执。" },
      { tag: "白话表达", body: "不套话，不卖弄术语。" },
      { tag: "诚实判断", body: "若不值得递交，我们会直说。" },
    ],
    hoursTitle: "办公时间",
    hoursValue: "周一 — 周五 · 09:00 — 18:00 新加坡时间",
    phoneLabel: "专线",
    addressLabel: "办公室",
    emailLabel: "电邮",
    emailValue: "advisory@averra.one",
    formNote: "你的信息仅由合伙人查阅，永不进入任何营销名单。",
  },
}

const A1_COPY = {
  en: {
    sub: "Most enquiries get a consultant reply the same business day. We read every message — there is no junior screen.",
    promises: [
      { tag: "Same business day", body: "Consultant reply, not auto-acknowledgement." },
      { tag: "Plain English", body: "No template-speak. No legalese unless it matters." },
      { tag: "Honest scope", body: "If it isn't worth filing, we'll say so." },
    ],
    emailValue: "advisory@a1immigration.sg",
  },
  zh: {
    sub: "多数来信能在同一个工作日得到顾问回复。每一封都由顾问亲阅，无初级筛选。",
    promises: [
      { tag: "当日回复", body: "顾问亲复，非系统回执。" },
      { tag: "白话表达", body: "不套话，不卖弄术语。" },
      { tag: "诚实判断", body: "若不值得递交，我们会直说。" },
    ],
    emailValue: "advisory@a1immigration.sg",
  },
}

export default function AverraContact() {
  const { i18n } = useTranslation()
  const theme = useSiteTheme()
  const lang = i18n.language?.startsWith("zh") ? "zh" : "en"
  const c =
    theme.id === "a1-consultancy" ? { ...COPY[lang], ...A1_COPY[lang] } : COPY[lang]
  const { phone, addressLines } = getThemeContact(theme.id)
  const [headRef, headIn] = useInView()
  const [bodyRef, bodyIn] = useInView()

  return (
    <section id="contact" className="relative bg-[#FAF8F4] py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[36rem] h-[36rem] bg-brand-navy-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[36rem] h-[36rem] bg-brand-royal-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top strip: inline contact pills */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-12 text-sm text-brand-carbon-600">
          <a href={`tel:${phone}`} className="inline-flex items-center gap-2 hover:text-brand-navy-700 transition-colors">
            <Phone className="w-4 h-4 text-brand-navy-700" />
            <span className="tabular-nums">{phone}</span>
          </a>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-brand-carbon-300" />
          <a href={`mailto:${c.emailValue}`} className="inline-flex items-center gap-2 hover:text-brand-navy-700 transition-colors">
            <Mail className="w-4 h-4 text-brand-navy-700" />
            <span>{c.emailValue}</span>
          </a>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-brand-carbon-300" />
          <span className="inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-navy-700" />
            <span>{c.hoursValue}</span>
          </span>
        </div>

        {/* Heading */}
        <div
          ref={headRef}
          className={`text-center mb-12 transition-all duration-1000 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-5">
            {c.eyebrow}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-carbon-900 leading-[1.05]">
            {c.heading}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-brand-carbon-600 leading-relaxed max-w-2xl mx-auto">
            {c.sub}
          </p>
        </div>

        {/* Promises row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-12">
          {c.promises.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-brand-carbon-200 px-5 py-4 text-center sm:text-left"
            >
              <div className="text-xs font-bold tracking-[0.15em] uppercase text-brand-navy-700 mb-1.5">
                {p.tag}
              </div>
              <div className="text-sm text-brand-carbon-600 leading-snug">{p.body}</div>
            </div>
          ))}
        </div>

        {/* Centered form */}
        <div
          ref={bodyRef}
          className={`relative transition-all duration-1000 ${bodyIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand-navy-100/60 via-white to-brand-royal-100/60 blur-2xl opacity-70" />
          <div className="relative rounded-3xl bg-white border border-brand-carbon-200 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)] overflow-hidden">
            <ContactForm />
          </div>
          <p className="mt-4 text-center text-xs text-brand-carbon-500">{c.formNote}</p>
        </div>

        {/* Bottom strip: address card */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-4 sm:gap-6 items-center justify-center rounded-3xl bg-white/70 backdrop-blur-sm border border-brand-carbon-200 px-6 py-5 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-silver-100 flex items-center justify-center mx-auto sm:mx-0">
            <MapPin className="w-5 h-5 text-brand-navy-700" />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-brand-carbon-500 mb-1">
              {c.addressLabel}
            </div>
            <div className="text-sm sm:text-base text-brand-carbon-800 leading-relaxed">
              {addressLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
