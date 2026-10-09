"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import Application from './Application'
import ApplicationStatus from './ApplicationStatus'

// An applicant always has a record (registering creates a pending shell), so
// "active" means the form has actually been filled / moved past the shell.
const hasStartedApplication = a =>
  !!a &&
  ((a.data && Object.keys(a.data).length > 0) ||
    (a.status && a.status !== 'pending'))

/**
 * Merged applicant home. Loads the logged-in applicant via api.me() and shows:
 *  - the application form   when there's no active application yet, or
 *  - the status report      once an application has been started.
 */
export default function MyApplication() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.me()
        if (cancelled) return
        setStarted(hasStartedApplication(data))
      } catch (err) {
        if (cancelled) return
        if (err.status === 401) {
          router.push('/login')
          return
        }
        // Frozen / other errors: let the status report render its own handling.
        setStarted(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading) {
    return (
      <div className='pt-24 min-h-screen flex items-center justify-center'>
        <Loader2 className='w-10 h-10 animate-spin text-brand-navy-700' />
      </div>
    )
  }

  // When the form is submitted, switch this view over to the status report
  // (ApplicationStatus refetches via api.me(), so it picks up the new data).
  return started ? (
    <ApplicationStatus />
  ) : (
    <Application onViewStatus={() => setStarted(true)} />
  )
}
