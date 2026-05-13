'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

export async function updateProfile(name: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  })
  return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) throw new Error("User not found")
  
  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) return { error: '현재 비밀번호가 올바르지 않습니다' }
  
  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })
  return { success: true }
}
