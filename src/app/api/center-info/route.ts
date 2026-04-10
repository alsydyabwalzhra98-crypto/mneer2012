import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all center info
export async function GET() {
  try {
    const info = await db.centerInfo.findMany({
      orderBy: { section: 'asc' }
    })
    return NextResponse.json(info)
  } catch (error) {
    return NextResponse.json({ error: 'فشل في تحميل البيانات' }, { status: 500 })
  }
}

// POST create new info item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, value, type, section } = body
    if (!key || !value) {
      return NextResponse.json({ error: 'المفتاح والقيمة مطلوبان' }, { status: 400 })
    }
    const info = await db.centerInfo.create({
      data: { key, value, type: type || 'text', section: section || 'عام' }
    })
    return NextResponse.json(info)
  } catch (error) {
    return NextResponse.json({ error: 'فشل في إنشاء العنصر' }, { status: 500 })
  }
}

// PUT update info item
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, key, value, type, section } = body
    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    }
    const info = await db.centerInfo.update({
      where: { id },
      data: { key, value, type, section }
    })
    return NextResponse.json(info)
  } catch (error) {
    return NextResponse.json({ error: 'فشل في تحديث العنصر' }, { status: 500 })
  }
}

// DELETE info item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    }
    await db.centerInfo.delete({ where: { id } })
    return NextResponse.json({ message: 'تم الحذف بنجاح' })
  } catch (error) {
    return NextResponse.json({ error: 'فشل في حذف العنصر' }, { status: 500 })
  }
}
