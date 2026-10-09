"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Upload,
  Eye,
  ClockIcon,
  Loader
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CreditScoreGauge from '../components/CreditScoreGauge'
import { api } from '../lib/api'
import { useSiteTheme } from '../theme/ThemeProvider.jsx'
import { getHomeSkin } from '../theme/homeSkins.js'
import {
  MapPin,
  Calendar,
  Copy,
  User,
  IdCard,
  Users,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  X
} from 'lucide-react'

export default function ApplicationStatus() {
  const { code: paramCode } = useParams()
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const theme = useSiteTheme()
  const skin = getHomeSkin(theme.id)
  const currentLanguage = i18n.language || 'en'
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [frozen, setFrozen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [documentTypes, setDocumentTypes] = useState({})
  const [additionalDocumentTypes, setAdditionalDocumentTypes] = useState({})
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [modalCat, setModalCat] = useState(null)
  const fileInputRef = useRef(null)
  const additionalFileInputRef = useRef(null)
  const ctaFileInputRef = useRef(null)
  const objectUrlsRef = useRef([])

  // Effective application code: the URL param when deep-linking by code,
  // otherwise the logged-in applicant's own code (api.me() flow).
  const code = paramCode || application?.application_code

  // Load status: from the code-based endpoint when deep-linked, else from
  // the logged-in applicant's own record via api.me().
  const loadStatus = () =>
    paramCode ? api.getApplicationStatus(paramCode) : api.me()

  // Open a protected document preview by fetching it as a blob with the
  // bearer token (an <a>/<img> can't send Authorization headers).
  const handlePreview = async documentId => {
    try {
      const url = await api.getDocumentPreviewObjectUrl(code, documentId)
      objectUrlsRef.current.push(url)
      window.open(url, '_blank')
    } catch (err) {
      if (err.status === 401) {
        router.push('/login')
        return
      }
      setUploadError(err.message || t('applicationStatus.uploadError'))
    }
  }

  // Revoke any object URLs created for previews on unmount.
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  // Helper function to flatten grouped documents into array
  const flattenDocuments = docs => {
    if (!docs) return []
    if (Array.isArray(docs)) return docs
    if (typeof docs === 'object') {
      return Object.values(docs).flat()
    }
    return []
  }

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true)
        setError(null)
        setFrozen(false)
        const response = await loadStatus()

        // Check if application was found
        if (!response.data) {
          setApplication(null)
          setLoading(false)
          return
        }

        setApplication(response.data)

        // Always fetch normal documents for the Documents tab
        try {
          const docResponse = await api.getDocumentTypes('normal')
          // Handle grouped response - store as grouped structure
          const groupedData = docResponse.data || {}
          setDocumentTypes(
            Array.isArray(groupedData) ? groupedData : groupedData
          )
        } catch (docErr) {
          console.error('Failed to fetch document types:', docErr)
          setDocumentTypes({})
        }

        // Fetch additional document types if there are additional_documents
        if (
          response.data?.additional_documents &&
          response.data.additional_documents.length > 0
        ) {
          try {
            const additionalDocResponse = await api.getDocumentTypes('additional')
            // Handle grouped response - store as grouped structure
            const groupedData = additionalDocResponse.data || {}
            const allAdditionalDocs = Array.isArray(groupedData)
              ? groupedData
              : Object.values(groupedData).flat()
            // Filter to only include documents that are in the additional_documents array
            const requiredAdditionalDocIds =
              response.data.additional_documents || []
            const filteredAdditionalDocs = allAdditionalDocs.filter(doc => {
              // Handle both string and number ID comparisons
              return requiredAdditionalDocIds.some(
                id =>
                  Number(id) === Number(doc.id) || String(id) === String(doc.id)
              )
            })
            // Group filtered documents by category
            const groupedFiltered = {}
            filteredAdditionalDocs.forEach(doc => {
              const category = doc.category_en || 'Uncategorized'
              if (!groupedFiltered[category]) {
                groupedFiltered[category] = []
              }
              groupedFiltered[category].push(doc)
            })
            // Sort documents within each category by order
            Object.keys(groupedFiltered).forEach(category => {
              groupedFiltered[category].sort((a, b) => a.order - b.order)
            })
            // Sort categories by minimum order value
            const sortedCategories = Object.keys(groupedFiltered).sort(
              (a, b) => {
                const minOrderA = Math.min(
                  ...groupedFiltered[a].map(d => d.order)
                )
                const minOrderB = Math.min(
                  ...groupedFiltered[b].map(d => d.order)
                )
                return minOrderA - minOrderB
              }
            )
            const sortedGrouped = {}
            sortedCategories.forEach(cat => {
              sortedGrouped[cat] = groupedFiltered[cat]
            })
            setAdditionalDocumentTypes(sortedGrouped)
          } catch (docErr) {
            console.error('Failed to fetch additional document types:', docErr)
            setAdditionalDocumentTypes({})
          }
        } else {
          setAdditionalDocumentTypes({})
        }
      } catch (err) {
        // Not authenticated / token revoked → back to login
        if (err.status === 401) {
          router.push('/login')
          return
        }
        // Handle frozen application (403 APPLICATION_FROZEN)
        if (err.code === 'APPLICATION_FROZEN') {
          setFrozen(true)
          setApplication(null)
          setError(null)
        } else if (
          err.message &&
          (err.message.toLowerCase().includes('not found') ||
            err.message.toLowerCase().includes('application not found') ||
            err.message.toLowerCase().includes('404'))
        ) {
          // Check if it's a 404 (not found) error
          setApplication(null)
          setError(null)
        } else {
          setError(err.message || t('applicationStatus.errorLoading'))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCode])

  const getInfoStatusBadge = status => {
    const statusLower = status?.toLowerCase() || 'pending'
    const statusMap = {
      pending: {
        label: t('applicationStatus.pending'),
        className: 'bg-brand-navy-100 text-brand-navy-900 border-brand-navy-300'
      },
      approved: {
        label: t('applicationStatus.confirmed'),
        className: 'bg-green-100 text-green-800 border-green-300'
      }
    }
    const statusInfo = statusMap[statusLower] || statusMap['pending']
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    )
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    try {
      // get language code
      const languageCode = currentLanguage === 'zh' ? 'zh-CN' : 'en-US'
      const date = new Date(dateString)
      return date.toLocaleDateString(languageCode, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const handleFileSelect = async (e, documentTypeId = null) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('applicationStatus.fileSizeError'))
      setSelectedFile(null)
      return
    }

    // If documentTypeId is provided, use it; otherwise use selectedDocumentType
    const docTypeId = documentTypeId || selectedDocumentType
    if (!docTypeId) {
      setUploadError(t('applicationStatus.pleaseSelectDocumentType'))
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Automatically upload the file
    try {
      setUploading(true)
      setUploadError(null)
      await api.uploadDocument(code, file, docTypeId)

      // Refresh application data to show new document
      const appResponse = await loadStatus()
      setApplication(appResponse.data)

      // Reset form
      setSelectedFile(null)
      setSelectedDocumentType('')
      if (e.target) e.target.value = ''
    } catch (err) {
      if (err.status === 401) {
        router.push('/login')
        return
      }
      setUploadError(err.message || t('applicationStatus.uploadError'))
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDocumentClick = (documentTypeId, isUploaded, inputRef) => {
    if (uploading || isUploaded) return

    setSelectedDocumentType(documentTypeId.toString())
    setUploadError(null)

    // Trigger file input
    if (inputRef?.current) {
      inputRef.current.click()
    }
  }

  if (loading) {
    return (
      <div className='pt-24 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-brand-navy-700 mx-auto mb-4' />
          <p className='text-gray-600'>
            {t('applicationStatus.loadingStatus')}
          </p>
        </div>
      </div>
    )
  }

  if (frozen) {
    return (
      <div className='pt-24'>
        <PageHeader
          title={t('applicationStatus.title')}
          subtitle={t('applicationStatus.subtitle')}
          badge={t('applicationStatus.status')}
          icon={FileText}
        />
        <section className={skin.pageSectionPrimary}>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='relative overflow-hidden rounded-lg border-2 border-brand-navy-200 bg-brand-navy-50 shadow-xl'>
              <div className='relative p-8 sm:p-12 md:p-16'>
                <div className='flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12'>
                  <div className='flex-shrink-0' aria-hidden='true'>
                    <svg
                      viewBox='0 0 100 100'
                      className='w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 text-brand-navy-700'
                    >
                      <circle
                        cx='50'
                        cy='50'
                        r='44'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='5'
                      />
                      <line
                        x1='50'
                        y1='28'
                        x2='50'
                        y2='60'
                        stroke='currentColor'
                        strokeWidth='9'
                        strokeLinecap='round'
                      />
                      <circle cx='50' cy='74' r='4.5' fill='currentColor' />
                    </svg>
                  </div>
                  <div className='flex-1 text-center md:text-left min-w-0'>
                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-semibold text-brand-navy-800 tracking-wide mb-6 md:mb-8 break-words'>
                      {t('applicationStatus.serviceUnavailable')}
                    </h2>
                    <p className='text-sm sm:text-base md:text-lg text-brand-navy-700 leading-relaxed whitespace-pre-line'>
                      {t('applicationStatus.serviceUnavailableMessage')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (error) {
    const isRateLimitError = error.toLowerCase().includes('too many requests')

    return (
      <div className='pt-24'>
        <PageHeader
          title={t('applicationStatus.title')}
          subtitle={t('applicationStatus.subtitle')}
          badge={t('applicationStatus.status')}
          icon={FileText}
        />
        <section className={skin.pageSectionPrimary}>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <Card className='border-2 shadow-xl'>
              <CardContent className='p-8 text-center'>
                <AlertCircle
                  className={`w-16 h-16 ${isRateLimitError ? 'text-yellow-500' : 'text-red-500'
                    } mx-auto mb-4`}
                />
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  {isRateLimitError
                    ? t('applicationStatus.rateLimitExceeded')
                    : t('common.error')}
                </h2>
                <p className='text-gray-600 mb-4'>{error}</p>
                {isRateLimitError && (
                  <p className='text-sm text-gray-500 mb-6'>
                    {t('applicationStatus.rateLimitMessage')}
                  </p>
                )}
                {isRateLimitError && (
                  <div className='flex justify-center'>
                    <Button size='lg' onClick={() => window.location.reload()}>
                      {t('applicationStatus.tryAgain')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  if (!application) {
    return (
      <div className='pt-24'>
        <PageHeader
          title={t('applicationStatus.title')}
          subtitle={t('applicationStatus.subtitle')}
          badge={t('applicationStatus.status')}
          icon={FileText}
        />
        <section className={skin.pageSectionPrimary}>
          <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
            <Card className='border-2 shadow-xl'>
              <CardContent className='p-8 text-center'>
                <AlertCircle className='w-16 h-16 text-yellow-500 mx-auto mb-4' />
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                  {t('applicationStatus.applicationNotFound')}
                </h2>
                <p className='text-gray-600 mb-6'>
                  {t('applicationStatus.applicationNotFoundMessage')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    )
  }

  // ===== Unified application report layout (all brands) =====
  const score = application.total_score
  const hasScore =
    score !== undefined &&
    score !== null &&
    application.status?.toLowerCase() !== 'pending'

  // Missing additional documents
  const requiredDocumentTypeIds = application.additional_documents || []
  const additionalDocuments =
    application.documents?.filter(
      doc =>
        doc.document?.type === 'additional' ||
        requiredDocumentTypeIds.some(
          id =>
            Number(id) === Number(doc.document_id) ||
            String(id) === String(doc.document_id)
        )
    ) || []
  // Treat rejected uploads as not-yet-submitted so they appear in the
  // red banner + yellow upload panel and prompt a re-upload.
  const submittedDocumentTypeIds = additionalDocuments
    .filter(d => d.status !== 'rejected')
    .map(d => d.document_id)
    .filter(Boolean)
  const missingDocumentIds = requiredDocumentTypeIds.filter(
    id =>
      !submittedDocumentTypeIds.some(
        sid => Number(id) === Number(sid) || String(id) === String(sid)
      )
  )
  const hasMissingDocuments = missingDocumentIds.length > 0
  const allDocumentTypes = [
    ...flattenDocuments(documentTypes),
    ...flattenDocuments(additionalDocumentTypes)
  ]
  // Requested additional documents still outstanding (need uploading)
  const missingDocs = allDocumentTypes.filter(d =>
    missingDocumentIds.some(
      id => Number(id) === Number(d.id) || String(id) === String(d.id)
    )
  )
  // Additional documents already uploaded but still awaiting review (pending)
  const pendingDocumentTypeIds = additionalDocuments
    .filter(d => ['pending', 'in_review', 'in review'].includes(d.status))
    .map(d => d.document_id)
    .filter(Boolean)
  const pendingDocs = allDocumentTypes.filter(d =>
    pendingDocumentTypeIds.some(
      id => Number(id) === Number(d.id) || String(id) === String(d.id)
    )
  )
  // Combined list shown in the yellow upload panel (missing/rejected + pending)
  const outstandingDocs = [...missingDocs, ...pendingDocs]
  const pendingIdSet = new Set(pendingDocumentTypeIds.map(String))

  const TONE = {
    excellent: '#16a34a',
    good: '#22c55e',
    veryGood: '#0d9488',
    low: '#f59e0b',
    poor: '#dc2626'
  }
  // Tier (color + label + note) from a category's completion percentage
  const assessmentTierFor = s => {
    if (s >= 90)
      return { tone: 'excellent', tagEn: 'Excellent', tagZh: '优秀', noteEn: 'Strong Profile', noteZh: '资料完整' }
    if (s >= 75)
      return { tone: 'good', tagEn: 'Good', tagZh: '良好', noteEn: 'Well Documented', noteZh: '记录良好' }
    if (s >= 50)
      return { tone: 'veryGood', tagEn: 'Fair', tagZh: '一般', noteEn: 'Adequate Records', noteZh: '记录尚可' }
    if (s >= 25)
      return { tone: 'low', tagEn: 'Low', tagZh: '偏低', noteEn: 'Needs Attention', noteZh: '有待完善' }
    return { tone: 'poor', tagEn: 'Poor', tagZh: '差', noteEn: 'Incomplete Records', noteZh: '记录不完整' }
  }
  // Icon + accent + description per known category (matched by name keyword).
  const CAT_META = [
    { match: ['personal'], Icon: IdCard, color: '#7F1D1D', subEn: 'Identity, permit card, residence proof', subZh: '身份、准证、居住证明' },
    { match: ['family', 'spouse', 'marital', 'dependen'], Icon: Users, color: '#1A1F36', subEn: 'Marital, family, dependency records', subZh: '婚姻、家庭、受养记录' },
    { match: ['edu', 'academic'], Icon: GraduationCap, color: '#92400E', subEn: 'Academic certificates, transcripts', subZh: '学历证书、成绩单' },
    { match: ['employ', 'work', 'income', 'salary', 'tax'], Icon: Briefcase, color: '#1A1F36', subEn: 'Employment letters, payslips, tax', subZh: '雇佣信、薪资单、税务' },
    { match: ['community', 'civic', 'volunteer', 'integration', 'social'], Icon: HeartHandshake, color: '#6B7280', subEn: 'Civic participation, volunteer work', subZh: '公民参与、志愿服务' }
  ]
  const metaForCategory = name => {
    const n = (name || '').toLowerCase()
    return (
      CAT_META.find(m => m.match.some(k => n.includes(k))) || {
        Icon: FileText,
        color: '#1A1F36',
        subEn: '',
        subZh: ''
      }
    )
  }
  // Assessment categories derived from the normal document types (grouped by
  // category). Each category's score = approved documents / total documents.
  const assessmentCategories = (() => {
    const groups = {}
    const addDoc = (catEn, catZh, doc) => {
      const key = catEn || 'Other'
      if (!groups[key]) {
        groups[key] = {
          en: key,
          zh: catZh || key,
          total: 0,
          completed: 0,
          order: doc.order ?? 0,
          docs: []
        }
      }
      groups[key].total += 1
      const uploaded = application.documents?.find(
        d => Number(d.document_id) === Number(doc.id)
      )
      if (uploaded && uploaded.status === 'approved') groups[key].completed += 1
      if ((doc.order ?? 0) < groups[key].order) groups[key].order = doc.order ?? 0
      groups[key].docs.push({
        id: doc.id,
        order: doc.order ?? 0,
        nameEn: doc.name_en,
        nameZh: doc.name_zh,
        status: uploaded?.status || null,
        points: uploaded?.score || uploaded?.points_awarded || null
      })
    }
    if (Array.isArray(documentTypes)) {
      documentTypes.forEach(doc => addDoc(doc.category_en, doc.category_zh, doc))
    } else if (documentTypes && typeof documentTypes === 'object') {
      Object.entries(documentTypes).forEach(([cat, docs]) => {
        ; (docs || []).forEach(doc =>
          addDoc(doc.category_en || cat, doc.category_zh, doc)
        )
      })
    }
    const cats = Object.values(groups)
      .sort((a, b) => a.order - b.order)
      .map(g => {
        const raw = g.total ? Math.round((g.completed / g.total) * 100) : 0
        const tier = assessmentTierFor(raw)
        const meta = metaForCategory(g.en)
        return {
          en: g.en,
          zh: g.zh,
          subEn: meta.subEn || `${g.total} document${g.total === 1 ? '' : 's'}`,
          subZh: meta.subZh || `${g.total} 份文件`,
          raw,
          tone: tier.tone,
          tagEn: tier.tagEn,
          tagZh: tier.tagZh,
          noteEn: tier.noteEn,
          noteZh: tier.noteZh,
          Icon: meta.Icon,
          iconColor: meta.color,
          documents: g.docs.slice().sort((a, b) => a.order - b.order)
        }
      })

    // Additional / required supporting documents as one combined category
    const addlTypes = flattenDocuments(additionalDocumentTypes)
    if (addlTypes.length) {
      let completed = 0
      const docs = addlTypes.map(doc => {
        const uploaded = application.documents?.find(
          d => Number(d.document_id) === Number(doc.id)
        )
        if (uploaded && uploaded.status === 'approved') completed += 1
        return {
          id: doc.id,
          order: doc.order ?? 0,
          nameEn: doc.name_en,
          nameZh: doc.name_zh,
          status: uploaded?.status || null,
          points: uploaded?.score || uploaded?.points_awarded || null
        }
      })
      const raw = Math.round((completed / addlTypes.length) * 100)
      const tier = assessmentTierFor(raw)
      cats.push({
        en: 'Additional Documents',
        zh: '所需文件',
        subEn: 'Supporting documents requested',
        subZh: '所需补充文件',
        raw,
        tone: tier.tone,
        tagEn: tier.tagEn,
        tagZh: tier.tagZh,
        noteEn: tier.noteEn,
        noteZh: tier.noteZh,
        Icon: FileText,
        iconColor: '#0D9488',
        documents: docs.slice().sort((a, b) => a.order - b.order)
      })
    }
    return cats
  })()
  const localize = (en, zh) => (currentLanguage === 'zh' ? zh || en : en)

  // Compact status chip for the per-document accordion table
  const docStatusChip = status => {
    const s = (status || '').toLowerCase()
    if (s === 'approved')
      return {
        label: t('applicationStatus.approved'),
        cls: 'bg-green-100 text-green-700'
      }
    if (s === 'rejected')
      return {
        label: t('applicationStatus.rejected'),
        cls: 'bg-red-100 text-red-700'
      }
    if (['pending', 'in_review', 'in review'].includes(s))
      return {
        label: t('applicationStatus.inReview'),
        cls: 'bg-amber-100 text-amber-700'
      }
    return {
      label: t('applicationStatus.notCompleted'),
      cls: 'bg-gray-100 text-gray-500'
    }
  }

  // One document row for the category table / modal
  const renderCatDocRow = d => {
    const chip = docStatusChip(d.status)
    return (
      <div
        key={d.id}
        className='grid grid-cols-[1fr_6rem_4rem] items-center gap-x-3 py-2.5'
      >
        <span className='min-w-0 truncate text-xs text-gray-700'>
          {localize(d.nameEn, d.nameZh)}
        </span>
        <span className='flex justify-center'>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${chip.cls}`}
          >
            {chip.label}
          </span>
        </span>
        <span className='text-right font-mono text-xs font-semibold text-brand-navy-900'>
          {d.points != null && d.points > 0 ? `+${d.points}` : '—'}
        </span>
      </div>
    )
  }

  /* Applicant details (disabled)
  const applicantFields = [
    { label: t('applicationStatus.fullName'), value: application.full_name },
    { label: t('applicationStatus.surname'), value: application.surname },
    { label: t('applicationStatus.chineseName'), value: application.chinese_name },
    { label: t('applicationStatus.ethnicName'), value: application.ethnic_name },
    { label: t('applicationStatus.email'), value: application.email },
    { label: t('applicationStatus.phone'), value: application.phone },
    { label: t('applicationStatus.nric'), value: application.nric, mono: true },
    { label: t('applicationStatus.fin'), value: application.fin, mono: true },
    {
      label: t('applicationStatus.dateOfBirth'),
      value: application.date_of_birth
        ? formatDate(application.date_of_birth)
        : null
    },
    {
      label: t('applicationStatus.nationalityCitizenship'),
      value: application.nationality_citizenship
    },
    { label: t('applicationStatus.occupation'), value: application.occupation },
    {
      label: t('applicationStatus.passportNumber'),
      value: application.passport_number,
      mono: true
    }
  ].filter(f => f.value)
  const spouseFields = [
    {
      label: t('applicationStatus.spouseFullName'),
      value: application.spouse_full_name
    },
    {
      label: t('applicationStatus.spouseSurname'),
      value: application.spouse_surname
    },
    {
      label: t('applicationStatus.spouseCitizenship'),
      value: application.spouse_citizenship
    },
    {
      label: t('applicationStatus.spouseOccupation'),
      value: application.spouse_occupation
    }
  ].filter(f => f.value)
  */

  const renderDocItem = (docType, inputRef) => {
    const uploadedDoc = application.documents?.find(
      ad => ad.document_id === docType.id
    )
    const isUploaded = !!uploadedDoc
    const isPending =
      uploadedDoc &&
      ['pending', 'in_review', 'in review'].includes(uploadedDoc.status)
    const isRejected = uploadedDoc && uploadedDoc.status === 'rejected'
    const isSelected = selectedDocumentType === docType.id.toString()
    const isUploadingForThis = uploading && isSelected
    const isAdditionalDoc =
      application.additional_documents?.includes(docType.id) || false
    const docDate =
      isAdditionalDoc && application.additional_document_dates?.[docType.id]
        ? application.additional_document_dates[docType.id]
        : null
    const statusChip = isRejected
      ? { label: t('applicationStatus.rejected'), cls: 'bg-red-100 text-red-700' }
      : isPending
        ? {
          label: t('applicationStatus.inReview'),
          cls: 'bg-amber-100 text-amber-700'
        }
        : {
          label: t('applicationStatus.submitted'),
          cls: 'bg-green-100 text-green-700'
        }

    return (
      <div
        key={docType.id}
        onClick={() => {
          if (!uploading && (!isUploaded || isPending || isRejected)) {
            handleDocumentClick(
              docType.id,
              isUploaded && !isPending && !isRejected,
              inputRef
            )
          }
        }}
        className={`group rounded-xl border bg-white p-4 transition-all ${isSelected
          ? 'border-brand-navy-500 bg-brand-navy-50 shadow-sm'
          : isRejected
            ? 'border-red-200 hover:border-red-300 cursor-pointer'
            : isUploaded && !isPending
              ? 'border-green-200 bg-green-50/50 cursor-not-allowed'
              : 'border-gray-200 hover:border-brand-navy-300 hover:shadow-sm cursor-pointer'
          } ${uploading || (isUploaded && !isPending && !isRejected) ? 'cursor-not-allowed' : ''}`}
      >
        <div className='flex items-start gap-3'>
          {/* Leading status icon */}
          <div className='mt-0.5 flex-shrink-0'>
            {isUploaded && !isPending && !isRejected ? (
              <CheckCircle className='w-5 h-5 text-green-600' />
            ) : isPending ? (
              <Clock className='w-5 h-5 text-amber-500' />
            ) : isRejected ? (
              <XCircle className='w-5 h-5 text-red-600' />
            ) : isUploadingForThis ? (
              <Loader2 className='w-5 h-5 text-brand-navy-700 animate-spin' />
            ) : (
              <Upload className='w-5 h-5 text-gray-400 group-hover:text-brand-navy-700 transition-colors' />
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-3'>
              <p
                className={`font-semibold leading-snug ${isRejected ? 'text-red-900' : isUploaded && !isPending ? 'text-green-800' : 'text-gray-900'}`}
              >
                {localize(docType.name_en, docType.name_zh)}
              </p>
              {isUploaded && uploadedDoc && (
                <button
                  type='button'
                  onClick={e => {
                    e.stopPropagation()
                    handlePreview(uploadedDoc.id)
                  }}
                  className='flex-shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-navy-700 transition-colors hover:bg-brand-navy-50'
                >
                  <Eye className='w-3.5 h-3.5' />
                  {t('applicationStatus.preview')}
                </button>
              )}
            </div>

            {(docType.description_en || docType.description_zh) && (
              <p className='text-sm text-gray-500 mt-0.5'>
                {localize(docType.description_en, docType.description_zh)}
              </p>
            )}
            {docDate && (
              <p className='text-xs text-gray-600 mt-1 font-medium'>
                {t('applicationStatus.requiredDate')}: {formatDate(docDate)}
              </p>
            )}

            {isUploaded && uploadedDoc && (
              <div className='mt-2 flex flex-wrap items-center gap-x-2 gap-y-1'>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusChip.cls}`}
                >
                  {statusChip.label}
                </span>
                {(uploadedDoc.score || uploadedDoc.points_awarded) > 0 && (
                  <span className='inline-flex items-center rounded-full bg-brand-navy-50 px-2 py-0.5 text-[11px] font-semibold text-brand-navy-700'>
                    +{uploadedDoc.score || uploadedDoc.points_awarded}{' '}
                    {t('applicationStatus.pointsAwarded')}
                  </span>
                )}
                <span className='text-[11px] text-gray-400'>
                  {t('applicationStatus.uploaded')}{' '}
                  {formatDate(uploadedDoc.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderDocGroup = (groupedDocs, isAdditional, inputRef) => {
    if (!groupedDocs || typeof groupedDocs !== 'object') return null
    const heading = isAdditional
      ? t('applicationStatus.additionalDocuments')
      : t('applicationStatus.requiredDocuments')
    const isGrouped = !Array.isArray(groupedDocs)
    if (!isGrouped) {
      if (groupedDocs.length === 0) return null
      return (
        <div className='mb-8 last:mb-0'>
          <p className='text-base font-semibold text-gray-900 mb-4'>
            {heading}
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {groupedDocs.map(d => renderDocItem(d, inputRef))}
          </div>
        </div>
      )
    }
    const categories = Object.keys(groupedDocs)
    if (categories.length === 0) return null
    return (
      <div className='mb-8 last:mb-0'>
        <p className='text-base font-semibold text-gray-900 mb-4'>{heading}</p>
        <div className='space-y-6'>
          {categories.map(cat => (
            <div key={cat}>
              <p className='text-sm text-gray-500 mb-3 font-medium'>
                {localize(cat, groupedDocs[cat][0]?.category_zh)}
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {groupedDocs[cat].map(d => renderDocItem(d, inputRef))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const idValue =
    application.data?.passport_number ||
    application.data?.nric ||
    application.data?.fin ||
    'XXXXXXXX'
  const schemeText =
    application.application_type === 'pr'
      ? t('applicationStatus.schemePr')
      : t('applicationStatus.schemeCitizenship')

  return (
    <div className='pt-24 min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'>

        {/* Action Required banner */}
        {hasMissingDocuments && (
          <div className='mb-6 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5 flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
            <div className='min-w-0'>
              <p className='font-semibold text-red-800'>
                {t('applicationStatus.actionRequiredTitle')}
              </p>
              <p className='text-sm text-red-700 mt-1'>
                {t('applicationStatus.actionRequiredMessage')}
              </p>
              {(() => {
                const missing = allDocumentTypes.filter(d =>
                  missingDocumentIds.some(
                    id =>
                      Number(id) === Number(d.id) || String(id) === String(d.id)
                  )
                )
                if (missing.length === 0) return null
                return (
                  <ul className='mt-3 flex flex-wrap gap-2'>
                    {missing.map(d => {
                      const docDate =
                        application.additional_document_dates?.[d.id] || null
                      return (
                        <li
                          key={d.id}
                          className='inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-800'
                        >
                          {localize(d.name_en, d.name_zh)}
                          {docDate && (
                            <span className='text-red-500'>
                              · {formatDate(docDate)}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )
              })()}
            </div>
          </div>
        )}
        {/* Collection Information Card - Only show when status is approved */}
        {application.status === 'approved' &&
          (() => {
            // Get required additional document type IDs
            const requiredDocumentTypeIds =
              application.additional_documents || []

            // Get submitted additional documents
            const additionalDocuments =
              application.documents?.filter(doc => {
                return doc.document?.type === 'additional'
              }) || []

            // Get submitted document type IDs
            const submittedDocumentTypeIds = additionalDocuments
              .map(doc => doc.document_id)
              .filter(Boolean)

            const hasNoAdditionalDocuments = additionalDocuments.length === 0

            const missingDocumentIds = requiredDocumentTypeIds.filter(
              id =>
                !submittedDocumentTypeIds.some(
                  submittedId =>
                    Number(id) === Number(submittedId) ||
                    String(id) === String(submittedId)
                )
            )

            // Check if any submitted additional documents have pending status
            const hasPendingDocuments = additionalDocuments.some(
              doc =>
                doc.status === 'pending' ||
                doc.status === 'in_review' ||
                doc.status === 'in review'
            )

            // Determine card state based on requirements:
            // 1. If has missing documents (not uploaded): Red with Alert icon + "pendingRequiredDocument"
            // 2. If has pending documents (uploaded but not approved): Green with Check icon + "进行中"
            // 3. If no collection_date/address AND no missing/pending documents: Grey with Clock icon + "提交中"
            // 4. If has collection_date/address AND no missing documents AND no pending documents: Green with Check icon + "已批准"
            const hasCollectionDate = !!application.collection_date
            const hasCollectionAddress = !!application.collection_location
            const hasCollectionInfo =
              hasCollectionDate || hasCollectionAddress
            const hasMissingDocuments = missingDocumentIds.length > 0

            // Special case: No collection info + missing documents + pending documents = InProgress (Green)
            const isInProgressWithBoth =
              !hasCollectionInfo && hasMissingDocuments

            // State 1: Missing documents (not uploaded yet) - Red
            // But not red if we have the special case above
            const isRed = hasMissingDocuments && !isInProgressWithBoth

            // State 3: No collection info and no issues - Grey with "提交中"
            const isGrey =
              !hasCollectionInfo &&
              !hasMissingDocuments &&
              !hasPendingDocuments

            const titleColor = isRed
              ? 'text-red-800'
              : isGrey
                ? 'text-gray-700'
                : 'text-green-800'
            return (
              <div
                className={`mb-6 rounded-lg border-2 p-6 sm:p-7 ${
                  isRed
                    ? 'border-red-200 bg-red-50'
                    : isGrey
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-green-200 bg-green-50'
                }`}
              >
                <div className='mb-5 flex items-center gap-2'>
                  {isGrey ? (
                    <>
                      <Clock className='h-6 w-6 flex-shrink-0 text-gray-600' />
                      <h3
                        className={`text-lg font-bold sm:text-xl ${titleColor}`}
                      >
                        {t('applicationStatus.submitted')}
                      </h3>
                    </>
                  ) : isInProgressWithBoth ? (
                    <>
                      <Loader className='h-6 w-6 flex-shrink-0 text-green-600' />
                      <h3
                        className={`text-lg font-bold sm:text-xl ${titleColor}`}
                      >
                        {t('applicationStatus.inProgress')}
                      </h3>
                    </>
                  ) : !isRed && hasNoAdditionalDocuments ? (
                    <>
                      <CheckCircle className='h-6 w-6 flex-shrink-0 text-green-600' />
                      <h3
                        className={`text-lg font-bold sm:text-xl ${titleColor}`}
                      >
                        {t('applicationStatus.inProgress')}
                      </h3>
                    </>
                  ) : !isRed && !hasNoAdditionalDocuments ? (
                    <>
                      <Loader className='h-6 w-6 flex-shrink-0 text-green-600' />
                      <h3
                        className={`text-lg font-bold sm:text-xl ${titleColor}`}
                      >
                        {t('applicationStatus.inProgress')}
                      </h3>
                    </>
                  ) : (
                    <>
                      <AlertCircle className='h-6 w-6 flex-shrink-0 text-red-600' />
                      <h3
                        className={`text-lg font-bold sm:text-xl ${titleColor}`}
                      >
                        {t('applicationStatus.pendingRequiredDocument')}
                      </h3>
                    </>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  {/* Collection date */}
                  <div className='flex items-start gap-3'>
                    <Calendar className='mt-1 h-4 w-4 flex-shrink-0 text-gray-400' />
                    <div className='min-w-0'>
                      <p className='mb-1 text-xs font-medium uppercase tracking-wide text-gray-500'>
                        {t('applicationStatus.collectionDate')}
                      </p>
                      {application.collection_date ? (
                        <p className='text-base font-semibold text-gray-900'>
                          {new Date(
                            application.collection_date
                          ).toLocaleDateString(
                            currentLanguage === 'zh' ? 'zh-CN' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }
                          )}
                        </p>
                      ) : (
                        <p className='italic text-gray-500'>
                          {t('applicationStatus.toBeAnnounced')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Collection location */}
                  <div className='flex items-start gap-3'>
                    <MapPin className='mt-1 h-4 w-4 flex-shrink-0 text-gray-400' />
                    <div className='min-w-0'>
                      <p className='mb-1 text-xs font-medium uppercase tracking-wide text-gray-500'>
                        {t('applicationStatus.collectionLocation')}
                      </p>
                      {application.collection_location ? (
                        <p className='text-base font-semibold leading-snug text-gray-900'>
                          {application.collection_location}
                        </p>
                      ) : (
                        <p className='italic text-gray-500'>
                          {t('applicationStatus.collectionMessagePending', {
                            type:
                              application.application_type === 'pr'
                                ? t('applicationStatus.pr')
                                : t('applicationStatus.citizenship')
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

        {/* Profile block — identity assessment header */}
        <div className='rounded-md border border-slate-200 bg-white shadow-sm mb-6'>
          <div className='flex flex-wrap lg:flex-nowrap items-start gap-x-5 gap-y-6 lg:gap-7 p-6 sm:p-7'>
            {/* ID photo */}
            <div className='order-1 flex-shrink-0'>
              <div className='flex h-[132px] w-[110px] sm:h-[140px] sm:w-[120px] items-center justify-center overflow-hidden rounded border-2 border-brand-navy-900 bg-gray-200'>
                {application.id_photo ? (
                  <img
                    src={api.getIdPhotoUrl(application.id_photo)}
                    alt='ID photo'
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <User className='h-10 w-10 text-gray-400' />
                )}
              </div>
            </div>

            {/* Identity info */}
            <div className='order-3 w-full min-w-0 lg:order-2 lg:w-auto lg:flex-1'>
              <div className='flex flex-wrap items-center gap-3'>
                <h2 className='text-[22px] font-extrabold uppercase tracking-tight text-brand-navy-900'>
                  {application.full_name ||
                    application.surname ||
                    t('applicationStatus.title')}
                </h2>
                {getInfoStatusBadge(application.status)}
              </div>
              <dl className='mt-2.5 space-y-1 text-[14px] sm:text-[12.5px] text-gray-700'>
                <div className='flex flex-wrap items-baseline gap-x-1.5'>
                  <dt className='font-medium text-gray-500'>
                    {t('applicationStatus.applicationCode')}:
                  </dt>
                  <dd className='font-mono font-semibold text-brand-navy-900'>
                    {application.application_code}
                  </dd>
                  <button
                    type='button'
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        application.application_code
                      )
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1500)
                    }}
                    title={copied ? t('common.copied') : t('common.copy')}
                    aria-label={copied ? t('common.copied') : t('common.copy')}
                    className='ml-0.5 inline-flex items-center justify-center rounded p-0.5 text-gray-400 transition-colors hover:text-brand-navy-700'
                  >
                    {copied ? (
                      <CheckCircle className='h-3.5 w-3.5 text-green-600' />
                    ) : (
                      <Copy className='h-3.5 w-3.5' />
                    )}
                  </button>
                </div>
                <div className='flex items-baseline gap-1.5'>
                  <dt className='font-medium text-gray-500'>
                    {t('applicationStatus.idPassport')}:
                  </dt>
                  <dd className='font-semibold text-brand-navy-900'>{idValue}</dd>
                </div>
                <div className='flex items-baseline gap-1.5'>
                  <dt className='font-medium text-gray-500'>
                    {t('applicationStatus.dateOfAssessment')}:
                  </dt>
                  <dd className='font-semibold text-brand-navy-900'>
                    {formatDate(application.created_at)}
                  </dd>
                </div>
                <div className='flex items-baseline gap-1.5'>
                  <dt className='font-medium text-gray-500'>
                    {t('applicationStatus.assessedBy')}:
                  </dt>
                  <dd className='font-semibold text-brand-navy-900'>
                    {t('applicationStatus.assessedByValue')}
                  </dd>
                </div>
                <div className='flex items-baseline gap-1.5'>
                  <dt className='font-medium text-gray-500'>
                    {t('applicationStatus.applicationType')}:
                  </dt>
                  <dd className='font-semibold uppercase text-brand-navy-900'>
                    {application.application_type}
                  </dd>
                </div>
                <div className='flex flex-wrap items-baseline gap-x-1.5'>
                  <dt className='font-medium text-gray-500'>
                    {t('applicationStatus.scheme')}:
                  </dt>
                  <dd className='font-semibold text-brand-navy-900'>
                    {schemeText}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Score column */}
            {hasScore && (
              <div className='order-2 flex-1 lg:order-3 lg:flex-none lg:min-w-[200px]'>
                <CreditScoreGauge score={score} compact />
              </div>
            )}
          </div>
        </div>

        {/* Applicant details block (disabled)
        {(applicantFields.length > 0 ||
          spouseFields.length > 0 ||
          application.message) && (
          <div className='rounded-md border border-slate-200 bg-white shadow-sm mb-6 p-6 sm:p-7'>
            <span className='inline-block rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 mb-4'>
              {t('applicationStatus.applicantDetails')}
            </span>
            <dl className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5 text-sm'>
              {applicantFields.map((f, i) => (
                <div key={i} className='flex gap-2 min-w-0'>
                  <dt className='shrink-0 text-gray-500'>{f.label}:</dt>
                  <dd
                    className={`min-w-0 truncate font-semibold text-gray-900 ${f.mono ? 'font-mono' : ''}`}
                  >
                    {f.value}
                  </dd>
                </div>
              ))}
              {spouseFields.map((f, i) => (
                <div key={`s-${i}`} className='flex gap-2 min-w-0'>
                  <dt className='shrink-0 text-gray-500'>{f.label}:</dt>
                  <dd className='min-w-0 truncate font-semibold text-gray-900'>
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
            {application.message && (
              <p className='mt-4 text-sm text-gray-700'>
                <span className='text-gray-500'>
                  {t('applicationStatus.additionalMessage')}:
                </span>{' '}
                <span className='italic'>"{application.message}"</span>
              </p>
            )}
          </div>
        )}
        */}

        {/* Outstanding documents requested — categories-style upload panel */}
        {outstandingDocs.length > 0 && (
          <div className='mb-6'>
            <div className='mb-4 flex items-center gap-4'>
              <div className='h-px flex-1 bg-amber-300' />
              <h3 className='flex items-center gap-2 whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.1em] text-amber-900'>
                <span className='inline-block h-2 w-2 animate-pulse rounded-full bg-red-600' />
                {t('applicationStatus.uploadCtaTitle')}
              </h3>
              <div className='h-px flex-1 bg-amber-300' />
            </div>
            <div className='overflow-hidden rounded-md border border-amber-200 bg-amber-50 shadow-sm'>
              {outstandingDocs.map(d => {
                const docDate =
                  application.additional_document_dates?.[d.id] || null
                const isPending = pendingIdSet.has(String(d.id))
                return (
                  <button
                    key={d.id}
                    type='button'
                    onClick={() =>
                      handleDocumentClick(d.id, false, ctaFileInputRef)
                    }
                    disabled={uploading}
                    className='group block w-full border-b border-amber-200 p-5 text-left transition-colors last:border-b-0 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70 sm:px-6'
                  >
                    {/* Title line: icon + name + action */}
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-400'>
                        <FileText className='h-4 w-4 text-white' />
                      </div>
                      <p className='min-w-0 flex-1 text-[15px] font-bold text-amber-950'>
                        {localize(d.name_en, d.name_zh)}
                      </p>
                      {isPending ? (
                        <span className='inline-flex flex-shrink-0 items-center gap-1.5 rounded-md border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900'>
                          <Clock className='h-3.5 w-3.5' />
                          {t('applicationStatus.inReview')}
                        </span>
                      ) : (
                        <span className='inline-flex flex-shrink-0 items-center gap-1.5 rounded-md bg-gray-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-gray-900'>
                          <Upload className='h-4 w-4' />
                          {t('applicationStatus.upload')}
                        </span>
                      )}
                    </div>
                    {/* Description — full width */}
                    {(d.description_en || d.description_zh) && (
                      <p className='mt-2 text-xs leading-relaxed text-amber-800'>
                        {localize(d.description_en, d.description_zh)}
                      </p>
                    )}
                    {docDate && (
                      <span className='mt-2 inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900'>
                        <Calendar className='h-3 w-3' />
                        {t('applicationStatus.requiredDate')}:{' '}
                        {formatDate(docDate)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <input
              ref={ctaFileInputRef}
              type='file'
              accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
              onChange={e => handleFileSelect(e, selectedDocumentType)}
              disabled={uploading}
              className='hidden'
            />
            {uploadError && (
              <div className='mt-3 rounded-lg border border-red-200 bg-red-50 p-3'>
                <p className='text-sm text-red-600'>{uploadError}</p>
              </div>
            )}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2 mb-6'>
            <TabsTrigger value='overview'>
              {t('applicationStatus.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value='breakdown'>
              {t('applicationStatus.documents')}
            </TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW ===== */}
          <TabsContent value='overview' className='space-y-6'>
            {/* Assessment categories — scored from normal document completion */}
            {assessmentCategories.length > 0 && (
              <div>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='h-px flex-1 bg-slate-300' />
                  <h3 className='whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.1em] text-brand-navy-900'>
                    {t('applicationStatus.assessmentCategoriesTitle')}
                  </h3>
                  <div className='h-px flex-1 bg-slate-300' />
                </div>
                <div className='overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm'>
                  {assessmentCategories.map((c, i) => {
                    const Icon = c.Icon
                    return (
                      <div
                        key={i}
                        className='border-b border-slate-200 last:border-b-0'
                      >
                        {/* Icon + name */}
                        <div className='flex items-center gap-4 p-5 sm:px-6'>
                          <div
                            className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full'
                            style={{ backgroundColor: c.iconColor }}
                          >
                            <Icon className='h-4 w-4 text-white' />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-xs font-extrabold uppercase tracking-[0.04em] text-brand-navy-900'>
                              {i + 1}. {localize(c.en, c.zh)}
                            </p>
                            <p className='text-[11px] italic leading-snug text-gray-500'>
                              {localize(c.subEn, c.subZh)}
                            </p>
                          </div>
                        </div>

                        {/* Per-document transaction table */}
                        <div className='border-t border-slate-200 bg-slate-50/60 px-5 pb-4 pt-3 sm:px-6'>
                          <div className='grid grid-cols-[1fr_6rem_4rem] gap-x-3 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500'>
                            <span>{t('applicationStatus.documents')}</span>
                            <span className='text-center'>
                              {t('applicationStatus.status')}
                            </span>
                            <span className='text-right'>
                              {t('applicationStatus.pointsAwarded')}
                            </span>
                          </div>
                          <div className='divide-y divide-slate-100'>
                            {c.documents.slice(0, 3).map(renderCatDocRow)}
                          </div>
                          {c.documents.length > 3 && (
                            <button
                              type='button'
                              onClick={() => setModalCat(c)}
                              className='mt-1 w-full rounded-md py-2 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-navy-700 transition-colors hover:bg-slate-100'
                            >
                              {t('applicationStatus.showAll')} (
                              {c.documents.length})
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}



            {/* Help */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm'>
              <h3 className='font-semibold text-gray-900 mb-2'>
                {t('applicationStatus.needHelp')}
              </h3>
              <p className='text-sm text-gray-600 mb-4'>
                {t('applicationStatus.helpMessage')}
              </p>
              <Link href='/contact'>
                <Button variant='outline'>
                  {t('applicationStatus.contactSupport')}
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* ===== DOCUMENTS ===== */}
          <TabsContent value='breakdown' className='space-y-6'>
            {/* Document upload */}
            <div className='rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm'>
              <h2 className='text-lg font-semibold text-gray-900 mb-6'>
                {t('applicationStatus.documents')}
              </h2>
              {renderDocGroup(
                additionalDocumentTypes,
                true,
                additionalFileInputRef
              )}
              {renderDocGroup(documentTypes, false, fileInputRef)}
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                onChange={e => handleFileSelect(e, selectedDocumentType)}
                disabled={uploading}
                className='hidden'
              />
              <input
                ref={additionalFileInputRef}
                type='file'
                accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                onChange={e => handleFileSelect(e, selectedDocumentType)}
                disabled={uploading}
                className='hidden'
              />
              {uploadError && (
                <div className='mt-4 p-3 rounded-lg bg-red-50 border border-red-200'>
                  <p className='text-sm text-red-600'>{uploadError}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* All-documents modal (from category "Show all") */}
      {modalCat && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'
          onClick={() => setModalCat(null)}
        >
          <div
            className='w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-xl'
            onClick={e => e.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
              <h3 className='text-sm font-extrabold uppercase tracking-[0.04em] text-brand-navy-900'>
                {localize(modalCat.en, modalCat.zh)}
              </h3>
              <button
                type='button'
                onClick={() => setModalCat(null)}
                aria-label='Close'
                className='rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700'
              >
                <X className='h-5 w-5' />
              </button>
            </div>
            <div className='px-5 py-3'>
              <div className='grid grid-cols-[1fr_6rem_4rem] gap-x-3 border-b border-slate-200 pb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-500'>
                <span>{t('applicationStatus.documents')}</span>
                <span className='text-center'>
                  {t('applicationStatus.status')}
                </span>
                <span className='text-right'>
                  {t('applicationStatus.pointsAwarded')}
                </span>
              </div>
              <div className='max-h-[60vh] divide-y divide-slate-100 overflow-y-auto'>
                {modalCat.documents.map(renderCatDocRow)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
