"use client"

import Hero from "../components/Hero"
import Services from "../components/Services"
import Assessments from "../components/Assessments"
import About from "../components/About"
import WhySingapore from "../components/Testimonials"
import Contact from "../components/Contact"
import AverraHero from "../components/averra/AverraHero"
import AverraServices from "../components/averra/AverraServices"
import AverraAssessments from "../components/averra/AverraAssessments"
import AverraAbout from "../components/averra/AverraAbout"
import AverraWhySingapore from "../components/averra/AverraWhySingapore"
import AverraContact from "../components/averra/AverraContact"
import { useSiteTheme } from "../theme/ThemeProvider.jsx"

export default function Home() {
  const theme = useSiteTheme()

  if (theme.id === "averra" || theme.id === "a1-consultancy") {
    return (
      <>
        <AverraHero />
        <AverraAssessments />
        <AverraServices />
        <AverraAbout />
        <AverraWhySingapore />
        <AverraContact />
      </>
    )
  }

  return (
    <>
      <Hero />
      <Services />
      <Assessments />
      <About />
      <WhySingapore />
      <Contact />
    </>
  )
}
