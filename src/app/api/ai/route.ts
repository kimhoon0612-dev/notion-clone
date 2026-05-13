import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })
    
    try {
      await limiter.check(5, session.user.id)
    } catch {
      return new NextResponse("Too Many Requests", { status: 429 })
    }
    
    const { prompt, action } = await req.json()
    
    let systemMessage = "You are a helpful AI writing assistant. Output ONLY the generated text, no markdown wrappers."
    
    if (action === 'summarize') systemMessage += " Summarize the user's text concisely."
    else if (action === 'continue') systemMessage += " Continue writing naturally based on the user's text."
    else if (action === 'fix') systemMessage += " Fix any grammar or spelling mistakes in the user's text, maintaining the original language."
    else if (action === 'translate') systemMessage += " Translate the text to English."
    
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemMessage,
      prompt,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error(err)
    return new NextResponse("Error", { status: 500 })
  }
}
