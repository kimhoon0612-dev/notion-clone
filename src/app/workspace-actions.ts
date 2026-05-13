'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// --- HELPERS ---
export async function getCurrentWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('activeWorkspaceId')?.value
  if (fromCookie) return fromCookie
  
  // Fallback: find user's first workspace
  const session = await auth()
  if (!session?.user?.id) return null
  const first = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    orderBy: { joinedAt: 'asc' },
  })
  return first?.workspaceId || null
}

export async function getMemberRole(userId: string, workspaceId: string): Promise<string | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  return member?.role || null
}

// --- WORKSPACE CRUD ---
export async function createWorkspace(name: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const workspace = await prisma.workspace.create({
    data: {
      name,
      members: {
        create: { userId: session.user.id, role: 'owner' },
      },
    },
  })
  
  // Set as active workspace
  const cookieStore = await cookies()
  cookieStore.set('activeWorkspaceId', workspace.id, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  
  revalidatePath('/')
  return workspace
}

export async function getMyWorkspaces() {
  const session = await auth()
  if (!session?.user?.id) return []
  
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true, pages: true } },
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  })
  
  return memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    icon: m.workspace.icon,
    role: m.role,
    memberCount: m.workspace._count.members,
    pageCount: m.workspace._count.pages,
  }))
}

export async function switchWorkspace(workspaceId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  // Verify membership
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  })
  if (!member) throw new Error("Not a member of this workspace")
  
  const cookieStore = await cookies()
  cookieStore.set('activeWorkspaceId', workspaceId, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  
  revalidatePath('/')
}

export async function updateWorkspace(workspaceId: string, data: { name?: string; icon?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const role = await getMemberRole(session.user.id, workspaceId)
  if (!role || !['owner', 'admin'].includes(role)) throw new Error("Forbidden")
  
  await prisma.workspace.update({ where: { id: workspaceId }, data })
  revalidatePath('/')
}

// --- MEMBER MANAGEMENT ---
export async function getWorkspaceMembers(workspaceId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const role = await getMemberRole(session.user.id, workspaceId)
  if (!role) throw new Error("Not a member")
  
  return await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { joinedAt: 'asc' },
  })
}

export async function inviteMemberByEmail(workspaceId: string, email: string, role: string = 'editor') {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const myRole = await getMemberRole(session.user.id, workspaceId)
  if (!myRole || !['owner', 'admin'].includes(myRole)) throw new Error("Forbidden")
  
  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: '해당 이메일로 가입된 사용자가 없습니다' }
  
  // Check if already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
  })
  if (existing) return { error: '이미 워크스페이스 멤버입니다' }
  
  await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId, role },
  })
  
  revalidatePath('/')
  return { success: true }
}

export async function updateMemberRole(workspaceId: string, memberId: string, newRole: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const myRole = await getMemberRole(session.user.id, workspaceId)
  if (!myRole || !['owner', 'admin'].includes(myRole)) throw new Error("Forbidden")
  
  // Can't change owner role
  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } })
  if (!target) throw new Error("Member not found")
  if (target.role === 'owner') return { error: '소유자의 역할은 변경할 수 없습니다' }
  
  // Admin can't set someone as owner
  if (myRole === 'admin' && newRole === 'owner') return { error: '관리자는 소유자 권한을 부여할 수 없습니다' }
  
  await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: newRole },
  })
  
  revalidatePath('/')
  return { success: true }
}

export async function removeMember(workspaceId: string, memberId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const myRole = await getMemberRole(session.user.id, workspaceId)
  if (!myRole || !['owner', 'admin'].includes(myRole)) throw new Error("Forbidden")
  
  const target = await prisma.workspaceMember.findUnique({ where: { id: memberId } })
  if (!target) return
  if (target.role === 'owner') return { error: '소유자는 제거할 수 없습니다' }
  
  await prisma.workspaceMember.delete({ where: { id: memberId } })
  revalidatePath('/')
  return { success: true }
}

export async function leaveWorkspace(workspaceId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  })
  if (!member) return
  if (member.role === 'owner') return { error: '소유자는 워크스페이스를 떠날 수 없습니다. 먼저 소유자를 변경하세요.' }
  
  await prisma.workspaceMember.delete({ where: { id: member.id } })
  revalidatePath('/')
  return { success: true }
}

// --- INVITE LINKS ---
export async function createInviteLink(workspaceId: string, role: string = 'editor') {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const myRole = await getMemberRole(session.user.id, workspaceId)
  if (!myRole || !['owner', 'admin'].includes(myRole)) throw new Error("Forbidden")
  
  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      role,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })
  
  return invite.code
}

export async function acceptInvite(code: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const invite = await prisma.workspaceInvite.findUnique({ where: { code } })
  if (!invite) return { error: '유효하지 않은 초대 링크입니다' }
  if (invite.usedAt) return { error: '이미 사용된 초대 링크입니다' }
  if (invite.expiresAt && invite.expiresAt < new Date()) return { error: '만료된 초대 링크입니다' }
  
  // Check if already a member
  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: invite.workspaceId } },
  })
  if (existing) return { error: '이미 이 워크스페이스의 멤버입니다', workspaceId: invite.workspaceId }
  
  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: { userId: session.user.id, workspaceId: invite.workspaceId, role: invite.role },
    }),
    prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date(), usedById: session.user.id },
    }),
  ])
  
  // Switch to the new workspace
  const cookieStore = await cookies()
  cookieStore.set('activeWorkspaceId', invite.workspaceId, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  
  revalidatePath('/')
  return { success: true, workspaceId: invite.workspaceId }
}

// --- AUTO-CREATE PERSONAL WORKSPACE ---
export async function ensurePersonalWorkspace(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
  })
  
  if (memberships.length === 0) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user?.name || '내'} 워크스페이스`,
        members: { create: { userId, role: 'owner' } },
      },
    })
    
    // Migrate existing pages to this workspace
    await prisma.page.updateMany({
      where: { ownerId: userId, workspaceId: null },
      data: { workspaceId: workspace.id },
    })
    
    return workspace.id
  }
  
  return memberships[0].workspaceId
}
