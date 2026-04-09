import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET dashboard stats
export async function GET() {
  try {
    const [totalHalakat, totalStudents, todayAttendance, totalImages, totalActivities] = await Promise.all([
      db.halaka.count(),
      db.student.count(),
      db.attendance.count({
        where: {
          date: new Date().toISOString().split('T')[0]
        }
      }),
      db.mediaImage.count(),
      db.activity.count()
    ])

    const totalPresent = await db.attendance.count({
      where: {
        date: new Date().toISOString().split('T')[0],
        status: 'حاضر'
      }
    })

    const attendancePercent = totalStudents > 0
      ? Math.round((totalPresent / totalStudents) * 100)
      : 0

    const recentStudents = await db.student.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { name: true, createdAt: true }
    })

    const recentHalakat = await db.halaka.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { name: true, createdAt: true }
    })

    const recentActivities = await db.activity.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { title: true, createdAt: true }
    })

    return NextResponse.json({
      totalHalakat,
      totalStudents,
      todayAttendance: attendancePercent,
      totalPresent,
      totalImages,
      totalActivities,
      recentStudents,
      recentHalakat,
      recentActivities
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'فشل في تحميل الإحصائيات' }, { status: 500 })
  }
}
