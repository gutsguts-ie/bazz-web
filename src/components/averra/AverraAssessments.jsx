"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { ClipboardCheck, BarChart3, CalendarClock, FileText, Users, ArrowRight } from "lucide-react"
import { useInView } from "./_hooks.js"

const COPY = {
  en: {
    eyebrow: "Where to begin",
    heading: "Three minutes before fifteen months.",
    subheading:
      "Before you commission a full case, take the eligibility check. It returns an honest, conservative score and the gaps you'd need to close — not a generic congratulations.",
    steps: [
      {
        n: "01",
        title: "Answer 12 questions",
        body: "Profile, family, finances, intent. Anonymous. No email gate.",
        icon: ClipboardCheck,
      },
      {
        n: "02",
        title: "See your score",
        body: "ICA-weighted estimate with the three weakest signals flagged.",
        icon: BarChart3,
      },
      {
        n: "03",
        title: "Book a partner call",
        body: "If it looks promising, 30 minutes with the partner who'd file your case.",
        icon: CalendarClock,
      },
    ],
    forkLabel: "Pick your pathway",
    paths: [
      {
        icon: FileText,
        kind: "PR",
        title: "Permanent Residence",
        body: "For working professionals, founders, and global investors.",
        href: "/pr-assessment",
        timing: "~ 3 min",
      },
      {
        icon: Users,
        kind: "SC",
        title: "Citizenship",
        body: "For PRs ready to renounce another passport and commit.",
        href: "/citizenship-assessment",
        timing: "~ 3 min",
      },
    ],
  },
  zh: {
    eyebrow: "从这里开始",
    heading: "用 3 分钟，省下 15 个月。",
    subheading:
      "在委托完整案件之前，先做资格评估。我们给出诚实保守的分数，并指出你需要补足的环节——不是套话祝贺。",
    steps: [
      { n: "01", title: "回答 12 个问题", body: "履历、家庭、财务、意图。匿名填写，无需邮箱。", icon: ClipboardCheck },
      { n: "02", title: "查看你的分数", body: "依 ICA 评估口径估算，并标出 3 个最薄弱的信号。", icon: BarChart3 },
      { n: "03", title: "预约合伙人通话", body: "若评估乐观，与负责你案件的合伙人 30 分钟通话。", icon: CalendarClock },
    ],
    forkLabel: "选择申请路径",
    paths: [
      { icon: FileText, kind: "PR", title: "永久居民", body: "面向在职专业人士、创业者与全球投资人。", href: "/pr-assessment", timing: "约 3 分钟" },
      { icon: Users, kind: "SC", title: "新加坡公民", body: "面向已是 PR、准备放弃他国护照的申请人。", href: "/citizenship-assessment", timing: "约 3 分钟" },
    ],
  },
}

export default function AverraAssessments() {
  const { i18n } = useTranslation()
  const c = COPY[i18n.language?.startsWith("zh") ? "zh" : "en"]
  const [headRef, headIn] = useInView()

  return (
    <section id="assessments" className="relative bg-white py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[20rem] bg-gradient-to-b from-brand-navy-50 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-5">
            {c.eyebrow}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-carbon-900 leading-[1.05]">
            {c.heading}
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-brand-carbon-600 leading-relaxed">
            {c.subheading}
          </p>
        </div>

        {/* 3-step flow */}
        <div className="relative">
          {/* connector line - desktop */}
          <div className="hidden md:block absolute top-9 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-carbon-300 to-transparent" />
          <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {c.steps.map((s, i) => {
              const Icon = s.icon
              return (
                <StepCard key={i} step={s} Icon={Icon} delay={i * 100} />
              )
            })}
          </ol>
        </div>

        {/* Forked CTA */}
        <div className="mt-20 rounded-3xl border border-brand-carbon-200 bg-gradient-to-br from-white to-brand-silver-50 p-6 sm:p-8 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="h-px w-12 bg-brand-carbon-300" />
            <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500">
              {c.forkLabel}
            </span>
            <span className="h-px w-12 bg-brand-carbon-300" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {c.paths.map((p, i) => {
              const Icon = p.icon
              return (
                <Link
                  key={i}
                  href={p.href}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-brand-carbon-200 hover:border-brand-navy-400 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-navy-700 to-brand-royal-600 flex items-center justify-center shadow-md">
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold tracking-widest text-brand-navy-700 px-1.5 py-0.5 rounded bg-brand-navy-50">
                          {p.kind}
                        </span>
                        <span className="text-xs text-brand-carbon-500">{p.timing}</span>
                      </div>
                      <h3 className="text-xl font-bold text-brand-carbon-900 mb-1.5">{p.title}</h3>
                      <p className="text-sm text-brand-carbon-600 leading-relaxed">{p.body}</p>
                    </div>
                    <ArrowRight className="shrink-0 w-5 h-5 text-brand-carbon-400 group-hover:text-brand-navy-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, Icon, delay }) {
  const [ref, inView] = useInView()
  return (
    <li
      ref={ref}
      className={`relative transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="relative w-[72px] h-[72px] rounded-full bg-white border border-brand-carbon-200 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.15)] flex items-center justify-center">
          <Icon className="w-7 h-7 text-brand-navy-700" strokeWidth={1.75} />
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-brand-carbon-900 text-white text-xs font-bold tabular-nums">
            {step.n}
          </span>
        </div>
        <h3 className="mt-5 text-lg font-bold text-brand-carbon-900">{step.title}</h3>
        <p className="mt-2 text-sm text-brand-carbon-600 leading-relaxed max-w-[18rem]">
          {step.body}
        </p>
      </div>
    </li>
  )
}
