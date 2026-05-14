declare module 'lru-cache' {
  class LRUCache<K = any, V = any> {
    constructor(options?: {
      max?: number
      ttl?: number
      maxSize?: number
      sizeCalculation?: (value: V, key: K) => number
      dispose?: (value: V, key: K) => void
      allowStale?: boolean
      updateAgeOnGet?: boolean
      updateAgeOnHas?: boolean
    })
    
    get(key: K): V | undefined
    set(key: K, value: V, options?: { ttl?: number }): this
    has(key: K): boolean
    delete(key: K): boolean
    clear(): void
    get size(): number
  }

  export { LRUCache }
}
