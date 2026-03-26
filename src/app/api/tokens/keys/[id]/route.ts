import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 撤销 API Key
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.apiKey.updateMany({
    where: { id: params.id, userId: user.id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
