"use client"

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { UserPlus, Loader2, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../auth/AuthContext'
import { useSiteTheme } from '../theme/ThemeProvider.jsx'
import { getHomeSkin } from '../theme/homeSkins.js'

export default function Register() {
  const { t } = useTranslation()
  const theme = useSiteTheme()
  const skin = getHomeSkin(theme.id)
  const router = useRouter()
  const { register } = useAuth()

  const [form, setForm] = useState({
    username: '',
    password: '',
    passwordConfirm: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setFieldErrors({})
    setError(null)

    if (form.password !== form.passwordConfirm) {
      setFieldErrors({
        passwordConfirm: [
          t('auth.passwordMismatch') || 'Passwords do not match'
        ]
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        username: form.username.trim(),
        password: form.password
      }

      await register(payload)
      // Registered → land on the merged home (shows the form for a fresh account).
      router.replace('/my-application')
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setFieldErrors(err.data.errors)
      } else {
        setError(err.message || t('auth.registerError') || 'Failed to register')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = name => fieldErrors[name]?.[0]

  return (
    <div className='pt-24'>
      <PageHeader
        title={t('auth.registerTitle') || 'Register'}
        subtitle={t('auth.registerSubtitle') || 'Create your applicant account'}
        badge={t('auth.badge') || 'Applicant Portal'}
        icon={UserPlus}
      />

      <section className={skin.pageSectionPrimary}>
        <div className='max-w-md mx-auto px-4 sm:px-6 lg:px-8'>
          <Card className='border-2 shadow-xl'>
            <CardHeader>
              <CardTitle className='text-2xl'>
                {t('auth.registerTitle') || 'Register'}
              </CardTitle>
              <CardDescription>
                {t('auth.registerDesc') ||
                  'Pick a username and password to begin your application.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className='mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                  <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    {t('auth.username') || 'Username'}
                  </label>
                  <Input
                    type='text'
                    autoComplete='username'
                    value={form.username}
                    onChange={e => update('username', e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {fieldError('username') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {fieldError('username')}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    {t('auth.password') || 'Password'}
                  </label>
                  <PasswordInput
                    autoComplete='new-password'
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    disabled={submitting}
                    required
                    minLength={8}
                  />
                  {fieldError('password') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {fieldError('password')}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    {t('auth.confirmPassword') || 'Confirm Password'}
                  </label>
                  <PasswordInput
                    autoComplete='new-password'
                    value={form.passwordConfirm}
                    onChange={e => update('passwordConfirm', e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {fieldError('passwordConfirm') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {fieldError('passwordConfirm')}
                    </p>
                  )}
                </div>

                <Button
                  type='submit'
                  size='lg'
                  className='w-full'
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t('auth.registering') || 'Creating account...'}
                    </>
                  ) : (
                    <>
                      <UserPlus className='mr-2 h-4 w-4' />
                      {t('auth.registerTitle') || 'Register'}
                    </>
                  )}
                </Button>
              </form>

              <div className='mt-6 text-center text-sm text-gray-600'>
                {t('auth.haveAccount') || 'Already have an account?'}{' '}
                <Link
                  href='/login'
                  className='font-semibold text-brand-navy-700 underline-offset-4 hover:underline'
                >
                  {t('auth.loginTitle') || 'Log in'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
