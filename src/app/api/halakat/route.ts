import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all halakat
export async function GET() {
  try {
    const halakat = await db.halaka.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(halakat)
  } catch (error) {
    console.error('Fetch halakat error:', error)
    return NextResponse.json({ error: 'فشل في تحميل الحلقات' }, { status: 500 })
  }
}

// POST create halaka
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, teacher, time, location, branch, description } = body

    if (!name || !teacher) {
      return NextResponse.json(
        { error: 'اسم الحلقة والمعلم مطلوبان' },
        { status: 400 }
      )
    }

    const halaka = await db.halaka.create({
      data: {
        name,
        teacher,
        time: time || '',
        location: location || '',
        branch: branch || 'السرور',
        description
      }
    })

    return NextResponse.json(halaka, { status: 201 })
  } catch (error) {
    console.error('Create halaka error:', error)
    return NextResponse.json({ error: 'فشل في إنشاء الحلقة' }, { status: 500 })
  }
}

// PUT update halaka
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, teacher, time, location, branch, description } = body

    if (!id) {
      return NextResponse.json({ error: 'معرف الحلقة مطلوب' }, { status: 400 })
    }

    const halaka = await db.halaka.update({
      where: { id },
      data: { name, teacher, time, location, branch, description }
    })

    return NextResponse.json(halaka)
  } catch (error) {
    console.error('Update halaka error:', error)
    return NextResponse.json({ error: 'فشل في تحديث الحلقة' }, { status: 500 })
  }
}

// DELETE halaka
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'معرف الحلقة مطلوب' }, { status: 400 })
    }

    await db.halaka.delete({ where: { id } })
    return NextResponse.json({ message: 'تم حذف الحلقة بنجاح' })
  } catch (error) {
    console.error('Delete halaka error:', error)
    return NextResponse.json({ error: 'فشل في حذف الحلقة' }, { status: 500 })
  }
}
