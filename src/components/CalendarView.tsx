'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPage } from '@/app/actions'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

type CalendarItem = {
  id: string
  title: string
  icon: string | null
  dueDate?: Date | string | null
}

export default function CalendarView({ boardId, items }: { boardId: string; items: CalendarItem[] }) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getItemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return items.filter((item) => {
      if (!item.dueDate) return false
      const itemDate = new Date(item.dueDate).toISOString().split('T')[0]
      return itemDate === dateStr
    })
  }

  const handleAddItem = async (day: number) => {
    const dueDate = new Date(year, month, day).toISOString()
    const newItem = await createPage(boardId, false, 'To Do')
    router.push(`/page/${newItem.id}`)
  }

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[80px] border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayItems = getItemsForDay(day)
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
    days.push(
      <div
        key={day}
        className="min-h-[80px] border border-zinc-100 dark:border-zinc-800 p-1 group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            isToday
              ? 'bg-blue-500 text-white'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}>
            {day}
          </span>
          <button
            onClick={() => handleAddItem(day)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-opacity"
          >
            <Plus size={12} className="text-zinc-400" />
          </button>
        </div>
        {dayItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(`/page/${item.id}`)}
            className="w-full text-left text-xs px-1.5 py-0.5 mb-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded truncate hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.title || '제목 없음'}
          </button>
        ))}
      </div>
    )
  }

  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">
            <ChevronLeft size={18} className="text-zinc-500" />
          </button>
          <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            {year}년 {monthNames[month]}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">
            <ChevronRight size={18} className="text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days}
      </div>
    </div>
  )
}
