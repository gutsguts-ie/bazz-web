"use client"

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  CheckCircle2,
  FileText,
  Send,
  Copy,
  Check,
  ArrowUpRight
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CitizenshipForm from '../components/CitizenshipForm'
import PRForm from '../components/PRForm'
import { api } from '../lib/api'
import { useSiteTheme } from '../theme/ThemeProvider.jsx'
import { getHomeSkin } from '../theme/homeSkins.js'

export default function ApplicationPage({ onViewStatus }) {
  const { t } = useTranslation()
  const theme = useSiteTheme()
  const skin = getHomeSkin(theme.id)
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [applicationCode, setApplicationCode] = useState(null)
  const [codeCopied, setCodeCopied] = useState(false)

  // Get type from URL query parameter
  const typeParam = searchParams.get('type')
  const initialApplicationType = typeParam === 'pr' || typeParam === 'citizenship' ? typeParam : ''

  const [formData, setFormData] = useState({
    // Application Type
    applicationType: initialApplicationType,
    // PART I - Applicant Details
    fullName: '',
    surname: '',
    chineseName: '', // For citizenship form
    ethnicName: '', // For PR form
    sex: '',
    maritalStatus: '',
    countryOfBirth: '',
    provinceOfBirth: '',
    dateOfBirth: '',
    race: '',
    religion: '',
    currentImmigrationStatus: '', // For PR form
    occupation: '',
    basicSalary: '',
    grossSalary: '',
    netSalary: '',
    nric: '', // For citizenship form
    fin: '', // For PR form
    nationalityCitizenship: '',
    originIdNumber: '',
    passportNumber: '',
    passportDateOfIssue: '',
    otherNationality: '',
    overseasAddress: '',
    postalCode: '',
    singaporeAddress: '',
    email: '',
    phone: '',
    idPhoto: null, // File object for ID photo
    // PART II - Spouse Details
    spouseFullName: '',
    spouseSurname: '',
    spouseEthnicName: '',
    spouseNric: '',
    spouseCitizenship: '',
    spouseOccupation: '',
    employerNameAddress: '',
    // PART III - Parent/Guardian Consent (if applicable)
    parentGuardianName: '',
    parentGuardianNric: '',
    parentGuardianConsentDate: '',
    isUnder16: false,
    // PART IV - Declaration
    declarationDate: '',
    hasOtherTravelDocument: '', // 'yes' or 'no' or 'child'
    isChildApplication: false,
    // PART V - Representative Authorization
    representativeTitle: '',
    representativeName: '',
    representativeNric: '',
    authorizationDate: '',
    isChildRepresentative: false,
    // Additional
    preferredDate: '',
    message: ''
  })

  // Update application type when URL parameter changes
  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (typeParam === 'pr' || typeParam === 'citizenship') {
      setFormData(prev => ({ ...prev, applicationType: typeParam }))
    }
  }, [searchParams])

  const handleSubmit = async e => {
    e.preventDefault()

    if (step < 7) {
      setStep(step + 1)
    } else {
      // Handle final submission
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)

      try {
        const response = await api.submitApplication(formData)
        setSubmitSuccess(true)
        setApplicationCode(
          response.application_code || response.data?.application_code
        )
        setStep(8) // Show completion page
        setFormData({
          applicationType: '',
          fullName: '',
          surname: '',
          chineseName: '',
          ethnicName: '',
          sex: '',
          maritalStatus: '',
          countryOfBirth: '',
          provinceOfBirth: '',
          dateOfBirth: '',
          race: '',
          religion: '',
          currentImmigrationStatus: '',
          occupation: '',
          basicSalary: '',
          grossSalary: '',
          netSalary: '',
          nric: '',
          fin: '',
          nationalityCitizenship: '',
          originIdNumber: '',
          passportNumber: '',
          otherNationality: '',
          overseasAddress: '',
          postalCode: '',
          singaporeAddress: '',
          email: '',
          phone: '',
          spouseFullName: '',
          spouseSurname: '',
          spouseEthnicName: '',
          spouseNric: '',
          spouseCitizenship: '',
          spouseOccupation: '',
          employerNameAddress: '',
          preferredDate: '',
          message: '',
          idPhoto: null
        })
        setTimeout(() => setSubmitSuccess(false), 5000)
      } catch (error) {
        setSubmitError(
          error.message ||
          t('application.submitError') ||
          'Failed to submit application'
        )
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <div className='pt-24'>
      <PageHeader
        title={t('application.title')}
        subtitle={t('application.subtitle')}
        badge={t('application.badge')}
        icon={FileText}
      />

      <section className={skin.pageSectionPrimary}>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Progress Steps */}
          {step < 8 && (
            <div className='mb-8 md:mb-12'>
              <div className='flex flex-wrap gap-2 md:gap-3 justify-center'>
                {[1, 2, 3, 4, 5, 6, 7].map(s => (
                  <div key={s} className='flex items-center gap-1 md:gap-2'>
                    <div
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${step >= s
                        ? 'bg-brand-navy-700 text-white'
                        : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                      {step > s ? <CheckCircle2 className='w-4 h-4 md:w-5 md:h-5' /> : s}
                    </div>
                    <span
                      className={`text-xs md:text-sm font-medium ${step >= s ? 'text-brand-navy-700' : 'text-gray-500'
                        }`}
                    >
                      {s === 1
                        ? t('application.step1') || 'Type'
                        : s === 2
                          ? t('application.step2') || 'I'
                          : s === 3
                            ? t('application.step3') || 'II'
                            : s === 4
                              ? t('application.step4') || 'III'
                              : s === 5
                                ? t('application.step5') || 'IV'
                                : s === 6
                                  ? t('application.step6') || 'V'
                                  : t('application.step7') || 'Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Card className='border-2 shadow-xl'>
            {step === 8 || submitSuccess ? (
              <CardHeader className='items-center px-4 md:px-6 py-8 md:py-10 text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-green-100 shadow-sm'>
                  <CheckCircle2 className='h-10 w-10 md:h-12 md:w-12 text-green-600' />
                </div>
                <CardTitle className='text-2xl md:text-3xl break-words text-gray-900'>
                  {t('application.completedTitle') ||
                    'Application Submitted Successfully!'}
                </CardTitle>
                <CardDescription className='text-sm md:text-base break-words max-w-xl mx-auto'>
                  {t('application.completedMessage') ||
                    'Thank you for submitting your application. We have received your information and will process it shortly.'}
                </CardDescription>
              </CardHeader>
            ) : (
              <CardHeader className='px-4 md:px-6'>
                <CardTitle className='text-xl md:text-2xl lg:text-3xl break-words'>
                  {step === 1 && (t('application.selectType') || 'Select Application Type')}
                  {step === 2 && (t('application.part1Title') || 'PART I – PARTICULARS OF APPLICANT')}
                  {step === 3 && (t('application.part2Title') || 'PART II – PARTICULARS OF SPOUSE')}
                  {step === 4 && (t('application.part3Title') || 'PART III – CONSENT OF PARENT/LEGAL GUARDIAN')}
                  {step === 5 && (t('application.part4Title') || 'PART IV – DECLARATION')}
                  {step === 6 && (t('application.part5Title') || 'PART V – AUTHORISATION TO A REPRESENTATIVE')}
                  {step === 7 && (t('application.reviewSubmit') || 'Review & Submit')}
                </CardTitle>
                <CardDescription className='text-sm md:text-base break-words'>
                  {step === 1 && (t('application.selectTypeDesc') || 'Please select the type of application you wish to submit')}
                  {step === 2 && (t('application.applicantDetailsDesc') || 'Please provide your personal details')}
                  {step === 3 && (t('application.spouseDetailsDesc') || 'Please provide your spouse details (if applicable)')}
                  {step === 4 && (t('application.part3Desc') || 'For applicants under 16 years old')}
                  {step === 5 && (t('application.part4Desc') || 'Please read and confirm the declaration')}
                  {step === 6 && (t('application.part5Desc') || 'Authorize a representative to collect on your behalf (if applicable)')}
                  {step === 7 && (t('application.reviewSubmitDesc') || 'Please review your information before submitting')}
                </CardDescription>
              </CardHeader>
            )}
            <CardContent className='px-4 md:px-6'>
              {(step === 8 || submitSuccess) ? null : (
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <div className='space-y-6'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-3'>
                          {t('application.selectTypeDesc')}
                        </label>
                        <div className='space-y-3'>
                          {[
                            {
                              value: 'pr',
                              label: t('application.prApplication'),
                              desc: t('application.prApplicationDesc')
                            },
                            {
                              value: 'citizenship',
                              label: t('application.citizenshipApplication'),
                              desc: t('application.citizenshipApplicationDesc')
                            }
                          ].map(option => (
                            <label
                              key={option.value}
                              className='flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-brand-navy-600 transition-colors'
                            >
                              <input
                                type='radio'
                                name='applicationType'
                                value={option.value}
                                checked={
                                  formData.applicationType === option.value
                                }
                                onChange={e =>
                                  updateFormData(
                                    'applicationType',
                                    e.target.value
                                  )
                                }
                                className='mt-1 mr-3'
                                required
                              />
                              <div>
                                <div className='font-semibold text-gray-900'>
                                  {option.label}
                                </div>
                                <div className='text-sm text-gray-600'>
                                  {option.desc}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className='flex justify-end'>
                        <Button type='submit' size='lg'>
                          {t('application.next')}
                          <FileText className='ml-2 w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 2 &&
                    (formData.applicationType === 'citizenship' ? (
                      <CitizenshipForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : formData.applicationType === 'pr' ? (
                      <PRForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : null)}

                  {step === 3 &&
                    (formData.applicationType === 'citizenship' ? (
                      <CitizenshipForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : formData.applicationType === 'pr' ? (
                      <PRForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : null)}

                  {step === 4 &&
                    (formData.applicationType === 'citizenship' ? (
                      <CitizenshipForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : formData.applicationType === 'pr' ? (
                      <PRForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : null)}

                  {step === 5 &&
                    (formData.applicationType === 'citizenship' ? (
                      <CitizenshipForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : formData.applicationType === 'pr' ? (
                      <PRForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : null)}

                  {step === 6 &&
                    (formData.applicationType === 'citizenship' ? (
                      <CitizenshipForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : formData.applicationType === 'pr' ? (
                      <PRForm
                        formData={formData}
                        updateFormData={updateFormData}
                        step={step}
                        setStep={setStep}
                        handleSubmit={handleSubmit}
                      />
                    ) : null)}

                  {step === 7 && (
                    <div className='space-y-4 md:space-y-6'>
                      <div className='bg-brand-navy-50 p-4 md:p-6 rounded-lg border-2 border-brand-navy-200'>
                        <h3 className='font-semibold text-gray-900 mb-4 text-lg md:text-xl'>
                          {t('application.applicationSummary')}
                        </h3>
                        <div className='space-y-4 text-xs md:text-sm'>
                          <div className='flex w-full '>
                            {formData.idPhoto && (
                              <div className='w-32 h-40 object-cover border-2 border-gray-300 rounded'>
                                <img
                                  src={URL.createObjectURL(
                                    formData.idPhoto
                                  )}
                                  alt='ID photo'
                                  className='w-32 h-40 object-cover border-2 border-gray-300 rounded'
                                />
                              </div>
                            )}
                          </div>
                          <div className='border-t pt-4'>
                            <h4 className='font-semibold text-gray-900 mb-2'>
                              {t('application.part1Title')}
                            </h4>
                            <div className='space-y-2'>
                              <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                                <span className='text-gray-600'>
                                  {t('application.fullName')}:
                                </span>
                                <span className='font-medium text-gray-900 sm:text-right'>
                                  {formData.fullName}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.surname')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.surname}
                                </span>
                              </div>
                              {formData.applicationType === 'citizenship' &&
                                formData.chineseName && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.chineseName')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.chineseName}
                                    </span>
                                  </div>
                                )}
                              {formData.applicationType === 'pr' &&
                                formData.ethnicName && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.ethnicName')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.ethnicName}
                                    </span>
                                  </div>
                                )}
                              {formData.applicationType === 'citizenship' &&
                                formData.nric && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.nric')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.nric}
                                    </span>
                                  </div>
                                )}
                              {formData.applicationType === 'pr' && formData.fin && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.fin')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.fin}
                                  </span>
                                </div>
                              )}
                              {formData.applicationType === 'pr' &&
                                formData.currentImmigrationStatus && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.currentImmigrationStatus')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.currentImmigrationStatus}
                                    </span>
                                  </div>
                                )}
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.sex')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.sex}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.maritalStatus')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.maritalStatus}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.dateOfBirth')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.dateOfBirth}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.email')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.email}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.phone')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.phone}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.passportNumber')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.passportNumber}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.passportDateOfIssue')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.passportDateOfIssue ? new Date(formData.passportDateOfIssue).toLocaleDateString() : '-'}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.nationalityCitizenship')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.nationalityCitizenship}
                                </span>
                              </div>
                              <div className='flex justify-between'>
                                <span className='text-gray-600'>
                                  {t('application.occupation')}:
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formData.occupation}
                                </span>
                              </div>
                              {formData.countryOfBirth && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.countryOfBirth')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.countryOfBirth}
                                  </span>
                                </div>
                              )}
                              {formData.provinceOfBirth && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.provinceOfBirth')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.provinceOfBirth}
                                  </span>
                                </div>
                              )}
                              {formData.race && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.race')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.race}
                                  </span>
                                </div>
                              )}
                              {formData.religion && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.religion')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.religion}
                                  </span>
                                </div>
                              )}
                              {(formData.basicSalary || formData.grossSalary || formData.netSalary) && (
                                <div className='border-t pt-2 mt-2'>
                                  <h5 className='font-medium text-gray-700 mb-2'>{t('application.income')}:</h5>
                                  {formData.basicSalary && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.basicSalary')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.basicSalary}
                                      </span>
                                    </div>
                                  )}
                                  {formData.grossSalary && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.grossSalary')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.grossSalary}
                                      </span>
                                    </div>
                                  )}
                                  {formData.netSalary && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.netSalary')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.netSalary}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {formData.originIdNumber && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.originIdNumber')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.originIdNumber}
                                  </span>
                                </div>
                              )}
                              {formData.otherNationality && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.otherNationality')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.otherNationality}
                                  </span>
                                </div>
                              )}
                              {formData.overseasAddress && (
                                <div className='flex flex-col'>
                                  <span className='text-gray-600 mb-1'>
                                    {t('application.overseasAddress')}:
                                  </span>
                                  <span className='font-medium text-gray-900 whitespace-pre-line'>
                                    {formData.overseasAddress}
                                  </span>
                                </div>
                              )}
                              {formData.postalCode && (
                                <div className='flex justify-between'>
                                  <span className='text-gray-600'>
                                    {t('application.postalCode')}:
                                  </span>
                                  <span className='font-medium text-gray-900'>
                                    {formData.postalCode}
                                  </span>
                                </div>
                              )}
                              {formData.singaporeAddress && (
                                <div className='flex flex-col'>
                                  <span className='text-gray-600 mb-1'>
                                    {t('application.singaporeAddress')}:
                                  </span>
                                  <span className='font-medium text-gray-900 whitespace-pre-line'>
                                    {formData.singaporeAddress}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {(formData.spouseFullName ||
                            formData.spouseSurname) && (
                              <div className='border-t pt-4'>
                                <h4 className='font-semibold text-gray-900 mb-2'>
                                  {t('application.part2Title')}
                                </h4>
                                <div className='space-y-2'>
                                  {formData.spouseFullName && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.spouseFullName')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.spouseFullName}
                                      </span>
                                    </div>
                                  )}
                                  {formData.spouseSurname && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.spouseSurname')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.spouseSurname}
                                      </span>
                                    </div>
                                  )}
                                  {formData.spouseCitizenship && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.spouseCitizenship')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.spouseCitizenship}
                                      </span>
                                    </div>
                                  )}
                                  {formData.spouseOccupation && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.spouseOccupation')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.spouseOccupation}
                                      </span>
                                    </div>
                                  )}
                                  {formData.spouseEthnicName && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.spouseEthnicName')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.spouseEthnicName}
                                      </span>
                                    </div>
                                  )}
                                  {formData.spouseNric && (
                                    <div className='flex justify-between'>
                                      <span className='text-gray-600'>
                                        {t('application.spouseNric')}:
                                      </span>
                                      <span className='font-medium text-gray-900'>
                                        {formData.spouseNric}
                                      </span>
                                    </div>
                                  )}
                                  {formData.employerNameAddress && (
                                    <div className='flex flex-col'>
                                      <span className='text-gray-600 mb-1'>
                                        {t('application.employerNameAddress')}:
                                      </span>
                                      <span className='font-medium text-gray-900 whitespace-pre-line'>
                                        {formData.employerNameAddress}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          {(formData.isUnder16 || formData.parentGuardianName || formData.parentGuardianNric) && (
                            <div className='border-t pt-4'>
                              <h4 className='font-semibold text-gray-900 mb-2'>
                                {t('application.part3Title')}
                              </h4>
                              <div className='space-y-2'>
                                {formData.isUnder16 && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.isUnder16')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.isUnder16 ? t('application.yes') : t('application.no')}
                                    </span>
                                  </div>
                                )}
                                {formData.parentGuardianName && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.parentGuardianName')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.parentGuardianName}
                                    </span>
                                  </div>
                                )}
                                {formData.parentGuardianNric && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.parentGuardianNric')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.parentGuardianNric}
                                    </span>
                                  </div>
                                )}
                                {formData.parentGuardianConsentDate && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.parentGuardianConsentDate')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.parentGuardianConsentDate}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {(formData.declarationDate || formData.hasOtherTravelDocument || formData.isChildApplication) && (
                            <div className='border-t pt-4'>
                              <h4 className='font-semibold text-gray-900 mb-2'>
                                {t('application.part4Title')}
                              </h4>
                              <div className='space-y-2'>
                                {formData.declarationDate && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.declarationDate')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.declarationDate}
                                    </span>
                                  </div>
                                )}
                                {formData.hasOtherTravelDocument && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.declarationPartBQuestion')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.hasOtherTravelDocument}
                                    </span>
                                  </div>
                                )}
                                {formData.isChildApplication && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.isChildApplication')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.isChildApplication ? t('application.yes') : t('application.no')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {(formData.representativeName || formData.representativeTitle) && (
                            <div className='border-t pt-4'>
                              <h4 className='font-semibold text-gray-900 mb-2'>
                                {t('application.part5Title')}
                              </h4>
                              <div className='space-y-2'>
                                {formData.representativeTitle && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.representativeTitle')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.representativeTitle}
                                    </span>
                                  </div>
                                )}
                                {formData.representativeName && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.representativeName')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.representativeName}
                                    </span>
                                  </div>
                                )}
                                {formData.authorizationDate && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.authorizationDate')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.authorizationDate}
                                    </span>
                                  </div>
                                )}
                                {formData.isChildRepresentative && (
                                  <div className='flex justify-between'>
                                    <span className='text-gray-600'>
                                      {t('application.isChildRepresentative')}:
                                    </span>
                                    <span className='font-medium text-gray-900'>
                                      {formData.isChildRepresentative ? t('application.yes') : t('application.no')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
                        <p className='text-sm text-gray-700'>
                          <strong>{t('application.note')}:</strong>{' '}
                          {t('application.noteText')}
                        </p>
                      </div>
                      {submitError && (
                        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                          {submitError}
                        </div>
                      )}
                      <div className='flex flex-col sm:flex-row justify-between gap-3 pt-4'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => setStep(6)}
                          disabled={isSubmitting}
                          className='w-full sm:w-auto'
                        >
                          {t('application.back')}
                        </Button>
                        <Button type='submit' size='lg' disabled={isSubmitting} className='w-full sm:w-auto'>
                          {isSubmitting
                            ? t('application.submitting') || 'Submitting...'
                            : t('application.submitApplication')}
                          <Send className='ml-2 w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  )}

                </form>
              )}
              {(step === 8 || submitSuccess) && (
                <div className='space-y-6'>
                  {/* Application code */}
                  {applicationCode && (
                    <div className='rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-8'>
                      <span className='inline-block rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500'>
                        {t('application.applicationCode') || 'Application Code'}
                      </span>
                      <div className='mt-2 flex items-center gap-3 flex-wrap'>
                        <span className='font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-navy-900 leading-none break-all'>
                          {applicationCode}
                        </span>
                        <button
                          type='button'
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(applicationCode)
                              setCodeCopied(true)
                              setTimeout(() => setCodeCopied(false), 2000)
                            } catch {
                              // clipboard unavailable; silently ignore
                            }
                          }}
                          title={
                            codeCopied
                              ? t('application.codeCopied') || 'Copied'
                              : t('application.copyCode') || 'Copy'
                          }
                          aria-label={
                            codeCopied
                              ? t('application.codeCopied') || 'Copied'
                              : t('application.copyCode') || 'Copy'
                          }
                          className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-navy-700'
                        >
                          {codeCopied ? (
                            <Check className='w-5 h-5 text-green-600' />
                          ) : (
                            <Copy className='w-5 h-5' />
                          )}
                        </button>
                      </div>
             
                    </div>
                  )}

                  {/* What happens next */}
                  <div className='rounded-2xl border border-gray-200 bg-white p-6 sm:p-8'>
                    <span className='inline-block rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-5'>
                      {t('application.nextStepsTitle') || 'What happens next'}
                    </span>
                    <ol className='space-y-5'>
                      {[
                        {
                          n: '01',
                          title: t('application.step1Title') || 'Triage',
                          body:
                            t('application.step1Body') ||
                            'We log your file and pair it with an advisor matched to your profile.'
                        },
                        {
                          n: '02',
                          title: t('application.step2Title') || 'Document audit',
                          body:
                            t('application.step2Body') ||
                            "We review what you've sent and flag anything still outstanding — typically within 48 hours."
                        },
                        {
                          n: '03',
                          title: t('application.step3Title') || 'Private channel',
                          body:
                            t('application.step3Body') ||
                            'A direct line opens for questions, signatures, and updates until decision.'
                        }
                      ].map(s => (
                        <li key={s.n} className='flex gap-4'>
                          <span className='font-mono text-lg font-bold text-brand-navy-700 leading-none pt-0.5 w-7 flex-shrink-0'>
                            {s.n}
                          </span>
                          <div className='min-w-0'>
                            <p className='font-semibold text-gray-900'>
                              {s.title}
                            </p>
                            <p className='mt-0.5 text-sm text-gray-600 leading-relaxed'>
                              {s.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Actions */}
                  <div className='flex flex-col sm:flex-row gap-3 sm:items-center'>
                    {applicationCode && (
                      <Button
                        size='lg'
                        className='w-full sm:w-auto'
                        onClick={
                          onViewStatus
                            ? onViewStatus
                            : () => { window.location.href = '/my-application' }
                        }
                      >
                        {t('application.viewStatus') || 'View application status'}
                        <ArrowUpRight className='ml-2 w-5 h-5' />
                      </Button>
                    )}
                    <Link href='/contact'>
                      <Button
                        variant='outline'
                        size='lg'
                        className='w-full sm:w-auto'
                      >
                        {t('application.contactUs') || 'Reach your advisor'}
                      </Button>
                    </Link>
                    {/* <button
                      type='button'
                      className='text-sm text-gray-500 hover:text-brand-navy-700 underline underline-offset-4 decoration-gray-300 hover:decoration-brand-navy-700 transition-colors self-center sm:ml-1'
                      onClick={() => {
                        setStep(1)
                        setSubmitSuccess(false)
                        setApplicationCode(null)
                        setCodeCopied(false)
                        setFormData({
                              applicationType: '',
                              fullName: '',
                              surname: '',
                              chineseName: '',
                              ethnicName: '',
                              sex: '',
                              maritalStatus: '',
                              countryOfBirth: '',
                              provinceOfBirth: '',
                              dateOfBirth: '',
                              race: '',
                              religion: '',
                              currentImmigrationStatus: '',
                              occupation: '',
                              basicSalary: '',
                              grossSalary: '',
                              netSalary: '',
                              nric: '',
                              fin: '',
                              nationalityCitizenship: '',
                              originIdNumber: '',
                              passportNumber: '',
                              passportDateOfIssue: '',
                              otherNationality: '',
                              overseasAddress: '',
                              postalCode: '',
                              singaporeAddress: '',
                              email: '',
                              phone: '',
                              spouseFullName: '',
                              spouseSurname: '',
                              spouseEthnicName: '',
                              spouseNric: '',
                              spouseCitizenship: '',
                              spouseOccupation: '',
                              employerNameAddress: '',
                              preferredDate: '',
                              message: '',
                              idPhoto: null
                            })
                          }}
                        >
                          {t('application.submitAnother') || 'Start a new file'}
                        </button> */}
                      </div>
                    </div>
                  )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
