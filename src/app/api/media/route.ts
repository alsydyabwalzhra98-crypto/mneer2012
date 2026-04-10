import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET all images (grouped by album info)
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

    // Get album summary if no specific album filter
    if (!album) {
      const albums = await db.mediaImage.groupBy({
        by: ['album'],
        _count: { id: true },
        orderBy: { album: 'asc' },
      })
      return NextResponse.json({ images, albums })
    }

    return NextResponse.json({ images, albums: [] })
  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json({ error: 'فشل في تحميل الصور' }, { status: 500 })
  }
}

// POST upload image — stores as base64 in DB for cloud compatibility
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

    // Convert to base64 data URL for cloud storage
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    const filename = `${Date.now()}-${file.name}`

    // Also save locally for faster access
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)
    } catch {
      // Local save might fail in some environments, base64 in DB is the primary storage
    }

    const image = await db.mediaImage.create({
      data: {
        album,
        filename,
        url: dataUrl
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
      try {
        const { unlink } = await import('fs/promises')
        await unlink(path.join(process.cwd(), 'public', 'uploads', image.filename))
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
