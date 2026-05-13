'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'

type TimelineItem = {
  id: string
  title: string
  icon: string | null
  status: string
  dueDate?: string | null
  createdAt?: string
}

type TimelineViewProps = {
  items: TimelineItem[]
}

const STATUS_COLORS: Record<string, string> = {
  'To Do': '#91918e',
  'In Progress': '#2383e2',
  'Done': '#0f7b6c',
}

export default function TimelineView({ items }: TimelineViewProps) {
  const router = useRouter()
  const [viewWeeks, setViewWeeks] = useState(4)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - d.getDay()) // Start from this week's Sunday
    d.setHours(0, 0, 0, 0)
    return d
  })

  const totalDays = viewWeeks * 7

  const endDate = useMemo(() => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + totalDays)
    return d
  }, [startDate, totalDays])

  const days = useMemo(() => {
    const result = []
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate)
      d.setDate(d.getDate() + i)
      result.push(d)
    }
    return result
  }, [startDate, totalDays])

  const weeks = useMemo(() => {
    const result: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [days])

  const getItemPosition = (item: TimelineItem) => {
    const itemStart = item.createdAt ? new Date(item.createdAt) : new Date()
    const itemEnd = item.dueDate ? new Date(item.dueDate) : new Date(itemStart.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    const totalMs = endDate.getTime() - startDate.getTime()
    const startPercent = Math.max(0, (itemStart.getTime() - startDate.getTime()) / totalMs) * 100
    const endPercent = Math.min(100, (itemEnd.getTime() - startDate.getTime()) / totalMs) * 100
    const width = Math.max(2, endPercent - startPercent)

    if (startPercent > 100 || endPercent < 0) return null

    return { left: `${startPercent}%`, width: `${width}%` }
  }

  const navigate = (direction: number) => {
    setStartDate((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + direction * 7)
      return d
    })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayPercent = ((today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100

  return (
    <div className="w-full overflow-x-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd] min-w-[200px] text-center">
            {startDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })} — {endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
          </span>
          <button onClick={() => navigate(1)} className="p-1 text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-1">
          {[2, 4, 8].map((w) => (
            <button
              key={w}
              onClick={() => setViewWeeks(w)}
              className={`px-2 py-1 text-[12px] rounded transition-colors ${
                viewWeeks === w
                  ? 'bg-[#2383e2] text-white'
                  : 'text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              {w}주
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Header */}
      <div className="relative border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-t-lg overflow-hidden">
        {/* Week Headers */}
        <div className="flex border-b border-[#e9e9e7] dark:border-[#3f3f3f] bg-[#f7f7f5] dark:bg-[#1e1e1e]">
          {weeks.map((week, i) => (
            <div key={i} className="flex-1 min-w-0">
              <div className="text-center text-[11px] text-[#91918e] py-1 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
                {week[0].toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex">
                {week.map((day, j) => (
                  <div
                    key={j}
                    className={`flex-1 text-center text-[10px] py-0.5 ${
                      day.getDay() === 0 || day.getDay() === 6 ? 'text-[#c4c4c0]' : 'text-[#91918e]'
                    } ${day.toDateString() === new Date().toDateString() ? 'bg-[#2383e2]/10 font-bold text-[#2383e2]' : ''}`}
                  >
                    {['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Body */}
        <div className="relative min-h-[200px]">
          {/* Today line */}
          {todayPercent >= 0 && todayPercent <= 100 && (
            <div
              className="absolute top-0 bottom-0 w-px bg-[#eb5757] z-10"
              style={{ left: `${todayPercent}%` }}
            >
              <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#eb5757] rounded-full" />
            </div>
          )}

          {/* Grid lines */}
          <div className="absolute inset-0 flex">
            {days.map((_, i) => (
              <div
                key={i}
                className={`flex-1 border-r border-[#f1f1ef] dark:border-[#2a2a2a] ${
                  i % 7 === 6 ? 'border-r-[#e9e9e7] dark:border-r-[#3f3f3f]' : ''
                }`}
              />
            ))}
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-[#91918e] text-[13px]">
              항목이 없습니다
            </div>
          ) : (
            items.map((item, index) => {
              const pos = getItemPosition(item)
              if (!pos) return null

              return (
                <div
                  key={item.id}
                  className="relative h-8"
                  style={{ marginTop: index === 0 ? '8px' : '2px' }}
                >
                  <div
                    onClick={() => router.push(`/page/${item.id}`)}
                    className="absolute h-6 rounded cursor-pointer flex items-center px-2 gap-1 text-white text-[11px] font-medium hover:brightness-110 transition-all truncate"
                    style={{
                      left: pos.left,
                      width: pos.width,
                      backgroundColor: STATUS_COLORS[item.status] || '#91918e',
                    }}
                  >
                    {item.icon ? <span className="text-[11px]">{item.icon}</span> : <FileText size={10} />}
                    <span className="truncate">{item.title || '제목 없음'}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
