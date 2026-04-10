import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const count = await db.admin.count()

    if (count === 0) {
      await db.admin.create({
        data: {
          username: 'Am2026',
          password: 'A777A777',
          name: 'المدير'
        }
      })
    }

    // Seed public viewer
    const publicCount = await db.admin.count({ where: { username: 'Hi' } })
    if (publicCount === 0) {
      await db.admin.create({
        data: { username: 'Hi', password: 'Hi123', name: 'العرض العام' }
      })
    }

    return NextResponse.json({ message: 'Seed completed' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
