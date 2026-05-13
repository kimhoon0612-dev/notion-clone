import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password as string, user.password)
        if (!isValid) return null
        return { id: user.id, name: user.name, email: user.email }
      }
    }),
    // Social login providers - configure via .env:
    // GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    // GITHUB_ID, GITHUB_SECRET
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
    ...(process.env.GITHUB_ID ? [GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET!,
    })] : []),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== 'credentials') {
        // Auto-create user for OAuth providers
        const email = user.email
        if (!email) return false
        
        const existing = await prisma.user.findUnique({ where: { email } })
        if (!existing) {
          await prisma.user.create({
            data: {
              email,
              name: user.name || email.split('@')[0],
              password: '', // No password for OAuth users
              provider: account.provider,
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Look up internal user ID
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true }
        })
        token.id = dbUser?.id || user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
