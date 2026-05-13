'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { searchPages } from '@/app/actions'
import { Search, FileText, KanbanSquare, X } from 'lucide-react'

type SearchResult = {
  id: string
  title: string
  icon: string | null
  isBoard: boolean
}

export default function SearchModal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search on query change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        const data = await searchPages(query)
        setResults(data)
        setSelectedIndex(0)
      } else {
        setResults([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback((id: string) => {
    setOpen(false)
    setQuery('')
    setResults([])
    router.push(`/page/${id}`)
  }, [router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex].id)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-[#e9e9e7] dark:border-[#3f3f3f] overflow-hidden search-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
          <Search size={20} className="text-[#91918e] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="페이지 검색..."
            className="w-full bg-transparent outline-none text-[#37352f] dark:text-[#e6e3dd] placeholder:text-[#91918e] text-[15px]"
          />
          <button onClick={() => setOpen(false)} className="p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded">
            <X size={16} className="text-[#91918e]" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {results.length === 0 && query.trim() && (
            <div className="px-4 py-8 text-center text-[#91918e] text-[14px]">
              검색 결과가 없습니다
            </div>
          )}
          {results.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === selectedIndex
                  ? 'bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.06)]'
                  : 'hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.03)]'
              }`}
            >
              {item.icon ? (
                <span className="text-lg shrink-0">{item.icon}</span>
              ) : item.isBoard ? (
                <KanbanSquare size={18} className="text-[#91918e] shrink-0" />
              ) : (
                <FileText size={18} className="text-[#91918e] shrink-0" />
              )}
              <span className="text-[14px] text-[#37352f] dark:text-[#e6e3dd] truncate">
                {item.title || '제목 없음'}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        {!query.trim() && (
          <div className="px-4 py-3 text-[12px] text-[#91918e] border-t border-[#e9e9e7] dark:border-[#3f3f3f]">
            페이지 제목 또는 내용으로 검색하세요
          </div>
        )}
      </div>
    </div>
  )
}
