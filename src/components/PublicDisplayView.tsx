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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Eye,
  Star,
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

interface PublicData {
  centerName: string
  totalHalakat: number
  totalStudents: number
  totalActivities: number
  halakat: PublicHalaka[]
  branches: PublicBranch[]
  categories: { name: string; count: number }[]
  activities: { id: string; title: string; description?: string; date: string; type: string }[]
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

export default function PublicDisplayView({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<PublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedHalakat, setExpandedHalakat] = useState<Set<string>>(new Set())

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

  if (loading) return <LoadingSkeleton />

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* ── Header ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <BookOpen className="w-6 h-6" style={{ color: '#d4af37' }} />
              <div>
                <h1 className="text-base font-bold text-white leading-tight">مركز الشفاء</h1>
                <p className="text-[10px] leading-tight" style={{ color: '#d4af37' }}>لتحفيظ القرآن الكريم</p>
              </div>
            </div>
            <Badge variant="outline" className="border-white/30 text-white text-xs bg-white/10">
              العرض العام
            </Badge>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-8">
        {/* ── Hero Banner ─────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ minHeight: '200px' }}>
          <img src="/banner.png" alt="مركز الشفاء" className="w-full h-48 sm:h-64 object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,61,46,0.3), rgba(13,61,46,0.85))' }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #d4af37, #f4d03f)' }}>
              <GraduationCap className="w-7 h-7" style={{ color: '#0d3d2e' }} />
            </div>
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
            { label: 'الفروع', value: data?.branches?.length || 0, icon: MapPin, color: '#0891b2' },
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

        {/* ── Halakat by Branch ───────────────────────── */}
        {Object.entries(halakatByBranch).map(([branchName, branchHalakat]) => {
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
                      {/* Halaka Header */}
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

                      {/* Expanded Students */}
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
        })}
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
