import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [totalHalakat, totalStudents, totalActivities] = await Promise.all([
      db.halaka.count(),
      db.student.count(),
      db.activity.count(),
    ])

    // Get halakat grouped by branch with student counts
    const halakat = await db.halaka.findMany({
      include: {
        _count: { select: { students: true } },
        students: {
          select: { name: true, age: true, surah: true, category: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { branch: 'asc' },
    })

    // Get branches info
    const branches = await db.halaka.groupBy({
      by: ['branch'],
      _count: { id: true },
    })

    // Get all activities (not just recent)
    const activities = await db.activity.findMany({
      orderBy: { date: 'desc' },
    })

    // Get categories distribution
    const categories = await db.student.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    // Branch student totals
    const halakaWithBranchStudents = await db.halaka.findMany({
      select: { branch: true, students: { select: { id: true } } },
    })

    const branchStudentMap: Record<string, number> = {}
    for (const h of halakaWithBranchStudents) {
      if (!branchStudentMap[h.branch]) branchStudentMap[h.branch] = 0
      branchStudentMap[h.branch] += h.students.length
    }

    const branchData = branches.map((b) => ({
      name: b.branch,
      halakatCount: b._count.id,
      studentsCount: branchStudentMap[b.branch] || 0,
    }))

    // Get ALL media images with album grouping
    const allMedia = await db.mediaImage.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Group media by album
    const albumMap: Record<string, typeof allMedia> = {}
    for (const img of allMedia) {
      if (!albumMap[img.album]) albumMap[img.album] = []
      albumMap[img.album].push(img)
    }
    const albums = Object.entries(albumMap).map(([name, images]) => ({
      name,
      count: images.length,
      images,
    }))

    // Get all center info entries
    const centerInfo = await db.centerInfo.findMany({
      orderBy: { section: 'asc' },
    })

    // Get today's attendance stats
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = await db.attendance.findMany({
      where: { date: today },
      include: {
        student: { select: { name: true } },
        halaka: { select: { name: true, branch: true, teacher: true } },
      },
    })
    const attendanceStats = {
      present: todayAttendance.filter((a) => a.status === 'حاضر').length,
      absent: todayAttendance.filter((a) => a.status === 'غائب').length,
      late: todayAttendance.filter((a) => a.status === 'متأخر').length,
      total: todayAttendance.length,
    }

    // Get attendance per halaka for today
    const attendanceByHalaka: Record<string, {
      halakaName: string
      branch: string
      teacher: string
      present: number
      absent: number
      late: number
      total: number
      records: { studentName: string; status: string; notes?: string }[]
    }> = {}
    for (const a of todayAttendance) {
      const halakaKey = a.halakaId || 'unknown'
      if (!attendanceByHalaka[halakaKey]) {
        attendanceByHalaka[halakaKey] = {
          halakaName: a.halaka?.name || 'غير محدد',
          branch: a.halaka?.branch || '',
          teacher: a.halaka?.teacher || '',
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
          records: [],
        }
      }
      const group = attendanceByHalaka[halakaKey]
      group.total++
      if (a.status === 'حاضر') group.present++
      else if (a.status === 'غائب') group.absent++
      else if (a.status === 'متأخر') group.late++
      group.records.push({
        studentName: a.student?.name || 'غير معروف',
        status: a.status,
        notes: a.notes || undefined,
      })
    }

    // Get total images count
    const totalImages = allMedia.length

    return NextResponse.json({
      centerName: 'مركز الشفاء لتحفيظ القرآن الكريم',
      totalHalakat,
      totalStudents,
      totalActivities,
      totalImages,
      halakat,
      branches: branchData,
      categories: categories.map((c) => ({ name: c.category, count: c._count.id })),
      activities,
      media: allMedia,
      albums,
      centerInfo,
      attendanceStats,
      attendanceByHalaka: Object.values(attendanceByHalaka),
      todayDate: today,
    })
  } catch (error) {
    console.error('Public API error:', error)
    return NextResponse.json({ error: 'فشل في تحميل البيانات' }, { status: 500 })
  }
}
