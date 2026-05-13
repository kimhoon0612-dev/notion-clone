import { LRUCache } from 'lru-cache'

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0]
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1])
        return Promise.resolve()
      }
      
      if (tokenCount[0] >= limit) {
        return Promise.reject()
      }
      
      tokenCache.set(token, [tokenCount[0] + 1])
      return Promise.resolve()
    },
  }
}
