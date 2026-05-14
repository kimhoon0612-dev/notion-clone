declare module 'y-websocket' {
  import * as Y from 'yjs'
  
  export class WebsocketProvider {
    constructor(serverUrl: string, roomname: string, doc: Y.Doc, options?: {
      connect?: boolean
      awareness?: any
      params?: Record<string, string>
      WebSocketPolyfill?: any
      resyncInterval?: number
      maxBackoffTime?: number
      disableBc?: boolean
    })
    
    doc: Y.Doc
    awareness: any
    wsconnected: boolean
    wsUnsuccessfulReconnects: number
    synced: boolean
    
    on(event: string, callback: (...args: any[]) => void): void
    off(event: string, callback: (...args: any[]) => void): void
    connect(): void
    disconnect(): void
    destroy(): void
  }
}

declare module 'y-indexeddb' {
  import * as Y from 'yjs'
  
  export class IndexeddbPersistence {
    constructor(name: string, doc: Y.Doc)
    
    synced: boolean
    
    on(event: string, callback: (...args: any[]) => void): void
    off(event: string, callback: (...args: any[]) => void): void
    destroy(): void
    clearData(): Promise<void>
  }
}
