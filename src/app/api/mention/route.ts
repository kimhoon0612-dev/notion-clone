import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getCurrentWorkspaceId } from '@/app/workspace-actions'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })

  const q = req.nextUrl.searchParams.get('q') || ''
  const workspaceId = await getCurrentWorkspaceId()

  const results: { id: string; label: string; mentionType: string }[] = []

  // Search pages
  const pages = await prisma.page.findMany({
    where: {
      isDeleted: false,
      workspaceId: workspaceId || undefined,
      title: { contains: q, mode: 'insensitive' as any },
    },
    select: { id: true, title: true, icon: true },
    take: 5,
    orderBy: { updatedAt: 'desc' },
  })

  pages.forEach((p) => {
    results.push({
      id: p.id,
      label: `${p.icon || '📄'} ${p.title || '제목 없음'}`,
      mentionType: 'page',
    })
  })

  // Search users in workspace
  if (workspaceId) {
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        user: {
          OR: [
            { name: { contains: q, mode: 'insensitive' as any } },
            { email: { contains: q, mode: 'insensitive' as any } },
          ],
        },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
      take: 5,
    })

    members.forEach((m) => {
      results.push({
        id: m.user.id,
        label: m.user.name || m.user.email,
        mentionType: 'user',
      })
    })
  }

  return NextResponse.json(results)
}
