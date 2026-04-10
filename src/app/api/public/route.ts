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

    // Get recent activities
    const activities = await db.activity.findMany({
      take: 6,
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

    // Get recent media images (take 12)
    const media = await db.mediaImage.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
    })

    // Get all center info entries
    const centerInfo = await db.centerInfo.findMany({
      orderBy: { section: 'asc' },
    })

    // Get today's attendance stats
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = await db.attendance.findMany({
      where: { date: today },
    })
    const attendanceStats = {
      present: todayAttendance.filter((a) => a.status === 'حاضر').length,
      absent: todayAttendance.filter((a) => a.status === 'غائب').length,
      late: todayAttendance.filter((a) => a.status === 'متأخر').length,
      total: todayAttendance.length,
    }

    return NextResponse.json({
      centerName: 'مركز الشفاء لتحفيظ القرآن الكريم',
      totalHalakat,
      totalStudents,
      totalActivities,
      halakat,
      branches: branchData,
      categories: categories.map((c) => ({ name: c.category, count: c._count.id })),
      activities,
      media,
      centerInfo,
      attendanceStats,
    })
  } catch (error) {
    console.error('Public API error:', error)
    return NextResponse.json({ error: 'فشل في تحميل البيانات' }, { status: 500 })
  }
}
