'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import PublicDisplayView from '@/components/PublicDisplayView'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Users,
  ClipboardCheck,
  Camera,
  Calendar,
  LayoutDashboard,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  GraduationCap,
  Clock,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Award,
  Image,
  Info,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
interface Halaka {
  id: string
  name: string
  teacher: string
  time: string
  location: string
  branch: string
  description?: string
  createdAt: string
  _count?: { students: number }
}

interface Student {
  id: string
  name: string
  age?: number
  surah: string
  category: string
  parentName: string
  parentPhone: string
  level: string
  halakaId?: string
  halaka?: Halaka | null
  createdAt: string
}

interface AttendanceRecord {
  id: string
  date: string
  status: string
  notes?: string
  studentId: string
  student?: Student
  halakaId?: string
  halaka?: Halaka | null
}

interface MediaImage {
  id: string
  album: string
  filename: string
  url: string
  createdAt: string
}

interface Activity {
  id: string
  title: string
  description?: string
  date: string
  type: string
  createdAt: string
}

interface CenterInfoItem {
  id: string
  key: string
  value: string
  type: string
  section: string
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  totalHalakat: number
  totalStudents: number
  todayAttendance: number
  totalPresent: number
  totalImages: number
  totalActivities: number
  recentStudents: { name: string; createdAt: string }[]
  recentHalakat: { name: string; createdAt: string }[]
  recentActivities: { title: string; createdAt: string }[]
}

// ── Constants ──────────────────────────────────────────────────
const ALBUMS = [
  'حلقات تحفيظية',
  'سرد قرآني',
  'دورات سنوية',
  'مسابقات سنوية',
  'تكريم',
  'احتفالات خريجين',
  'متميزين',
  'خريجون',
  'أخرى',
]

const LEVELS = ['مبتدئ', 'متوسط', 'متقدم']

const BRANCHES = ['وبرة', 'الوادي', 'السرور']

const CATEGORIES = ['1-10', '10-20', '20-30', 'محو الامية']

const STATUS_COLORS: Record<string, string> = {
  حاضر: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  غائب: 'bg-red-100 text-red-800 border-red-300',
  متأخر: 'bg-amber-100 text-amber-800 border-amber-300',
}

const ACTIVITY_TYPES = ['عامة', 'قرآنية', 'ثقافية', 'رياضية', 'اجتماعية']

const BRANCH_COLORS: Record<string, string> = {
  وبرة: 'bg-teal-100 text-teal-700 border-teal-300',
  الوادي: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  السرور: 'bg-emerald-100 text-emerald-700 border-emerald-300',
}

const CATEGORY_COLORS: Record<string, string> = {
  '1-10': 'bg-green-100 text-green-700',
  '10-20': 'bg-blue-100 text-blue-700',
  '20-30': 'bg-amber-100 text-amber-700',
  'محو الامية': 'bg-purple-100 text-purple-700',
}

const INFO_TYPES = [
  { value: 'text', label: 'نص' },
  { value: 'image', label: 'صورة' },
  { value: 'link', label: 'رابط' },
]

const INFO_SECTIONS = ['عام', 'عن المركز', 'أوقات الدوام', 'تواصل']

// ── Main Component ─────────────────────────────────────────────
export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [currentRole, setCurrentRole] = useState<'admin' | 'viewer' | null>(null)

  // Data states
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [halakat, setHalakat] = useState<Halaka[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [mediaImages, setMediaImages] = useState<MediaImage[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [centerInfoItems, setCenterInfoItems] = useState<CenterInfoItem[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Halaka form
  const [halakaForm, setHalakaForm] = useState({
    name: '',
    teacher: '',
    time: '',
    location: '',
    branch: 'السرور',
    description: '',
  })
  const [editingHalaka, setEditingHalaka] = useState<Halaka | null>(null)
  const [halakaDialogOpen, setHalakaDialogOpen] = useState(false)

  // Student form
  const [studentForm, setStudentForm] = useState({
    name: '',
    age: '',
    surah: '',
    category: '1-10',
    parentName: '',
    parentPhone: '',
    level: 'مبتدئ',
    halakaId: '',
  })
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)

  // Attendance form
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceHalakaId, setAttendanceHalakaId] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState<
    { studentId: string; status: string; notes: string }[]
  >([])

  // Media form
  const [mediaAlbum, setMediaAlbum] = useState('')
  const [mediaFilter, setMediaFilter] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Activity form
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'عامة',
  })
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activityDialogOpen, setActivityDialogOpen] = useState(false)

  // CenterInfo form
  const [centerInfoForm, setCenterInfoForm] = useState({
    key: '',
    value: '',
    type: 'text',
    section: 'عام',
  })
  const [editingCenterInfo, setEditingCenterInfo] = useState<CenterInfoItem | null>(null)
  const [centerInfoDialogOpen, setCenterInfoDialogOpen] = useState(false)

  // ── Auth ────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await fetch('/api/auth/seed')
      } catch {
        // ignore seed errors
      }
      try {
        await fetch('/api/seed-data')
      } catch {
        // ignore seed errors
      }
      const stored = localStorage.getItem('alshifa_auth')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (parsed.role === 'viewer') {
            setCurrentRole('viewer')
          } else {
            setCurrentRole('admin')
          }
        } catch {
          // invalid data, clear it
          localStorage.removeItem('alshifa_auth')
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'خطأ في تسجيل الدخول')
        return
      }
      localStorage.setItem('alshifa_auth', JSON.stringify(data))
      setCurrentRole(data.role || 'admin')
      toast.success(`مرحباً ${data.name}`)
    } catch {
      toast.error('حدث خطأ في الاتصال')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('alshifa_auth')
    setCurrentRole(null)
    setActiveTab('dashboard')
    setUsername('')
    setPassword('')
    toast.success('تم تسجيل الخروج')
  }

  // ── Data Fetchers ──────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        setDashboardStats(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadHalakat = useCallback(async () => {
    try {
      const res = await fetch('/api/halakat')
      if (res.ok) {
        const data = await res.json()
        setHalakat(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadAttendance = useCallback(async (date?: string, halakaId?: string) => {
    try {
      const params = new URLSearchParams()
      if (date) params.set('date', date)
      if (halakaId) params.set('halakaId', halakaId)
      const res = await fetch(`/api/attendance?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setAttendance(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadMedia = useCallback(async (album?: string) => {
    try {
      const params = new URLSearchParams()
      if (album) params.set('album', album)
      const res = await fetch(`/api/media?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setMediaImages(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/activities')
      if (res.ok) {
        const data = await res.json()
        setActivities(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadCenterInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/center-info')
      if (res.ok) {
        const data = await res.json()
        setCenterInfoItems(data)
      }
    } catch {
      // ignore
    }
  }, [])

  const loadAllData = useCallback(async () => {
    setDataLoading(true)
    await Promise.all([
      loadDashboard(),
      loadHalakat(),
      loadStudents(),
      loadMedia(),
      loadActivities(),
      loadCenterInfo(),
    ])
    setDataLoading(false)
  }, [loadDashboard, loadHalakat, loadStudents, loadMedia, loadActivities, loadCenterInfo])

  useEffect(() => {
    if (currentRole === 'admin') {
      loadAllData()
    }
  }, [currentRole, loadAllData])

  // ── CenterInfo CRUD ────────────────────────────────────────
  const createCenterInfo = async () => {
    if (!centerInfoForm.key || !centerInfoForm.value) {
      toast.error('المفتاح والقيمة مطلوبان')
      return
    }
    try {
      const res = await fetch('/api/center-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centerInfoForm),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم إضافة العنصر بنجاح')
      setCenterInfoForm({ key: '', value: '', type: 'text', section: 'عام' })
      loadCenterInfo()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const updateCenterInfo = async () => {
    if (!editingCenterInfo) return
    try {
      const res = await fetch('/api/center-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCenterInfo.id, ...centerInfoForm }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم تحديث العنصر بنجاح')
      setEditingCenterInfo(null)
      setCenterInfoDialogOpen(false)
      setCenterInfoForm({ key: '', value: '', type: 'text', section: 'عام' })
      loadCenterInfo()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const deleteCenterInfo = async (id: string) => {
    try {
      const res = await fetch(`/api/center-info?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم حذف العنصر بنجاح')
      loadCenterInfo()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const openEditCenterInfo = (item: CenterInfoItem) => {
    setEditingCenterInfo(item)
    setCenterInfoForm({
      key: item.key,
      value: item.value,
      type: item.type,
      section: item.section,
    })
    setCenterInfoDialogOpen(true)
  }

  // ── Halaka CRUD ────────────────────────────────────────────
  const createHalaka = async () => {
    if (!halakaForm.name || !halakaForm.teacher) {
      toast.error('اسم الحلقة واسم المعلم مطلوبان')
      return
    }
    try {
      const res = await fetch('/api/halakat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(halakaForm),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم إنشاء الحلقة بنجاح')
      setHalakaForm({ name: '', teacher: '', time: '', location: '', branch: 'السرور', description: '' })
      loadHalakat()
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const updateHalaka = async () => {
    if (!editingHalaka) return
    try {
      const res = await fetch('/api/halakat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingHalaka.id, ...halakaForm }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم تحديث الحلقة بنجاح')
      setEditingHalaka(null)
      setHalakaDialogOpen(false)
      setHalakaForm({ name: '', teacher: '', time: '', location: '', branch: 'السرور', description: '' })
      loadHalakat()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const deleteHalaka = async (id: string) => {
    try {
      const res = await fetch(`/api/halakat?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم حذف الحلقة بنجاح')
      loadHalakat()
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const openEditHalaka = (h: Halaka) => {
    setEditingHalaka(h)
    setHalakaForm({
      name: h.name,
      teacher: h.teacher,
      time: h.time,
      location: h.location,
      branch: h.branch || 'السرور',
      description: h.description || '',
    })
    setHalakaDialogOpen(true)
  }

  // ── Student CRUD ───────────────────────────────────────────
  const createStudent = async () => {
    if (!studentForm.name) {
      toast.error('اسم الطالب مطلوب')
      return
    }
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم إضافة الطالب بنجاح')
      setStudentForm({ name: '', age: '', surah: '', category: '1-10', parentName: '', parentPhone: '', level: 'مبتدئ', halakaId: '' })
      loadStudents()
      loadHalakat()
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const updateStudent = async () => {
    if (!editingStudent) return
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingStudent.id, ...studentForm }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم تحديث بيانات الطالب بنجاح')
      setEditingStudent(null)
      setStudentDialogOpen(false)
      setStudentForm({ name: '', age: '', surah: '', category: '1-10', parentName: '', parentPhone: '', level: 'مبتدئ', halakaId: '' })
      loadStudents()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم حذف الطالب بنجاح')
      loadStudents()
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const openEditStudent = (s: Student) => {
    setEditingStudent(s)
    setStudentForm({
      name: s.name,
      age: s.age?.toString() || '',
      surah: s.surah || '',
      category: s.category || '1-10',
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      level: s.level,
      halakaId: s.halakaId || '',
    })
    setStudentDialogOpen(true)
  }

  // ── Attendance ─────────────────────────────────────────────
  useEffect(() => {
    if (currentRole === 'admin' && activeTab === 'attendance') {
      loadAttendance(attendanceDate, attendanceHalakaId || undefined)
    }
  }, [currentRole, activeTab, attendanceDate, attendanceHalakaId, loadAttendance])

  useEffect(() => {
    if (currentRole === 'admin' && activeTab === 'attendance' && attendanceHalakaId) {
      const halakaStudents = students.filter((s) => s.halakaId === attendanceHalakaId)
      const existingMap = new Map(attendance.map((a) => [a.studentId, a]))
      const records = halakaStudents.map((s) => ({
        studentId: s.id,
        status: existingMap.get(s.id)?.status || 'حاضر',
        notes: existingMap.get(s.id)?.notes || '',
      }))
      setAttendanceRecords(records)
    } else {
      setAttendanceRecords([])
    }
  }, [attendanceHalakaId, students, attendance, currentRole, activeTab])

  const updateAttendanceRecord = (studentId: string, field: 'status' | 'notes', value: string) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, [field]: value } : r))
    )
  }

  const saveAttendance = async () => {
    if (attendanceRecords.length === 0) {
      toast.error('لا يوجد طلاب لتسجيل الحضور')
      return
    }
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceDate,
          halakaId: attendanceHalakaId,
          records: attendanceRecords,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      const data = await res.json()
      toast.success(`تم حفظ الحضور بنجاح (${data.count} سجل)`)
      loadAttendance(attendanceDate, attendanceHalakaId || undefined)
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  // ── Media CRUD ─────────────────────────────────────────────
  useEffect(() => {
    if (currentRole === 'admin') {
      loadMedia(mediaFilter || undefined)
    }
  }, [currentRole, mediaFilter, loadMedia])

  const uploadMedia = async () => {
    if (!mediaAlbum || !mediaFile) {
      toast.error('الألبوم والملف مطلوبان')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('album', mediaAlbum)
      formData.append('file', mediaFile)
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم رفع الصورة بنجاح')
      setMediaAlbum('')
      setMediaFile(null)
      const fileInput = document.getElementById('media-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      loadMedia(mediaFilter || undefined)
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    } finally {
      setUploading(false)
    }
  }

  const deleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم حذف الصورة بنجاح')
      loadMedia(mediaFilter || undefined)
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  // ── Activity CRUD ──────────────────────────────────────────
  const createActivity = async () => {
    if (!activityForm.title || !activityForm.date) {
      toast.error('عنوان النشاط والتاريخ مطلوبان')
      return
    }
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityForm),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم إنشاء النشاط بنجاح')
      setActivityForm({ title: '', description: '', date: '', type: 'عامة' })
      loadActivities()
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const updateActivity = async () => {
    if (!editingActivity) return
    try {
      const res = await fetch('/api/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingActivity.id, ...activityForm }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم تحديث النشاط بنجاح')
      setEditingActivity(null)
      setActivityDialogOpen(false)
      setActivityForm({ title: '', description: '', date: '', type: 'عامة' })
      loadActivities()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const deleteActivity = async (id: string) => {
    try {
      const res = await fetch(`/api/activities?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'خطأ')
        return
      }
      toast.success('تم حذف النشاط بنجاح')
      loadActivities()
      loadDashboard()
    } catch {
      toast.error('خطأ في الاتصال')
    }
  }

  const openEditActivity = (a: Activity) => {
    setEditingActivity(a)
    setActivityForm({
      title: a.title,
      description: a.description || '',
      date: a.date,
      type: a.type,
    })
    setActivityDialogOpen(true)
  }

  // ── Helper: formatDate ─────────────────────────────────────
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // ── Loading Screen ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center space-y-4">
          <img src="/center-logo.png" alt="مركز الشفاء" className="w-16 h-16 mx-auto rounded-full object-cover" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  // ── VIEWER MODE (Public Display) ───────────────────────────
  if (currentRole === 'viewer') {
    return <PublicDisplayView onLogout={handleLogout} />
  }

  // ── LOGIN VIEW ─────────────────────────────────────────────
  if (currentRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
        <Card className="w-full max-w-md shadow-2xl border-0" style={{ borderRadius: '1.2rem' }}>
          <CardHeader className="text-center pb-2 pt-8">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
              <img src="/center-logo.png" alt="مركز الشفاء" className="w-full h-full object-cover" />
            </div>
            <CardTitle className="text-3xl font-bold" style={{ color: '#1a5f4a', fontFamily: 'var(--font-cairo)' }}>
              مركز الشفاء
            </CardTitle>
            <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
              لوحة التحكم الإدارية المتكاملة
            </p>
            <Separator className="my-4" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold" style={{ color: '#1a5f4a' }}>
                  اسم المستخدم
                </Label>
                <Input
                  id="username"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 text-right"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#1a5f4a' }}>
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-right"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#0d3d2e',
                  border: 'none',
                }}
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
            <div className="mt-5 p-3 rounded-lg text-center" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-xs font-semibold" style={{ color: '#166534' }}>بيانات الدخول:</p>
              <p className="text-xs mt-1" style={{ color: '#15803d' }}>المدير: admin / admin123</p>
              <p className="text-xs" style={{ color: '#15803d' }}>العرض العام: public / public123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── MAIN APP VIEW (Admin) ──────────────────────────────────
  const navTabs = [
    { value: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { value: 'halakat', label: 'الحلقات', icon: BookOpen },
    { value: 'students', label: 'الطلاب', icon: Users },
    { value: 'attendance', label: 'الحضور', icon: ClipboardCheck },
    { value: 'media', label: 'الوسائط', icon: Camera },
    { value: 'activities', label: 'الأنشطة', icon: Calendar },
    { value: 'centerinfo', label: 'معلومات المركز', icon: Info },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8f9fa' }}>
      {/* ── Navbar ────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img src="/center-logo.png" alt="مركز الشفاء" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid #d4af37' }} />
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-cairo)' }}>
                مركز الشفاء
              </h1>
              <span className="text-white/60">|</span>
              <span className="text-white/80 text-sm">لوحة التحكم</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Users className="w-4 h-4 text-white/80" />
                <span className="text-white text-sm">المدير</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/10 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>
          {/* Navigation tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.value
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? 'rgba(212,175,55,0.25)' : 'transparent',
                    color: isActive ? '#d4af37' : 'rgba(255,255,255,0.7)',
                    borderBottom: isActive ? '2px solid #d4af37' : '2px solid transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={dashboardStats}
            dataLoading={dataLoading}
            onNavigate={setActiveTab}
            formatDate={formatDate}
          />
        )}

        {/* Halakat Tab */}
        {activeTab === 'halakat' && (
          <HalakatTab
            halakat={halakat}
            halakaForm={halakaForm}
            setHalakaForm={setHalakaForm}
            editingHalaka={editingHalaka}
            halakaDialogOpen={halakaDialogOpen}
            setHalakaDialogOpen={setHalakaDialogOpen}
            onCreate={createHalaka}
            onUpdate={updateHalaka}
            onDelete={deleteHalaka}
            onEdit={openEditHalaka}
          />
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <StudentsTab
            students={students}
            halakat={halakat}
            studentForm={studentForm}
            setStudentForm={setStudentForm}
            editingStudent={editingStudent}
            studentDialogOpen={studentDialogOpen}
            setStudentDialogOpen={setStudentDialogOpen}
            onCreate={createStudent}
            onUpdate={updateStudent}
            onDelete={deleteStudent}
            onEdit={openEditStudent}
          />
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            halakat={halakat}
            students={students}
            attendanceDate={attendanceDate}
            setAttendanceDate={setAttendanceDate}
            attendanceHalakaId={attendanceHalakaId}
            setAttendanceHalakaId={setAttendanceHalakaId}
            attendanceRecords={attendanceRecords}
            updateAttendanceRecord={updateAttendanceRecord}
            onSave={saveAttendance}
          />
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <MediaTab
            mediaAlbum={mediaAlbum}
            setMediaAlbum={setMediaAlbum}
            mediaFilter={mediaFilter}
            setMediaFilter={setMediaFilter}
            mediaFile={mediaFile}
            setMediaFile={setMediaFile}
            uploading={uploading}
            mediaImages={mediaImages}
            onUpload={uploadMedia}
            onDelete={deleteMedia}
          />
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <ActivitiesTab
            activities={activities}
            activityForm={activityForm}
            setActivityForm={setActivityForm}
            editingActivity={editingActivity}
            activityDialogOpen={activityDialogOpen}
            setActivityDialogOpen={setActivityDialogOpen}
            onCreate={createActivity}
            onUpdate={updateActivity}
            onDelete={deleteActivity}
            onEdit={openEditActivity}
            formatDate={formatDate}
          />
        )}

        {/* Center Info Tab */}
        {activeTab === 'centerinfo' && (
          <CenterInfoTab
            items={centerInfoItems}
            form={centerInfoForm}
            setForm={setCenterInfoForm}
            editingItem={editingCenterInfo}
            dialogOpen={centerInfoDialogOpen}
            setDialogOpen={setCenterInfoDialogOpen}
            onCreate={createCenterInfo}
            onUpdate={updateCenterInfo}
            onDelete={deleteCenterInfo}
            onEdit={openEditCenterInfo}
          />
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        className="text-center py-4 text-sm"
        style={{ backgroundColor: '#1a5f4a', color: 'rgba(255,255,255,0.7)' }}
      >
        © {new Date().getFullYear()} مركز الشفاء لتحفيظ القرآن الكريم — جميع الحقوق محفوظة
      </footer>
    </div>
  )
}

// ── Dashboard Tab Component ────────────────────────────────────
function DashboardTab({
  stats,
  dataLoading,
  onNavigate,
  formatDate,
}: {
  stats: DashboardStats | null
  dataLoading: boolean
  onNavigate: (tab: string) => void
  formatDate: (s: string) => string
}) {
  const statCards = stats
    ? [
        {
          label: 'الحلقات',
          value: stats.totalHalakat,
          icon: BookOpen,
          color: '#1a5f4a',
          bg: 'bg-emerald-50',
          tab: 'halakat',
        },
        {
          label: 'الطلاب',
          value: stats.totalStudents,
          icon: Users,
          color: '#2563eb',
          bg: 'bg-blue-50',
          tab: 'students',
        },
        {
          label: 'نسبة الحضور',
          value: `${stats.todayAttendance}%`,
          icon: ClipboardCheck,
          color: '#d97706',
          bg: 'bg-amber-50',
          tab: 'attendance',
        },
        {
          label: 'الصور المرفوعة',
          value: stats.totalImages,
          icon: Camera,
          color: '#dc2626',
          bg: 'bg-red-50',
          tab: 'media',
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)', borderRadius: '1rem' }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ border: '2px solid #d4af37' }}>
              <img src="/center-logo.png" alt="مركز الشفاء" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">مرحباً بك في مركز الشفاء</h2>
              <p className="text-white/70 text-sm mt-1">نظام إدارة مراكز تحفيظ القرآن الكريم المتكامل</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat Cards */}
      {dataLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <Card
                key={card.label}
                className={`border-0 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] ${card.bg}`}
                style={{ borderRadius: '0.8rem' }}
                onClick={() => onNavigate(card.tab)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#6b7280' }}>
                        {card.label}
                      </p>
                      <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>
                        {card.value}
                      </p>
                    </div>
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: card.color + '15' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <Star className="w-5 h-5" style={{ color: '#d4af37' }} />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'إضافة حلقة', tab: 'halakat', icon: Plus },
              { label: 'إضافة طالب', tab: 'students', icon: Users },
              { label: 'تسجيل حضور', tab: 'attendance', icon: ClipboardCheck },
              { label: 'رفع صور', tab: 'media', icon: Camera },
              { label: 'إضافة نشاط', tab: 'activities', icon: Calendar },
              { label: 'إحصائيات', tab: 'dashboard', icon: TrendingUp },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  onClick={() => onNavigate(action.tab)}
                  className="h-auto py-3 flex-col gap-2 border-dashed hover:border-solid transition-all"
                  style={{ borderColor: '#1a5f4a40', borderRadius: '0.6rem' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#1a5f4a' }} />
                  <span className="text-xs font-medium" style={{ color: '#1a5f4a' }}>
                    {action.label}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <RefreshCw className="w-5 h-5" style={{ color: '#d4af37' }} />
            آخر التحديثات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-3">
              {stats.recentStudents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>
                    آخر الطلاب المسجلين
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.recentStudents.map((s, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs py-1 px-3"
                        style={{ borderColor: '#1a5f4a30', color: '#1a5f4a' }}
                      >
                        <Users className="w-3 h-3 ml-1" />
                        {s.name} — {formatDate(s.createdAt)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {stats.recentHalakat.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>
                    آخر الحلقات المضافة
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.recentHalakat.map((h, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs py-1 px-3"
                        style={{ borderColor: '#d4af3760', color: '#b8860b' }}
                      >
                        <BookOpen className="w-3 h-3 ml-1" />
                        {h.name} — {formatDate(h.createdAt)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {stats.recentActivities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>
                    آخر الأنشطة
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.recentActivities.map((a, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs py-1 px-3"
                        style={{ borderColor: '#dc262630', color: '#dc2626' }}
                      >
                        <Calendar className="w-3 h-3 ml-1" />
                        {a.title} — {formatDate(a.createdAt)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {stats.recentStudents.length === 0 && stats.recentHalakat.length === 0 && stats.recentActivities.length === 0 && (
                <div className="text-center py-8" style={{ color: '#9ca3af' }}>
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد تحديثات بعد. ابدأ بإضافة بيانات المركز!</p>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Halakat Tab Component ──────────────────────────────────────
function HalakatTab({
  halakat,
  halakaForm,
  setHalakaForm,
  editingHalaka,
  halakaDialogOpen,
  setHalakaDialogOpen,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
}: {
  halakat: Halaka[]
  halakaForm: { name: string; teacher: string; time: string; location: string; branch: string; description: string }
  setHalakaForm: (f: { name: string; teacher: string; time: string; location: string; branch: string; description: string }) => void
  editingHalaka: Halaka | null
  halakaDialogOpen: boolean
  setHalakaDialogOpen: (o: boolean) => void
  onCreate: () => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onEdit: (h: Halaka) => void
}) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <Plus className="w-5 h-5" style={{ color: '#d4af37' }} />
            إضافة حلقة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم الحلقة *</Label>
              <Input
                placeholder="مثال: حلقة حفظ الجزء الثلاثين"
                value={halakaForm.name}
                onChange={(e) => setHalakaForm({ ...halakaForm, name: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم المعلم *</Label>
              <Input
                placeholder="اسم المعلم"
                value={halakaForm.teacher}
                onChange={(e) => setHalakaForm({ ...halakaForm, teacher: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الفرع</Label>
              <Select
                value={halakaForm.branch}
                onValueChange={(v) => setHalakaForm({ ...halakaForm, branch: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الوقت</Label>
              <Input
                placeholder="مثال: 4:00 - 6:00 مساءً"
                value={halakaForm.time}
                onChange={(e) => setHalakaForm({ ...halakaForm, time: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>المكان</Label>
              <Input
                placeholder="مثال: المصلى الرئيسي"
                value={halakaForm.location}
                onChange={(e) => setHalakaForm({ ...halakaForm, location: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>وصف (اختياري)</Label>
              <Input
                placeholder="وصف مختصر للحلقة"
                value={halakaForm.description}
                onChange={(e) => setHalakaForm({ ...halakaForm, description: e.target.value })}
                className="text-right"
              />
            </div>
          </div>
          <Button
            onClick={onCreate}
            className="mt-4 font-semibold shadow-md"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0d3d2e',
            }}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة الحلقة
          </Button>
        </CardContent>
      </Card>

      {/* Halakat List */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold" style={{ color: '#1a5f4a' }}>
            قائمة الحلقات ({halakat.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {halakat.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#9ca3af' }}>
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد حلقات مسجلة بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
                    <TableHead className="text-white font-semibold text-sm">الحلقة</TableHead>
                    <TableHead className="text-white font-semibold text-sm">المعلم</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden md:table-cell">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> الوقت</span>
                    </TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden lg:table-cell">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> المكان</span>
                    </TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden sm:table-cell">الفرع</TableHead>
                    <TableHead className="text-white font-semibold text-sm">الطلاب</TableHead>
                    <TableHead className="text-white font-semibold text-sm text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {halakat.map((h) => (
                    <TableRow key={h.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold text-sm">{h.name}</TableCell>
                      <TableCell className="text-sm">{h.teacher}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{h.time || '-'}</TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">{h.location || '-'}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={`text-xs ${BRANCH_COLORS[h.branch] || ''}`}>
                          {h.branch || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs" style={{ color: '#1a5f4a', borderColor: '#1a5f4a40' }}>
                          {h._count?.students || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(h)}
                            className="h-8 w-8 p-0"
                            style={{ color: '#d4af37' }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه الحلقة؟')) onDelete(h.id)
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Halaka Dialog */}
      <Dialog open={halakaDialogOpen} onOpenChange={setHalakaDialogOpen}>
        <DialogContent className="sm:max-w-lg" style={{ borderRadius: '0.8rem' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <Pencil className="w-5 h-5" style={{ color: '#d4af37' }} />
              تعديل الحلقة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم الحلقة *</Label>
              <Input
                value={halakaForm.name}
                onChange={(e) => setHalakaForm({ ...halakaForm, name: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم المعلم *</Label>
              <Input
                value={halakaForm.teacher}
                onChange={(e) => setHalakaForm({ ...halakaForm, teacher: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>الفرع</Label>
                <Select
                  value={halakaForm.branch}
                  onValueChange={(v) => setHalakaForm({ ...halakaForm, branch: v })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>الوقت</Label>
                <Input
                  value={halakaForm.time}
                  onChange={(e) => setHalakaForm({ ...halakaForm, time: e.target.value })}
                  className="text-right"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>المكان</Label>
              <Input
                value={halakaForm.location}
                onChange={(e) => setHalakaForm({ ...halakaForm, location: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>وصف</Label>
              <Textarea
                value={halakaForm.description}
                onChange={(e) => setHalakaForm({ ...halakaForm, description: e.target.value })}
                className="text-right"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onUpdate}
                className="flex-1 font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#0d3d2e',
                }}
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                onClick={() => setHalakaDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Students Tab Component ─────────────────────────────────────
function StudentsTab({
  students,
  halakat,
  studentForm,
  setStudentForm,
  editingStudent,
  studentDialogOpen,
  setStudentDialogOpen,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
}: {
  students: Student[]
  halakat: Halaka[]
  studentForm: { name: string; age: string; surah: string; category: string; parentName: string; parentPhone: string; level: string; halakaId: string }
  setStudentForm: (f: { name: string; age: string; surah: string; category: string; parentName: string; parentPhone: string; level: string; halakaId: string }) => void
  editingStudent: Student | null
  studentDialogOpen: boolean
  setStudentDialogOpen: (o: boolean) => void
  onCreate: () => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onEdit: (s: Student) => void
}) {
  const levelBadgeColors: Record<string, string> = {
    مبتدئ: 'bg-emerald-100 text-emerald-700',
    متوسط: 'bg-blue-100 text-blue-700',
    متقدم: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-6">
      {/* Add Student Form */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <Plus className="w-5 h-5" style={{ color: '#d4af37' }} />
            إضافة طالب جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم الطالب *</Label>
              <Input
                placeholder="الاسم الثلاثي"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>العمر</Label>
              <Input
                placeholder="العمر بالسنوات"
                type="number"
                value={studentForm.age}
                onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>السورة</Label>
              <Input
                placeholder="مثال: النبأ، الملك"
                value={studentForm.surah}
                onChange={(e) => setStudentForm({ ...studentForm, surah: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الفئة</Label>
              <Select
                value={studentForm.category}
                onValueChange={(v) => setStudentForm({ ...studentForm, category: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>المستوى</Label>
              <Select
                value={studentForm.level}
                onValueChange={(v) => setStudentForm({ ...studentForm, level: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم ولي الأمر</Label>
              <Input
                placeholder="اسم ولي الأمر"
                value={studentForm.parentName}
                onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> رقم هاتف ولي الأمر
                </span>
              </Label>
              <Input
                placeholder="05XXXXXXXX"
                value={studentForm.parentPhone}
                onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الحلقة</Label>
              <Select
                value={studentForm.halakaId}
                onValueChange={(v) => setStudentForm({ ...studentForm, halakaId: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الحلقة" />
                </SelectTrigger>
                <SelectContent>
                  {halakat.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={onCreate}
            className="mt-4 font-semibold shadow-md"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0d3d2e',
            }}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة الطالب
          </Button>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold" style={{ color: '#1a5f4a' }}>
            قائمة الطلاب ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#9ca3af' }}>
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد طلاب مسجلين بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
                    <TableHead className="text-white font-semibold text-sm">الطالب</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden sm:table-cell">العمر</TableHead>
                    <TableHead className="text-white font-semibold text-sm">الفئة</TableHead>
                    <TableHead className="text-white font-semibold text-sm">المستوى</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden md:table-cell">السورة</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden lg:table-cell">ولي الأمر</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden xl:table-cell">الحلقة</TableHead>
                    <TableHead className="text-white font-semibold text-sm text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold text-sm">{s.name}</TableCell>
                      <TableCell className="text-sm hidden sm:table-cell">{s.age || '-'}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${CATEGORY_COLORS[s.category] || ''}`}>
                          {s.category || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${levelBadgeColors[s.level] || ''}`}>
                          {s.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{s.surah || '-'}</TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">
                        <div>
                          <p>{s.parentName || '-'}</p>
                          <p className="text-xs" style={{ color: '#9ca3af' }}>{s.parentPhone || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm hidden xl:table-cell">
                        <Badge variant="outline" className="text-xs" style={{ color: '#1a5f4a', borderColor: '#1a5f4a40' }}>
                          {s.halaka?.name || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(s)}
                            className="h-8 w-8 p-0"
                            style={{ color: '#d4af37' }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) onDelete(s.id)
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="sm:max-w-lg" style={{ borderRadius: '0.8rem' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <Pencil className="w-5 h-5" style={{ color: '#d4af37' }} />
              تعديل بيانات الطالب
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم الطالب *</Label>
              <Input
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>العمر</Label>
                <Input
                  type="number"
                  value={studentForm.age}
                  onChange={(e) => setStudentForm({ ...studentForm, age: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>السورة</Label>
                <Input
                  placeholder="مثال: النبأ"
                  value={studentForm.surah}
                  onChange={(e) => setStudentForm({ ...studentForm, surah: e.target.value })}
                  className="text-right"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>الفئة</Label>
                <Select
                  value={studentForm.category}
                  onValueChange={(v) => setStudentForm({ ...studentForm, category: v })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>المستوى</Label>
                <Select
                  value={studentForm.level}
                  onValueChange={(v) => setStudentForm({ ...studentForm, level: v })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اسم ولي الأمر</Label>
              <Input
                value={studentForm.parentName}
                onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>رقم هاتف ولي الأمر</Label>
              <Input
                value={studentForm.parentPhone}
                onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الحلقة</Label>
              <Select
                value={studentForm.halakaId}
                onValueChange={(v) => setStudentForm({ ...studentForm, halakaId: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الحلقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون حلقة</SelectItem>
                  {halakat.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onUpdate}
                className="flex-1 font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#0d3d2e',
                }}
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                onClick={() => setStudentDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Attendance Tab Component ───────────────────────────────────
function AttendanceTab({
  halakat,
  students,
  attendanceDate,
  setAttendanceDate,
  attendanceHalakaId,
  setAttendanceHalakaId,
  attendanceRecords,
  updateAttendanceRecord,
  onSave,
}: {
  halakat: Halaka[]
  students: Student[]
  attendanceDate: string
  setAttendanceDate: (d: string) => void
  attendanceHalakaId: string
  setAttendanceHalakaId: (id: string) => void
  attendanceRecords: { studentId: string; status: string; notes: string }[]
  updateAttendanceRecord: (studentId: string, field: 'status' | 'notes', value: string) => void
  onSave: () => void
}) {
  const filteredStudents = students.filter((s) => s.halakaId === attendanceHalakaId)

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <ClipboardCheck className="w-5 h-5" style={{ color: '#d4af37' }} />
            تسجيل الحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>التاريخ</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الحلقة</Label>
              <Select value={attendanceHalakaId} onValueChange={setAttendanceHalakaId}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الحلقة" />
                </SelectTrigger>
                <SelectContent>
                  {halakat.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} — {h.teacher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {attendanceHalakaId && (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold" style={{ color: '#1a5f4a' }}>
                قائمة الطلاب — الحضور ({filteredStudents.length} طالب)
              </CardTitle>
              <Button
                onClick={onSave}
                className="font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#0d3d2e',
                }}
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ الحضور
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-10" style={{ color: '#9ca3af' }}>
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا يوجد طلاب في هذه الحلقة</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
                      <TableHead className="text-white font-semibold text-sm w-8">#</TableHead>
                      <TableHead className="text-white font-semibold text-sm">اسم الطالب</TableHead>
                      <TableHead className="text-white font-semibold text-sm text-center">الحالة</TableHead>
                      <TableHead className="text-white font-semibold text-sm hidden md:table-cell">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, idx) => {
                      const record = attendanceRecords.find((r) => r.studentId === student.id)
                      const status = record?.status || 'حاضر'
                      return (
                        <TableRow key={student.id} className="hover:bg-gray-50">
                          <TableCell className="text-sm text-gray-400">{idx + 1}</TableCell>
                          <TableCell className="font-semibold text-sm">{student.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {['حاضر', 'غائب', 'متأخر'].map((s) => (
                                <Button
                                  key={s}
                                  variant={status === s ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() =>
                                    updateAttendanceRecord(student.id, 'status', s)
                                  }
                                  className={`text-xs h-8 px-3 ${
                                    status !== s
                                      ? 'border-gray-200 text-gray-600 hover:border-gray-400'
                                      : STATUS_COLORS[s] + ' border font-semibold'
                                  }`}
                                  style={
                                    status !== s
                                      ? {}
                                      : { backgroundColor: 'transparent', color: 'inherit' }
                                  }
                                >
                                  {s}
                                </Button>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Input
                              placeholder="ملاحظات..."
                              value={record?.notes || ''}
                              onChange={(e) =>
                                updateAttendanceRecord(student.id, 'notes', e.target.value)
                              }
                              className="text-right h-8 text-sm"
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Media Tab Component ────────────────────────────────────────
function MediaTab({
  mediaAlbum,
  setMediaAlbum,
  mediaFilter,
  setMediaFilter,
  mediaFile,
  setMediaFile,
  uploading,
  mediaImages,
  onUpload,
  onDelete,
}: {
  mediaAlbum: string
  setMediaAlbum: (a: string) => void
  mediaFilter: string
  setMediaFilter: (f: string) => void
  mediaFile: File | null
  setMediaFile: (f: File | null) => void
  uploading: boolean
  mediaImages: MediaImage[]
  onUpload: () => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <Upload className="w-5 h-5" style={{ color: '#d4af37' }} />
            رفع صورة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الألبوم *</Label>
              <Select value={mediaAlbum} onValueChange={setMediaAlbum}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر الألبوم" />
                </SelectTrigger>
                <SelectContent>
                  {ALBUMS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>اختر الصورة *</Label>
              <Input
                id="media-file"
                type="file"
                accept="image/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="text-right"
              />
            </div>
          </div>
          <Button
            onClick={onUpload}
            disabled={uploading}
            className="mt-4 font-semibold shadow-md"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0d3d2e',
            }}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري الرفع...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                رفع الصورة
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: '#1a5f4a' }}>
              <Image className="w-4 h-4 inline ml-1" />
              تصفية حسب الألبوم:
            </span>
            <Button
              variant={mediaFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMediaFilter('')}
              className={
                mediaFilter === ''
                  ? 'text-xs'
                  : 'text-xs border-gray-200 text-gray-600'
              }
              style={
                mediaFilter === ''
                  ? { backgroundColor: '#1a5f4a', color: 'white' }
                  : {}
              }
            >
              الكل
            </Button>
            {ALBUMS.map((a) => (
              <Button
                key={a}
                variant={mediaFilter === a ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMediaFilter(a)}
                className={
                  mediaFilter === a
                    ? 'text-xs'
                    : 'text-xs border-gray-200 text-gray-600'
                }
                style={
                  mediaFilter === a
                    ? { backgroundColor: '#1a5f4a', color: 'white' }
                    : {}
                }
              >
                {a}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold" style={{ color: '#1a5f4a' }}>
            معرض الصور ({mediaImages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mediaImages.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#9ca3af' }}>
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد صور مرفوعة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-lg overflow-hidden shadow-sm border hover:shadow-md transition-all"
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
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-2">
                    <Badge className="text-xs bg-white/90 text-gray-800 mb-1">{img.album}</Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 w-full text-xs"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) onDelete(img.id)
                      }}
                    >
                      <Trash2 className="w-3 h-3 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Activities Tab Component ───────────────────────────────────
function ActivitiesTab({
  activities,
  activityForm,
  setActivityForm,
  editingActivity,
  activityDialogOpen,
  setActivityDialogOpen,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
  formatDate,
}: {
  activities: Activity[]
  activityForm: { title: string; description: string; date: string; type: string }
  setActivityForm: (f: { title: string; description: string; date: string; type: string }) => void
  editingActivity: Activity | null
  activityDialogOpen: boolean
  setActivityDialogOpen: (o: boolean) => void
  onCreate: () => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onEdit: (a: Activity) => void
  formatDate: (s: string) => string
}) {
  const typeBadgeColors: Record<string, string> = {
    عامة: 'bg-gray-100 text-gray-700',
    قرآنية: 'bg-emerald-100 text-emerald-700',
    ثقافية: 'bg-blue-100 text-blue-700',
    رياضية: 'bg-amber-100 text-amber-700',
    اجتماعية: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <Plus className="w-5 h-5" style={{ color: '#d4af37' }} />
            إضافة نشاط جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>عنوان النشاط *</Label>
              <Input
                placeholder="عنوان النشاط"
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>التاريخ *</Label>
              <Input
                type="date"
                value={activityForm.date}
                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>النوع</Label>
              <Select
                value={activityForm.type}
                onValueChange={(v) => setActivityForm({ ...activityForm, type: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الوصف</Label>
              <Input
                placeholder="وصف مختصر للنشاط"
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                className="text-right"
              />
            </div>
          </div>
          <Button
            onClick={onCreate}
            className="mt-4 font-semibold shadow-md"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0d3d2e',
            }}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة النشاط
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold" style={{ color: '#1a5f4a' }}>
            قائمة الأنشطة ({activities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-10" style={{ color: '#9ca3af' }}>
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا توجد أنشطة مسجلة بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
              <Table>
                <TableHeader>
                  <TableRow style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
                    <TableHead className="text-white font-semibold text-sm">النشاط</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden sm:table-cell">النوع</TableHead>
                    <TableHead className="text-white font-semibold text-sm">التاريخ</TableHead>
                    <TableHead className="text-white font-semibold text-sm hidden md:table-cell">الوصف</TableHead>
                    <TableHead className="text-white font-semibold text-sm text-center">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((a) => (
                    <TableRow key={a.id} className="hover:bg-gray-50">
                      <TableCell className="font-semibold text-sm">{a.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={`text-xs ${typeBadgeColors[a.type] || ''}`}>
                          {a.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(a.date)}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell max-w-xs truncate">
                        {a.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(a)}
                            className="h-8 w-8 p-0"
                            style={{ color: '#d4af37' }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) onDelete(a.id)
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-lg" style={{ borderRadius: '0.8rem' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <Pencil className="w-5 h-5" style={{ color: '#d4af37' }} />
              تعديل النشاط
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>عنوان النشاط *</Label>
              <Input
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>التاريخ *</Label>
                <Input
                  type="date"
                  value={activityForm.date}
                  onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>النوع</Label>
                <Select
                  value={activityForm.type}
                  onValueChange={(v) => setActivityForm({ ...activityForm, type: v })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>الوصف</Label>
              <Textarea
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                className="text-right"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onUpdate}
                className="flex-1 font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#0d3d2e',
                }}
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                onClick={() => setActivityDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Center Info Tab Component ──────────────────────────────────
function CenterInfoTab({
  items,
  form,
  setForm,
  editingItem,
  dialogOpen,
  setDialogOpen,
  onCreate,
  onUpdate,
  onDelete,
  onEdit,
}: {
  items: CenterInfoItem[]
  form: { key: string; value: string; type: string; section: string }
  setForm: (f: { key: string; value: string; type: string; section: string }) => void
  editingItem: CenterInfoItem | null
  dialogOpen: boolean
  setDialogOpen: (o: boolean) => void
  onCreate: () => void
  onUpdate: () => void
  onDelete: (id: string) => void
  onEdit: (item: CenterInfoItem) => void
}) {
  const typeBadgeColors: Record<string, string> = {
    text: 'bg-gray-100 text-gray-700',
    image: 'bg-emerald-100 text-emerald-700',
    link: 'bg-cyan-100 text-cyan-700',
  }

  const typeLabels: Record<string, string> = {
    text: 'نص',
    image: 'صورة',
    link: 'رابط',
  }

  // Group items by section
  const itemsBySection = items.reduce<Record<string, CenterInfoItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Add Form */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
            <Plus className="w-5 h-5" style={{ color: '#d4af37' }} />
            إضافة معلومة جديدة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>المفتاح *</Label>
              <Input
                placeholder="مثال: رقم الهاتف"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>القيمة *</Label>
              <Input
                placeholder={form.type === 'image' ? 'رابط الصورة' : form.type === 'link' ? 'الرابط' : 'النص'}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>النوع</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INFO_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>القسم</Label>
              <Select
                value={form.section}
                onValueChange={(v) => setForm({ ...form, section: v })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INFO_SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={onCreate}
            className="mt-4 font-semibold shadow-md"
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0d3d2e',
            }}
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة
          </Button>
        </CardContent>
      </Card>

      {/* Info List by Section */}
      {Object.entries(itemsBySection).map(([section, sectionItems]) => (
        <Card key={section} className="border-0 shadow-sm" style={{ borderRadius: '0.8rem' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <Info className="w-5 h-5" style={{ color: '#d4af37' }} />
              {section} ({sectionItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sectionItems.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#9ca3af' }}>لا توجد معلومات في هذا القسم</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#e5e7eb' }}>
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: 'linear-gradient(135deg, #1a5f4a, #0d3d2e)' }}>
                      <TableHead className="text-white font-semibold text-sm">المفتاح</TableHead>
                      <TableHead className="text-white font-semibold text-sm">القيمة</TableHead>
                      <TableHead className="text-white font-semibold text-sm hidden sm:table-cell">النوع</TableHead>
                      <TableHead className="text-white font-semibold text-sm text-center">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-semibold text-sm">{item.key}</TableCell>
                        <TableCell className="text-sm max-w-xs">
                          {item.type === 'image' ? (
                            <div className="flex items-center gap-2">
                              <img src={item.value} alt={item.key} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                              <span className="truncate text-xs" style={{ color: '#6b7280' }}>{item.value}</span>
                            </div>
                          ) : (
                            <span className="truncate">{item.value}</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={`text-xs ${typeBadgeColors[item.type] || ''}`}>
                            {typeLabels[item.type] || item.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(item)}
                              className="h-8 w-8 p-0"
                              style={{ color: '#d4af37' }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) onDelete(item.id)
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <div className="text-center py-10" style={{ color: '#9ca3af' }}>
          <Info className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">لا توجد معلومات عن المركز بعد</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg" style={{ borderRadius: '0.8rem' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#1a5f4a' }}>
              <Pencil className="w-5 h-5" style={{ color: '#d4af37' }} />
              تعديل المعلومة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>المفتاح *</Label>
              <Input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm" style={{ color: '#1a5f4a' }}>القيمة *</Label>
              <Textarea
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="text-right"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>النوع</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INFO_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm" style={{ color: '#1a5f4a' }}>القسم</Label>
                <Select
                  value={form.section}
                  onValueChange={(v) => setForm({ ...form, section: v })}
                >
                  <SelectTrigger className="text-right">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INFO_SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onUpdate}
                className="flex-1 font-semibold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#0d3d2e',
                }}
              >
                <Save className="w-4 h-4 ml-1" />
                حفظ التعديلات
              </Button>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
