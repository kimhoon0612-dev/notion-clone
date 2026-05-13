import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This can be triggered via a Vercel cron job or manually
export async function GET() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Find and delete pages that are empty, "제목 없음", and haven't been modified in an hour
    const result = await prisma.page.deleteMany({
      where: {
        title: "제목 없음",
        content: "",
        isBoard: false,
        updatedAt: {
          lt: oneHourAgo
        }
      }
    })

    return NextResponse.json({ 
      message: "Cleanup successful", 
      deletedCount: result.count 
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
