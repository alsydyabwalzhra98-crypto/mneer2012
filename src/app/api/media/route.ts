import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

// GET all images
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const album = searchParams.get('album')

    const where: Record<string, unknown> = {}
    if (album) where.album = album

    const images = await db.mediaImage.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json({ error: 'فشل في تحميل الصور' }, { status: 500 })
  }
}

// POST upload image
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const album = formData.get('album') as string
    const file = formData.get('file') as File

    if (!album || !file) {
      return NextResponse.json(
        { error: 'الألبوم والملف مطلوبان' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `${Date.now()}-${file.name}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

    await writeFile(filepath, buffer)

    const image = await db.mediaImage.create({
      data: {
        album,
        filename,
        url: `/uploads/${filename}`
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Upload media error:', error)
    return NextResponse.json({ error: 'فشل في رفع الصورة' }, { status: 500 })
  }
}

// DELETE image
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'معرف الصورة مطلوب' }, { status: 400 })
    }

    const image = await db.mediaImage.findUnique({ where: { id } })
    if (image) {
      const fs = await import('fs/promises')
      try {
        await fs.unlink(path.join(process.cwd(), 'public', image.filename))
      } catch {
        // File might not exist
      }
    }

    await db.mediaImage.delete({ where: { id } })
    return NextResponse.json({ message: 'تم حذف الصورة بنجاح' })
  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json({ error: 'فشل في حذف الصورة' }, { status: 500 })
  }
}
