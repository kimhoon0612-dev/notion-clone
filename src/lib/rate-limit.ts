type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

// Simple in-memory rate limiter using Map (no external dependency)
const tokenCaches = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(options?: Options) {
  const interval = options?.interval || 60000

  return {
    check: (limit: number, token: string) => {
      const now = Date.now()
      const entry = tokenCaches.get(token)
      
      if (!entry || now > entry.resetAt) {
        tokenCaches.set(token, { count: 1, resetAt: now + interval })
        return Promise.resolve()
      }
      
      if (entry.count >= limit) {
        return Promise.reject()
      }
      
      entry.count++
      return Promise.resolve()
    },
  }
}
