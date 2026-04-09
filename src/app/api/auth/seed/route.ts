import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const count = await db.admin.count()

    if (count === 0) {
      await db.admin.create({
        data: {
          username: 'admin',
          password: 'admin123',
          name: 'المدير'
        }
      })
    }

    return NextResponse.json({ message: 'Seed completed' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
