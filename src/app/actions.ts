'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { getCurrentWorkspaceId, getMemberRole } from './workspace-actions'

// --- AUTH ---
export async function registerUser(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: '이미 가입된 이메일입니다' }
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  })
  return { user: { id: user.id, name: user.name, email: user.email } }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: '존재하지 않는 이메일입니다' }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: '비밀번호가 일치하지 않습니다' }
  return { user: { id: user.id, name: user.name, email: user.email } }
}

// --- PAGES ---
export async function createPage(parentId?: string, isBoard: boolean = false, status: string = 'To Do') {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) throw new Error("No workspace selected")
  
  const role = await getMemberRole(session.user.id, workspaceId)
  if (!role || role === 'viewer') throw new Error("Forbidden")

  const newPage = await prisma.page.create({
    data: {
      title: '제목 없음',
      content: '',
      parentId: parentId || null,
      isBoard,
      status,
      ownerId: session.user.id,
      workspaceId,
    },
  })
  revalidatePath('/')
  return newPage
}

export async function getPages() {
  const session = await auth()
  if (!session?.user?.id) return []
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) return []

  return await prisma.page.findMany({
    where: { isDeleted: false, workspaceId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function reorderPages(orderedIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) return
  const workspaceId = await getCurrentWorkspaceId()
  if (!workspaceId) return
  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.page.update({ where: { id, workspaceId }, data: { sortOrder: index } })
    )
  )
  revalidatePath('/')
}

export async function getBoardItems(boardId: string) {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.page.findMany({
    where: { parentId: boardId, isDeleted: false },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getPage(id: string) {
  const session = await auth()
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return null
  
  if (page.isPublic) return page
  if (!session?.user?.id) return null
  
  // Check workspace membership
  if (page.workspaceId) {
    const role = await getMemberRole(session.user.id, page.workspaceId)
    if (role) return page
  }
  
  if (page.ownerId === session.user.id) return page
  return null
}

export async function updatePage(
  id: string,
  data: {
    title?: string
    content?: string
    icon?: string | null
    coverImage?: string | null
    isBoard?: boolean
    status?: string
    priority?: string
    dueDate?: string | null
    isFullWidth?: boolean
    isLocked?: boolean
    properties?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const updated = await prisma.page.update({ 
    where: { id }, 
    data 
  })
  revalidatePath('/')
  return updated
}

export async function deletePage(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.page.delete({ where: { id } })
  revalidatePath('/')
}

export async function softDeletePage(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.page.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
  revalidatePath('/')
}

export async function restorePage(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.page.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  })
  revalidatePath('/')
}

export async function permanentlyDeletePage(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.page.delete({ where: { id } })
  revalidatePath('/')
}

export async function toggleFavorite(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return
  await prisma.page.update({
    where: { id },
    data: { isFavorite: !page.isFavorite },
  })
  revalidatePath('/')
}

export async function getTrashPages() {
  const session = await auth()
  if (!session?.user?.id) return []
  const workspaceId = await getCurrentWorkspaceId()
  return await prisma.page.findMany({
    where: { isDeleted: true, workspaceId: workspaceId || undefined },
    orderBy: { deletedAt: 'desc' },
    select: { id: true, title: true, icon: true, isBoard: true, deletedAt: true },
  })
}

// --- SEARCH ---
export async function searchPages(query: string) {
  const session = await auth()
  if (!session?.user?.id || !query.trim()) return []
  const workspaceId = await getCurrentWorkspaceId()
  return await prisma.page.findMany({
    where: {
      isDeleted: false,
      workspaceId: workspaceId || undefined,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    select: { id: true, title: true, icon: true, isBoard: true },
    take: 10,
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getPageWithAncestors(id: string) {
  const session = await auth()
  if (!session?.user?.id) return []
  const ancestors: { id: string; title: string; icon: string | null }[] = []
  let currentId: string | null = id
  while (currentId) {
    const page = await prisma.page.findUnique({
      where: { id: currentId },
      select: { id: true, title: true, icon: true, parentId: true },
    })
    if (!page) break
    ancestors.unshift(page)
    currentId = page.parentId
  }
  return ancestors
}

// --- COMMENTS ---
export async function addComment(pageId: string, content: string, author: string = '익명') {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const comment = await prisma.comment.create({
    data: { pageId, content, author, userId: session.user.id },
  })
  
  // Create notification for page owner
  const page = await prisma.page.findUnique({ where: { id: pageId }, select: { ownerId: true, title: true } })
  if (page?.ownerId && page.ownerId !== session.user.id) {
    await prisma.notification.create({
      data: {
        type: 'comment',
        message: `${author}님이 "${page.title || '제목 없음'}" 페이지에 댓글을 남겼습니다.`,
        link: `/page/${pageId}`,
        userId: page.ownerId,
        fromUser: session.user.id,
      },
    })
  }
  
  revalidatePath(`/page/${pageId}`)
  return comment
}

export async function getComments(pageId: string) {
  return await prisma.comment.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function deleteComment(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment || comment.userId !== session.user.id) throw new Error("Forbidden")
  await prisma.comment.delete({ where: { id } })
  revalidatePath('/')
}

// --- PAGE HISTORY ---
export async function savePageHistory(pageId: string, title: string, content: string) {
  return await prisma.pageHistory.create({
    data: { pageId, title, content },
  })
}

export async function getPageHistory(pageId: string) {
  return await prisma.pageHistory.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export async function restorePageFromHistory(pageId: string, historyId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const entry = await prisma.pageHistory.findUnique({ where: { id: historyId } })
  if (!entry) return
  await prisma.page.update({
    where: { id: pageId },
    data: { title: entry.title, content: entry.content },
  })
  revalidatePath(`/page/${pageId}`)
}

// --- TEMPLATES ---
export async function createTemplate(name: string, description: string, content: string, icon?: string) {
  return await prisma.template.create({ data: { name, description, content, icon } })
}

export async function getTemplates() {
  return await prisma.template.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function deleteTemplate(id: string) {
  await prisma.template.delete({ where: { id } })
}

export async function createPageFromTemplate(templateId: string, parentId?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const tpl = await prisma.template.findUnique({ where: { id: templateId } })
  if (!tpl) return null
  const workspaceId = await getCurrentWorkspaceId()
  const newPage = await prisma.page.create({
    data: { title: tpl.name, content: tpl.content, icon: tpl.icon, parentId: parentId || null, ownerId: session.user.id, workspaceId },
  })
  revalidatePath('/')
  return newPage
}

// --- SHARING ---
export async function generateShareLink(pageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const link = `share-${pageId.slice(0, 8)}-${Date.now().toString(36)}`
  await prisma.page.update({
    where: { id: pageId },
    data: { isPublic: true, shareLink: link },
  })
  revalidatePath('/')
  return link
}

export async function removeShareLink(pageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await prisma.page.update({
    where: { id: pageId },
    data: { isPublic: false, shareLink: null },
  })
  revalidatePath('/')
}

export async function getPageByShareLink(shareLink: string) {
  return await prisma.page.findUnique({ where: { shareLink } })
}

// --- EXPORT ---
export async function exportPageAsMarkdown(id: string) {
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return null
  let md = `# ${page.title}\n\n`
  let content = page.content
    .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<li[^>]*>(.*?)<\/li>/g, '- $1\n')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, '> $1\n')
    .replace(/<hr[^>]*>/g, '---\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  md += content
  return { title: page.title, markdown: md }
}

export async function exportPageAsHTML(id: string) {
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) return null
  const html = `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><title>${page.title}</title>
<style>body{font-family:Inter,sans-serif;max-width:800px;margin:0 auto;padding:2rem;color:#333}
h1{font-size:2.5rem;font-weight:700}h2{font-size:1.8rem}h3{font-size:1.4rem}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}
code{background:#f5f5f5;padding:2px 6px;border-radius:3px}pre{background:#1a1a1a;color:#fff;padding:1rem;border-radius:8px}
blockquote{border-left:3px solid #ddd;padding-left:1rem;color:#666}</style>
</head><body><h1>${page.title}</h1>${page.content}</body></html>`
  return { title: page.title, html }
}
