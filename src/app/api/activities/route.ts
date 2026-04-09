import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all activities
export async function GET() {
  try {
    const activities = await db.activity.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Fetch activities error:', error)
    return NextResponse.json({ error: 'فشل في تحميل الأنشطة' }, { status: 500 })
  }
}

// POST create activity
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, date, type } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: 'عنوان النشاط والتاريخ مطلوبان' },
        { status: 400 }
      )
    }

    const activity = await db.activity.create({
      data: {
        title,
        description,
        date,
        type: type || 'عامة'
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json({ error: 'فشل في إنشاء النشاط' }, { status: 500 })
  }
}

// PUT update activity
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, description, date, type } = body

    if (!id) {
      return NextResponse.json({ error: 'معرف النشاط مطلوب' }, { status: 400 })
    }

    const activity = await db.activity.update({
      where: { id },
      data: { title, description, date, type }
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Update activity error:', error)
    return NextResponse.json({ error: 'فشل في تحديث النشاط' }, { status: 500 })
  }
}

// DELETE activity
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'معرف النشاط مطلوب' }, { status: 400 })
    }

    await db.activity.delete({ where: { id } })
    return NextResponse.json({ message: 'تم حذف النشاط بنجاح' })
  } catch (error) {
    console.error('Delete activity error:', error)
    return NextResponse.json({ error: 'فشل في حذف النشاط' }, { status: 500 })
  }
}
