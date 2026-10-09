"use client"

import { useTranslation } from "react-i18next"
import { Quote } from "lucide-react"
import { useInView } from "./_hooks.js"
import { useSiteTheme } from "../../theme/ThemeProvider.jsx"

const COPY = {
  en: {
    eyebrow: "How we work",
    heading: "Quiet expertise.\nPublic outcomes.",
    intro:
      "Averra One was set up because most residency advisories optimise for case volume. We optimise for the file landing on the right desk, the first time, with the right narrative.",
    principles: [
      {
        n: "01",
        title: "Senior counsel from first call to ICA decision.",
        body: "You don't get passed down a junior ladder after the contract is signed. The partner who quoted you is the partner who files for you.",
      },
      {
        n: "02",
        title: "Honest scope, honest pricing.",
        body: "We write your fee on paper before we start. If your case turns out to need more, we tell you before we do it — not after.",
      },
      {
        n: "03",
        title: "Cases, not pipelines.",
        body: "We take a limited number of new mandates each quarter. If we accept your file, it means we believe you'll get a fair decision.",
      },
      {
        n: "04",
        title: "Discretion as default.",
        body: "Names, household details, and financial particulars stay between you and the partner on file. We don't publish testimonials.",
      },
    ],
    quote:
      "We'd rather write fewer letters and have each one land, than file two hundred and apologise for the ten that didn't.",
    quoteSource: "— Founding partner",
    stats: [
      { value: "95%", label: "First-time approval rate" },
      { value: "1,000+", label: "Filings prepared since 2009" },
      { value: "< 24 hrs", label: "Reply time on partner email" },
      { value: "4", label: "Working languages in-house" },
    ],
  },
  zh: {
    eyebrow: "我们的方式",
    heading: "安静的专业。\n公开的结果。",
    intro:
      "多数移民顾问追求案件数量。我们追求的，是让你的卷宗在第一次就落到正确的桌上，并附以正确的叙事。",
    principles: [
      {
        n: "01",
        title: "从首次咨询到 ICA 决定，由资深合伙人主理。",
        body: "签约后不会被转交给初级顾问。报价的合伙人，就是为你递交的合伙人。",
      },
      {
        n: "02",
        title: "诚实的范围与报价。",
        body: "白纸黑字写明费用。若案件需要追加工作，我们会先告知你，而不是事后追账。",
      },
      {
        n: "03",
        title: "我们做案件，不做流水线。",
        body: "每个季度只接有限数量的新案。一旦接下，意味着我们相信你能获得公正裁决。",
      },
      {
        n: "04",
        title: "保密为默认。",
        body: "姓名、家庭细节与财务资料仅限你与合伙人之间。我们不发表客户评价。",
      },
    ],
    quote:
      "我们宁愿少写信，但每一封都到位；也不愿一年递两百份，再为没批下来的那十份道歉。",
    quoteSource: "— 创始合伙人",
    stats: [
      { value: "95%", label: "首次申请批准率" },
      { value: "1,000+", label: "自 2009 年以来的案件" },
      { value: "< 24 小时", label: "合伙人邮件回复时间" },
      { value: "4 种", label: "内部工作语言" },
    ],
  },
}

const A1_COPY = {
  en: {
    intro:
      "A1 Immigration Consultancy was built because most residency advisories optimise for case volume. We optimise for your file landing on the right desk, the first time, with the right narrative.",
  },
  zh: {},
}

export default function AverraAbout() {
  const { i18n } = useTranslation()
  const theme = useSiteTheme()
  const lang = i18n.language?.startsWith("zh") ? "zh" : "en"
  const c =
    theme.id === "a1-consultancy" ? { ...COPY[lang], ...A1_COPY[lang] } : COPY[lang]
  const [headRef, headIn] = useInView()

  return (
    <section id="about" className="relative bg-gradient-to-b from-white via-brand-navy-50/40 to-white py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-brand-royal-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headRef}
          className={`mb-16 sm:mb-20 transition-all duration-1000 ${headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-brand-carbon-500 mb-5">
            {c.eyebrow}
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-carbon-900 leading-[1.05] whitespace-pre-line">
            {c.heading}
          </h2>
          <p className="mt-7 text-lg sm:text-xl text-brand-carbon-600 leading-relaxed max-w-2xl">
            {c.intro}
          </p>
        </div>

        {/* Numbered manifesto */}
        <ol className="space-y-12 sm:space-y-16">
          {c.principles.map((p, i) => (
            <Principle key={i} principle={p} delay={i * 80} />
          ))}
        </ol>

        {/* Pull-quote */}
        <PullQuote text={c.quote} source={c.quoteSource} />
      </div>

      {/* Full-bleed stats band */}
      <div className="relative mt-20 sm:mt-24 border-y border-brand-carbon-200/70 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-brand-carbon-200/70">
            {c.stats.map((s, i) => (
              <div key={i} className="py-8 px-6 text-center lg:text-left">
                <div className="text-3xl sm:text-4xl font-bold text-brand-carbon-900 tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-brand-carbon-500 mt-1.5 tracking-wide">
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

function Principle({ principle, delay }) {
  const [ref, inView] = useInView()
  return (
    <li
      ref={ref}
      className={`relative grid grid-cols-[3rem,1fr] sm:grid-cols-[6rem,1fr] gap-4 sm:gap-8 items-start transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-2xl sm:text-4xl font-extralight text-brand-carbon-300 tabular-nums leading-none pt-1">
        {principle.n}
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-carbon-900 leading-tight mb-3">
          {principle.title}
        </h3>
        <p className="text-base sm:text-lg text-brand-carbon-600 leading-relaxed max-w-2xl">
          {principle.body}
        </p>
      </div>
    </li>
  )
}

function PullQuote({ text, source }) {
  const [ref, inView] = useInView()
  return (
    <figure
      ref={ref}
      className={`relative mt-16 sm:mt-20 rounded-3xl bg-brand-carbon-900 text-white p-8 sm:p-12 overflow-hidden transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="absolute -top-12 -left-8 opacity-10">
        <Quote className="w-40 h-40 text-white" strokeWidth={1} />
      </div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-brand-royal-500/30 rounded-full blur-3xl" />
      <blockquote className="relative text-xl sm:text-2xl md:text-3xl font-serif italic leading-snug text-white/95 max-w-3xl">
        "{text}"
      </blockquote>
      <figcaption className="relative mt-6 text-sm text-white/60 tracking-wide">
        {source}
      </figcaption>
    </figure>
  )
}
