import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET attendance records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const halakaId = searchParams.get('halakaId')

    const where: Record<string, unknown> = {}
    if (date) where.date = date
    if (halakaId) where.halakaId = halakaId

    const attendance = await db.attendance.findMany({
      where,
      include: { student: true, halaka: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Fetch attendance error:', error)
    return NextResponse.json({ error: 'فشل في تحميل سجل الحضور' }, { status: 500 })
  }
}

// POST save attendance (batch)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, halakaId, records } = body

    if (!date || !records || records.length === 0) {
      return NextResponse.json(
        { error: 'التاريخ وسجل الحضور مطلوبان' },
        { status: 400 }
      )
    }

    const results: unknown[] = []

    for (const record of records) {
      const { studentId, status, notes } = record

      const result = await db.attendance.upsert({
        where: {
          studentId_date: {
            studentId,
            date
          }
        },
        create: {
          date,
          studentId,
          halakaId: halakaId || null,
          status: status || 'حاضر',
          notes: notes || ''
        },
        update: {
          status: status || 'حاضر',
          notes: notes || '',
          halakaId: halakaId || null
        }
      })

      results.push(result)
    }

    return NextResponse.json({ message: 'تم حفظ الحضور بنجاح', count: results.length })
  } catch (error) {
    console.error('Save attendance error:', error)
    return NextResponse.json({ error: 'فشل في حفظ الحضور' }, { status: 500 })
  }
}
