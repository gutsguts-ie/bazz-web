"use client"

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { PasswordInput } from '../components/ui/password-input'
import { Search, LogIn, KeyRound, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { api } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { useSiteTheme } from '../theme/ThemeProvider.jsx'
import { getHomeSkin } from '../theme/homeSkins.js'

// step: 'code' | 'login' | 'claim'
export default function FindApplication() {
  const { t } = useTranslation()
  const theme = useSiteTheme()
  const skin = getHomeSkin(theme.id)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, claim } = useAuth()

  const [step, setStep] = useState('code')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Only accept same-origin paths so ?next= can't be used as an open redirect.
  const next = searchParams.get('next')
  const from = next?.startsWith('/') && !next.startsWith('//') ? next : '/my-application'

  const resetToCode = () => {
    setStep('code')
    setPassword('')
    setConfirm('')
    setError('')
  }

  async function findCode(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { exists, has_password } = await api.lookupApplicationCode(code.trim())
      if (!exists) {
        setError(
          t('find.notFound') ||
          "We couldn't find that application code. Please check and try again."
        )
        return
      }
      setPassword('')
      setConfirm('')
      setStep(has_password ? 'login' : 'claim')
    } catch {
      setError(t('find.genericError') || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function submitLogin(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login({ username: code.trim(), password })
      router.replace(from)
    } catch (err) {
      setError(
        err.status === 401
          ? t('find.wrongPassword') ||
            'That password is incorrect. Please try again.'
          : err.code === 'APPLICATION_FROZEN' ||
            err.data?.code === 'APPLICATION_FROZEN'
          ? t('find.frozen') ||
            'This application is on hold. Please contact us.'
          : t('find.genericError') || 'Something went wrong. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function submitClaim(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError(
        t('find.passwordTooShort') ||
        'Please choose a password of at least 8 characters.'
      )
      return
    }
    if (password !== confirm) {
      setError(t('find.passwordMismatch') || 'The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await claim({ application_code: code.trim(), password })
      router.replace(from)
    } catch (err) {
      if (err.status === 409) {
        // Claimed in the meantime — fall back to the login branch.
        setPassword('')
        setError(
          t('find.alreadyHasPassword') ||
          'This application already has a password. Please enter it below.'
        )
        setStep('login')
        return
      }
      setError(t('find.genericError') || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const heading =
    step === 'login'
      ? t('find.welcomeBack') || 'Welcome back'
      : step === 'claim'
      ? t('find.createTitle') || 'Create your password'
      : t('find.codeTitle') || 'Find your application'

  const helper =
    step === 'login'
      ? t('find.loginHelper') || 'Enter your password to continue.'
      : step === 'claim'
      ? t('find.createHelper') ||
        "This is your first time signing in. Choose a password you'll remember."
      : t('find.codeHelper') || 'Enter the application code we gave you.'

  return (
    <div className='pt-24'>
      <PageHeader
        title={t('find.codeTitle') || 'Find your application'}
        subtitle={t('find.subtitle') || 'Check or continue your application'}
        badge={t('auth.badge') || 'Applicant Portal'}
        icon={Search}
      />

      <section className={skin.pageSectionPrimary}>
        <div className='max-w-md mx-auto px-4 sm:px-6 lg:px-8'>
          <Card className='border-2 shadow-xl'>
            <CardHeader>
              <CardTitle className='text-2xl sm:text-3xl'>{heading}</CardTitle>
              <CardDescription className='text-base'>{helper}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className='mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0' />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP: code */}
              {step === 'code' && (
                <form onSubmit={findCode} className='space-y-5'>
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      {t('find.codeLabel') || 'Application code'}
                    </label>
                    <Input
                      type='text'
                      inputMode='text'
                      autoComplete='username'
                      autoFocus
                      value={code}
                      onChange={e => {
                        setCode(e.target.value)
                        setError('')
                      }}
                      disabled={busy}
                      required
                      className='h-12 text-lg'
                    />
                  </div>
                  <Button
                    type='submit'
                    size='lg'
                    className='w-full h-12 text-base'
                    disabled={busy || !code.trim()}
                  >
                    {busy ? (
                      <>
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                        {t('find.checking') || 'Checking...'}
                      </>
                    ) : (
                      <>
                        {t('find.continue') || 'Continue'}
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* STEP: login */}
              {step === 'login' && (
                <form onSubmit={submitLogin} className='space-y-5'>
                  <CodeBadge
                    label={t('find.codeLabel') || 'Application code'}
                    code={code.trim()}
                  />
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      {t('find.password') || 'Password'}
                    </label>
                    <PasswordInput
                      autoComplete='current-password'
                      autoFocus
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={busy}
                      required
                      className='h-12 text-lg'
                    />
                  </div>
                  <Button
                    type='submit'
                    size='lg'
                    className='w-full h-12 text-base'
                    disabled={busy || !password}
                  >
                    {busy ? (
                      <>
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                        {t('find.loggingIn') || 'Signing in...'}
                      </>
                    ) : (
                      <>
                        <LogIn className='mr-2 h-5 w-5' />
                        {t('find.loginBtn') || 'Log in'}
                      </>
                    )}
                  </Button>
                  <DifferentCodeLink onClick={resetToCode} busy={busy} t={t} />
                </form>
              )}

              {/* STEP: claim */}
              {step === 'claim' && (
                <form onSubmit={submitClaim} className='space-y-5'>
                  <CodeBadge
                    label={t('find.codeLabel') || 'Application code'}
                    code={code.trim()}
                  />
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      {t('find.password') || 'Password'}
                    </label>
                    <PasswordInput
                      autoComplete='new-password'
                      autoFocus
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={busy}
                      required
                      minLength={8}
                      className='h-12 text-lg'
                    />
                  </div>
                  <div>
                    <label className='block text-base font-medium text-gray-700 mb-2'>
                      {t('find.confirmPassword') || 'Confirm password'}
                    </label>
                    <PasswordInput
                      autoComplete='new-password'
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      disabled={busy}
                      required
                      className='h-12 text-lg'
                    />
                  </div>
                  <Button
                    type='submit'
                    size='lg'
                    className='w-full h-12 text-base'
                    disabled={busy || !password || !confirm}
                  >
                    {busy ? (
                      <>
                        <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                        {t('find.creating') || 'Creating...'}
                      </>
                    ) : (
                      <>
                        <KeyRound className='mr-2 h-5 w-5' />
                        {t('find.createBtn') || 'Create password'}
                      </>
                    )}
                  </Button>
                  <DifferentCodeLink onClick={resetToCode} busy={busy} t={t} />
                </form>
              )}

              <div className='mt-7 border-t border-gray-100 pt-5 text-center text-base text-gray-600'>
                {t('find.noApplication') || "Haven't applied yet?"}{' '}
                <Link
                  href='/register'
                  className='font-semibold text-brand-navy-700 underline-offset-4 hover:underline'
                >
                  {t('find.startHere') || 'Start here'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function CodeBadge({ label, code }) {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3'>
      <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
        {label}
      </p>
      <p className='font-mono text-lg font-bold tracking-widest text-brand-navy-900'>
        {code}
      </p>
    </div>
  )
}

function DifferentCodeLink({ onClick, busy, t }) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={busy}
      className='mx-auto flex items-center gap-1.5 text-sm font-medium text-gray-500 underline-offset-4 transition-colors hover:text-brand-navy-700 hover:underline disabled:opacity-50'
    >
      <ArrowLeft className='h-4 w-4' />
      {t('find.useDifferentCode') || 'Use a different code'}
    </button>
  )
}
