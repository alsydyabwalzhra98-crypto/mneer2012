'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
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
  ClipboardCheck,
  Calendar,
  X,
  FolderOpen,
  UserCheck,
  UserX,
  AlertCircle,
  ZoomIn,
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

interface PublicAlbum {
  name: string
  count: number
  images: PublicMediaImage[]
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

interface AttendanceGroup {
  halakaName: string
  branch: string
  teacher: string
  present: number
  absent: number
  late: number
  total: number
  records: { studentName: string; status: string; notes?: string }[]
}

interface PublicData {
  centerName: string
  totalHalakat: number
  totalStudents: number
  totalActivities: number
  totalImages: number
  halakat: PublicHalaka[]
  branches: PublicBranch[]
  categories: { name: string; count: number }[]
  activities: { id: string; title: string; description?: string; date: string; type: string }[]
  media: PublicMediaImage[]
  albums: PublicAlbum[]
  centerInfo: PublicCenterInfo[]
  attendanceStats: AttendanceStats
  attendanceByHalaka: AttendanceGroup[]
  todayDate: string
}

const BRANCH_STYLES: Record<string, { bg: string; accent: string; border: string; icon: string }> = {
  السرور: { bg: 'bg-emerald-50', accent: '#059669', border: '#a7f3d0', icon: '#10b981' },
  'المركز العام': { bg: 'bg-amber-50', accent: '#d97706', border: '#fde68a', icon: '#f59e0b' },
  الوادي: { bg: 'bg-cyan-50', accent: '#0891b2', border: '#a5f3fc', icon: '#06b6d4' },
  وبرة: { bg: 'bg-teal-50', accent: '#0d9488', border: '#99f6e4', icon: '#14b8a6' },
  ضية: { bg: 'bg-rose-50', accent: '#e11d48', border: '#fecdd3', icon: '#f43f5e' },
  المنعم: { bg: 'bg-violet-50', accent: '#7c3aed', border: '#ddd6fe', icon: '#8b5cf6' },
}

const CATEGORY_STYLES: Record<string, string> = {
  '1-10': 'bg-green-100 text-green-700',
  '10-20': 'bg-blue-100 text-blue-700',
  '20-30': 'bg-amber-100 text-amber-700',
  '30-20': 'bg-orange-100 text-orange-700',
  'محو الامية': 'bg-purple-100 text-purple-700',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof UserCheck }> = {
  'حاضر': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: UserCheck },
  'غائب': { bg: 'bg-red-50', text: 'text-red-700', icon: UserX },
  'متأخر': { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle },
}

const SECTION_TITLES: Record<string, string> = {
  'عام': 'معلومات عامة',
  'عن المركز': 'عن المركز',
  'أوقات الدوام': 'أوقات الدوام',
  'تواصل': 'تواصل معنا',
}

const ACTIVITY_TYPE_STYLES: Record<string, string> = {
  'عامة': 'bg-gray-100 text-gray-700 border-gray-300',
  'قرآنية': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'ثقافية': 'bg-blue-100 text-blue-700 border-blue-300',
  'رياضية': 'bg-amber-100 text-amber-700 border-amber-300',
  'اجتماعية': 'bg-purple-100 text-purple-700 border-purple-300',
}

export default function PublicDisplayView({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<PublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedHalakat, setExpandedHalakat] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'halakat' | 'media' | 'attendance' | 'activities' | 'info'>('halakat')
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<{ url: string; album: string } | null>(null)

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

  const filteredMedia = selectedAlbum
    ? data?.albums?.find(a => a.name === selectedAlbum)?.images || []
    : data?.media || []

  const tabs = [
    { value: 'halakat' as const, label: 'الحلقات', icon: BookOpen },
    { value: 'media' as const, label: `الوسائط${data?.totalImages ? ` (${data.totalImages})` : ''}`, icon: Image },
    { value: 'attendance' as const, label: 'الحضور', icon: ClipboardCheck },
    { value: 'activities' as const, label: `الأنشطة${data?.totalActivities ? ` (${data.totalActivities})` : ''}`, icon: Calendar },
    { value: 'info' as const, label: 'عن المركز', icon: Info },
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'الحلقات', value: data?.totalHalakat || 0, icon: BookOpen, color: '#1a5f4a' },
            { label: 'الطلاب', value: data?.totalStudents || 0, icon: Users, color: '#059669' },
            { label: 'حاضرون اليوم', value: data?.attendanceStats?.present || 0, icon: Clock, color: '#0891b2' },
            { label: 'الوسائط', value: data?.totalImages || 0, icon: Image, color: '#dc2626' },
            { label: 'الأنشطة', value: data?.totalActivities || 0, icon: Star, color: '#d97706' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
                <CardContent className="p-3 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.color + '15' }}>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: '#6b7280' }}>{stat.label}</p>
                    <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
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
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setSelectedAlbum(null) }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
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
              <EmptyState icon={BookOpen} message="لا توجد حلقات مسجلة بعد" />
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
                                  <div className="overflow-x-auto">
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
                                            <td className="p-2 font-medium whitespace-nowrap" style={{ color: '#1a5f4a' }}>{student.name}</td>
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
          <div className="space-y-4">
            {/* Album filter buttons */}
            {data?.albums && data.albums.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: !selectedAlbum ? '#1a5f4a' : '#f3f4f6',
                    color: !selectedAlbum ? 'white' : '#374151',
                  }}
                >
                  <Image className="w-3.5 h-3.5" />
                  الكل
                </button>
                {data.albums.map((album) => (
                  <button
                    key={album.name}
                    onClick={() => setSelectedAlbum(selectedAlbum === album.name ? null : album.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: selectedAlbum === album.name ? '#1a5f4a' : '#f3f4f6',
                      color: selectedAlbum === album.name ? 'white' : '#374151',
                    }}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    {album.name}
                    <Badge className="text-[10px] px-1.5 py-0" style={{ backgroundColor: selectedAlbum === album.name ? 'rgba(255,255,255,0.2)' : '#e5e7eb', color: selectedAlbum === album.name ? 'white' : '#6b7280', border: 'none' }}>
                      {album.count}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {filteredMedia.length === 0 ? (
              <EmptyState icon={Image} message="لا توجد صور مرفوعة بعد" />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredMedia.map((img) => (
                  <div
                    key={img.id}
                    className="rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all cursor-pointer group"
                    style={{ borderColor: '#e5e7eb' }}
                    onClick={() => setPreviewImage({ url: img.url, album: img.album })}
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      <img
                        src={img.url}
                        alt={img.album}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
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

        {/* ── Attendance Tab ──────────────────────────── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Today's stats summary */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
                  <ClipboardCheck className="w-5 h-5" style={{ color: '#d4af37' }} />
                  حضور اليوم — {data?.todayDate || new Date().toISOString().split('T')[0]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#ecfdf5' }}>
                    <UserCheck className="w-6 h-6 mx-auto mb-1" style={{ color: '#059669' }} />
                    <p className="text-2xl font-bold" style={{ color: '#059669' }}>{data?.attendanceStats?.present || 0}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>حاضر</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#fef2f2' }}>
                    <UserX className="w-6 h-6 mx-auto mb-1" style={{ color: '#dc2626' }} />
                    <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{data?.attendanceStats?.absent || 0}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>غائب</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                    <AlertCircle className="w-6 h-6 mx-auto mb-1" style={{ color: '#d97706' }} />
                    <p className="text-2xl font-bold" style={{ color: '#d97706' }}>{data?.attendanceStats?.late || 0}</p>
                    <p className="text-xs" style={{ color: '#6b7280' }}>متأخر</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance per halaka */}
            {(!data?.attendanceByHalaka || data.attendanceByHalaka.length === 0) ? (
              <EmptyState icon={ClipboardCheck} message="لا يوجد سجل حضور لليوم" />
            ) : (
              <div className="space-y-4">
                {data.attendanceByHalaka.map((group, idx) => {
                  const branchStyle = BRANCH_STYLES[group.branch] || BRANCH_STYLES['السرور']
                  return (
                    <Card key={idx} className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '0.8rem' }}>
                      <div className="p-4" style={{ backgroundColor: branchStyle.accent + '08' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" style={{ color: branchStyle.accent }} />
                            <div>
                              <h4 className="font-bold text-sm" style={{ color: branchStyle.accent }}>{group.halakaName}</h4>
                              <p className="text-xs" style={{ color: '#6b7280' }}>{group.teacher} — {group.branch}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className="text-xs" style={{ backgroundColor: '#ecfdf5', color: '#059669', border: 'none' }}>
                              {group.present} حاضر
                            </Badge>
                            <Badge className="text-xs" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: 'none' }}>
                              {group.absent} غائب
                            </Badge>
                            <Badge className="text-xs" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: 'none' }}>
                              {group.late} متأخر
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                  <th className="text-right p-2 font-semibold text-xs" style={{ color: '#374151' }}>اسم الطالب</th>
                                  <th className="text-center p-2 font-semibold text-xs" style={{ color: '#374151' }}>الحالة</th>
                                  <th className="text-center p-2 font-semibold text-xs" style={{ color: '#374151' }}>ملاحظات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.records.map((record, i) => {
                                  const statusStyle = STATUS_STYLES[record.status] || STATUS_STYLES['حاضر']
                                  const StatusIcon = statusStyle.icon
                                  return (
                                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                                      <td className="p-2 font-medium whitespace-nowrap" style={{ color: '#1a5f4a' }}>{record.studentName}</td>
                                      <td className="p-2 text-center">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                          <StatusIcon className="w-3 h-3" />
                                          {record.status}
                                        </span>
                                      </td>
                                      <td className="p-2 text-center text-xs" style={{ color: '#6b7280' }}>{record.notes || '—'}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Activities Tab ──────────────────────────── */}
        {activeTab === 'activities' && (
          <div className="space-y-4">
            {(!data?.activities || data.activities.length === 0) ? (
              <EmptyState icon={Calendar} message="لا توجد أنشطة مسجلة بعد" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.activities.map((activity) => (
                  <Card key={activity.id} className="border-0 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: '0.8rem' }}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d4af3715' }}>
                          <Star className="w-5 h-5" style={{ color: '#d4af37' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm mb-1" style={{ color: '#1a5f4a' }}>{activity.title}</h4>
                          {activity.description && (
                            <p className="text-xs mb-2 line-clamp-2" style={{ color: '#6b7280' }}>{activity.description}</p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="text-[10px]" variant="outline" style={{ borderColor: ACTIVITY_TYPE_STYLES[activity.type]?.split(' ')[2] || '#e5e7eb', color: ACTIVITY_TYPE_STYLES[activity.type]?.split(' ')[1] || '#6b7280' }}>
                              {activity.type}
                            </Badge>
                            <span className="text-[11px] flex items-center gap-1" style={{ color: '#9ca3af' }}>
                              <Clock className="w-3 h-3" />
                              {activity.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Info Tab ────────────────────────────────── */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {Object.keys(infoBySection).length === 0 ? (
              <EmptyState icon={Info} message="لا توجد معلومات عن المركز بعد" />
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

      {/* ── Image Preview Dialog ────────────────────────── */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-2 border-0" style={{ borderRadius: '1rem' }}>
          <DialogTitle className="sr-only">معاينة الصورة</DialogTitle>
          <div className="relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {previewImage && (
              <img
                src={previewImage.url}
                alt={previewImage.album}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
            {previewImage && (
              <div className="p-2 text-center">
                <Badge variant="outline" style={{ borderColor: '#d4af3760', color: '#b8860b' }}>
                  {previewImage.album}
                </Badge>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="text-center py-4 text-sm" style={{ backgroundColor: '#1a5f4a', color: 'rgba(255,255,255,0.7)' }}>
        © {new Date().getFullYear()} مركز الشفاء لتحفيظ القرآن الكريم — جميع الحقوق محفوظة
      </footer>
    </div>
  )
}

function EmptyState({ icon: Icon, message }: { icon: typeof BookOpen; message: string }) {
  return (
    <div className="text-center py-10" style={{ color: '#9ca3af' }}>
      <Icon className="w-12 h-12 mx-auto mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      <nav className="h-14 shadow-lg" style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <Skeleton className="w-full h-64 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
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
