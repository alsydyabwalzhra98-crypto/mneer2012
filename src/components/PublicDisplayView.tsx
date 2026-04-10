'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  LogOut,
  Image,
  Info,
  Clock,
  GraduationCap,
  Star,
  ExternalLink,
} from 'lucide-react'

interface PublicStudent {
  name: string
  age: number
  surah: string
  category: string
}

interface PublicHalaka {
  id: string
  name: string
  teacher: string
  branch: string
  _count: { students: number }
  students: PublicStudent[]
}

interface PublicBranch {
  name: string
  halakatCount: number
  studentsCount: number
}

interface PublicMediaImage {
  id: string
  album: string
  filename: string
  url: string
  createdAt: string
}

interface PublicCenterInfo {
  id: string
  key: string
  value: string
  type: string
  section: string
}

interface AttendanceStats {
  present: number
  absent: number
  late: number
  total: number
}

interface PublicData {
  centerName: string
  totalHalakat: number
  totalStudents: number
  totalActivities: number
  halakat: PublicHalaka[]
  branches: PublicBranch[]
  categories: { name: string; count: number }[]
  activities: { id: string; title: string; description?: string; date: string; type: string }[]
  media: PublicMediaImage[]
  centerInfo: PublicCenterInfo[]
  attendanceStats: AttendanceStats
}

const BRANCH_STYLES: Record<string, { bg: string; accent: string; border: string; icon: string }> = {
  وبرة: { bg: 'bg-teal-50', accent: '#0d9488', border: '#99f6e4', icon: '#14b8a6' },
  الوادي: { bg: 'bg-cyan-50', accent: '#0891b2', border: '#a5f3fc', icon: '#06b6d4' },
  السرور: { bg: 'bg-emerald-50', accent: '#059669', border: '#a7f3d0', icon: '#10b981' },
}

const CATEGORY_STYLES: Record<string, string> = {
  '1-10': 'bg-green-100 text-green-700',
  '10-20': 'bg-blue-100 text-blue-700',
  '20-30': 'bg-amber-100 text-amber-700',
  'محو الامية': 'bg-purple-100 text-purple-700',
}

const SECTION_TITLES: Record<string, string> = {
  'عام': 'معلومات عامة',
  'عن المركز': 'عن المركز',
  'أوقات الدوام': 'أوقات الدوام',
  'تواصل': 'تواصل معنا',
}

export default function PublicDisplayView({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<PublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedHalakat, setExpandedHalakat] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'halakat' | 'media' | 'info'>('halakat')

  useEffect(() => {
    fetch('/api/public')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleHalaka = (id: string) => {
    setExpandedHalakat((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Group halakat by branch
  const halakatByBranch = data?.halakat.reduce<Record<string, PublicHalaka[]>>((acc, h) => {
    if (!acc[h.branch]) acc[h.branch] = []
    acc[h.branch].push(h)
    return acc
  }, {}) || {}

  // Group center info by section
  const infoBySection = data?.centerInfo?.reduce<Record<string, PublicCenterInfo[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {}) || {}

  if (loading) return <LoadingSkeleton />

  const tabs = [
    { value: 'halakat' as const, label: 'الحلقات', icon: BookOpen },
    { value: 'media' as const, label: 'الوسائط', icon: Image },
    { value: 'info' as const, label: 'معلومات عامة', icon: Info },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* ── Header ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img src="/center-logo.png" alt="مركز الشفاء" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid #d4af37' }} />
              <div>
                <h1 className="text-base font-bold text-white leading-tight">مركز الشفاء</h1>
                <p className="text-[10px] leading-tight" style={{ color: '#d4af37' }}>لتحفيظ القرآن الكريم</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/30 text-white text-xs bg-white/10">
                العرض العام
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-white hover:bg-white/10 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* ── Hero Banner ─────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ minHeight: '200px' }}>
          <img src="/banner.png" alt="مركز الشفاء" className="w-full h-48 sm:h-64 object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,61,46,0.3), rgba(13,61,46,0.85))' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <img src="/center-logo.png" alt="مركز الشفاء" className="w-20 h-20 rounded-full object-cover mb-3 shadow-lg" style={{ border: '3px solid #d4af37' }} />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-cairo)' }}>
              مركز الشفاء لتحفيظ القرآن الكريم
            </h2>
            <p className="text-white/80 text-sm italic" style={{ fontFamily: 'var(--font-amiri)' }}>
              ﴿ إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ ﴾
            </p>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'الحلقات', value: data?.totalHalakat || 0, icon: BookOpen, color: '#1a5f4a' },
            { label: 'الطلاب', value: data?.totalStudents || 0, icon: Users, color: '#059669' },
            { label: 'حاضرون اليوم', value: data?.attendanceStats?.present || 0, icon: Clock, color: '#0891b2' },
            { label: 'الأنشطة', value: data?.totalActivities || 0, icon: Star, color: '#d97706' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</p>
                    <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ── Branches ─────────────────────────────────── */}
        {data?.branches && data.branches.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <MapPin className="w-5 h-5" style={{ color: '#d4af37' }} />
              الفروع
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.branches.map((branch) => {
                const style = BRANCH_STYLES[branch.name] || BRANCH_STYLES['السرور']
                return (
                  <Card key={branch.name} className="border-0 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: '0.8rem' }}>
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: style.accent + '15' }}>
                        <MapPin className="w-6 h-6" style={{ color: style.icon }} />
                      </div>
                      <h4 className="text-lg font-bold" style={{ color: style.accent }}>{branch.name}</h4>
                      <div className="flex justify-center gap-6 mt-3">
                        <div>
                          <p className="text-xl font-bold" style={{ color: style.accent }}>{branch.halakatCount}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>حلقات</p>
                        </div>
                        <div style={{ width: '1px', backgroundColor: '#e5e7eb' }} />
                        <div>
                          <p className="text-xl font-bold" style={{ color: style.accent }}>{branch.studentsCount}</p>
                          <p className="text-xs" style={{ color: '#6b7280' }}>طالب</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Categories Distribution ──────────────────── */}
        {data?.categories && data.categories.length > 0 && (
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
              توزيع الطلاب حسب الفئة
            </h3>
            <div className="flex flex-wrap gap-3">
              {data.categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_STYLES[cat.name] || 'bg-gray-100 text-gray-700'}`}>
                    {cat.name}
                  </span>
                  <span className="text-lg font-bold" style={{ color: '#1a5f4a' }}>{cat.count}</span>
                  <span className="text-xs" style={{ color: '#6b7280' }}>طالب</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <Separator />

        {/* ── Tab Navigation ───────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? '#1a5f4a' : 'white',
                  color: isActive ? 'white' : '#374151',
                  boxShadow: isActive ? '0 2px 8px rgba(26,95,74,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── Halakat Tab ─────────────────────────────── */}
        {activeTab === 'halakat' && (
          <div className="space-y-6">
            {Object.entries(halakatByBranch).length === 0 ? (
              <div className="text-center py-10" style={{ color: '#9ca3af' }}>
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد حلقات مسجلة بعد</p>
              </div>
            ) : (
              Object.entries(halakatByBranch).map(([branchName, branchHalakat]) => {
                const branchStyle = BRANCH_STYLES[branchName] || BRANCH_STYLES['السرور']
                return (
                  <section key={branchName}>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: branchStyle.accent }}>
                      <div className="w-2 h-6 rounded-full" style={{ backgroundColor: branchStyle.accent }} />
                      فرع {branchName}
                      <Badge variant="outline" className="text-xs mr-2" style={{ borderColor: branchStyle.border, color: branchStyle.accent }}>
                        {branchHalakat.length} حلقات
                      </Badge>
                    </h3>
                    <div className="space-y-3">
                      {branchHalakat.map((halaka) => {
                        const isExpanded = expandedHalakat.has(halaka.id)
                        return (
                          <Card key={halaka.id} className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '0.8rem' }}>
                            <button
                              onClick={() => toggleHalaka(halaka.id)}
                              className="w-full text-right p-4 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: branchStyle.accent + '15' }}>
                                    <GraduationCap className="w-5 h-5" style={{ color: branchStyle.icon }} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm" style={{ color: '#1a5f4a' }}>{halaka.teacher}</h4>
                                    <p className="text-xs" style={{ color: '#6b7280' }}>{halaka.students.length} طالب</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="text-xs" style={{ backgroundColor: branchStyle.accent + '15', color: branchStyle.accent, border: 'none' }}>
                                    {branchName}
                                  </Badge>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" style={{ color: '#6b7280' }} />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" style={{ color: '#6b7280' }} />
                                  )}
                                </div>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-4 pb-4">
                                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr style={{ backgroundColor: '#f9fafb' }}>
                                        <th className="text-right p-2 font-semibold text-xs" style={{ color: '#374151' }}>الاسم</th>
                                        <th className="text-center p-2 font-semibold text-xs" style={{ color: '#374151' }}>العمر</th>
                                        <th className="text-center p-2 font-semibold text-xs" style={{ color: '#374151' }}>السورة</th>
                                        <th className="text-center p-2 font-semibold text-xs" style={{ color: '#374151' }}>الفئة</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {halaka.students.map((student, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                                          <td className="p-2 font-medium" style={{ color: '#1a5f4a' }}>{student.name}</td>
                                          <td className="p-2 text-center" style={{ color: '#6b7280' }}>{student.age}</td>
                                          <td className="p-2 text-center" style={{ color: '#374151' }}>{student.surah}</td>
                                          <td className="p-2 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLES[student.category] || 'bg-gray-100 text-gray-700'}`}>
                                              {student.category}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                    </div>
                  </section>
                )
              })
            )}
          </div>
        )}

        {/* ── Media Tab ───────────────────────────────── */}
        {activeTab === 'media' && (
          <div>
            {(!data?.media || data.media.length === 0) ? (
              <div className="text-center py-10" style={{ color: '#9ca3af' }}>
                <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد صور مرفوعة بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.media.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={img.url}
                        alt={img.album}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-2">
                      <Badge className="text-[10px] w-full justify-center" variant="outline" style={{ borderColor: '#d4af3760', color: '#b8860b' }}>
                        {img.album}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Info Tab ────────────────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {Object.keys(infoBySection).length === 0 ? (
              <div className="text-center py-10" style={{ color: '#9ca3af' }}>
                <Info className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد معلومات عن المركز بعد</p>
              </div>
            ) : (
              Object.entries(infoBySection).map(([section, items]) => (
                <Card key={section} className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
                      <Info className="w-5 h-5" style={{ color: '#d4af37' }} />
                      {SECTION_TITLES[section] || section}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f9fafb' }}>
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#d4af37' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: '#1a5f4a' }}>{item.key}</p>
                            {item.type === 'image' ? (
                              <div className="mt-2">
                                <img src={item.value} alt={item.key} className="max-w-full max-h-48 rounded-lg object-cover" />
                              </div>
                            ) : item.type === 'link' ? (
                              <a
                                href={item.value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm mt-1 flex items-center gap-1 hover:underline"
                                style={{ color: '#0891b2' }}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {item.value}
                              </a>
                            ) : (
                              <p className="text-sm mt-1" style={{ color: '#4b5563' }}>{item.value}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="text-center py-4 text-sm" style={{ backgroundColor: '#1a5f4a', color: 'rgba(255,255,255,0.7)' }}>
        © {new Date().getFullYear()} مركز الشفاء لتحفيظ القرآن الكريم — جميع الحقوق محفوظة
      </footer>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      <nav className="h-14 shadow-lg" style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <Skeleton className="w-full h-64 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  )
}
