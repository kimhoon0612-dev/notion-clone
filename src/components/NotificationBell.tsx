'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, MessageSquare, AtSign, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Notification = {
  id: string
  type: string
  message: string
  link: string | null
  isRead: boolean
  fromUser: string | null
  createdAt: string
}

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        setNotifications(await res.json())
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  const markRead = async (id?: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { id } : { readAll: true }),
    })
    fetchNotifications()
  }

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markRead(n.id)
    if (n.link) {
      router.push(n.link)
      setOpen(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention': return <AtSign size={14} className="text-[#2383e2]" />
      case 'comment': return <MessageSquare size={14} className="text-[#0f7b6c]" />
      case 'invite': return <UserPlus size={14} className="text-[#a78bfa]" />
      default: return <Bell size={14} className="text-[#91918e]" />
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return '방금'
    if (diffMin < 60) return `${diffMin}분 전`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour}시간 전`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 7) return `${diffDay}일 전`
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative p-1.5 text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#eb5757] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-80 bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
              <span className="text-[13px] font-semibold text-[#37352f] dark:text-[#e6e3dd]">알림</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markRead()}
                    className="text-[11px] text-[#2383e2] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <CheckCheck size={12} /> 모두 읽기
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] rounded">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="px-3 py-8 text-center text-[13px] text-[#91918e]">로딩 중...</div>
              ) : notifications.length === 0 ? (
                <div className="px-3 py-8 text-center text-[13px] text-[#91918e]">
                  <Bell size={24} className="mx-auto mb-2 text-[#c4c4c0]" />
                  알림이 없습니다
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                      !n.isRead
                        ? 'bg-[#f1f8ff] dark:bg-[#1a2332] hover:bg-[#e6f3ff] dark:hover:bg-[#1e2a3d]'
                        : 'hover:bg-[#f7f7f5] dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-tight ${!n.isRead ? 'font-medium text-[#37352f] dark:text-[#e6e3dd]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}>
                        {n.message}
                      </p>
                      <span className="text-[11px] text-[#91918e]">{formatTime(n.createdAt)}</span>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-[#2383e2] rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
