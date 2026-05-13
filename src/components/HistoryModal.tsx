'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPageHistory, restorePageFromHistory } from '@/app/actions'
import { History, RotateCcw, X } from 'lucide-react'

type HistoryEntry = {
  id: string
  title: string
  createdAt: Date
}

export default function HistoryModal({ pageId, open, onClose }: { pageId: string; open: boolean; onClose: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const router = useRouter()

  useEffect(() => {
    if (open) { getPageHistory(pageId).then(setEntries) }
  }, [open, pageId])

  const handleRestore = async (historyId: string) => {
    if (!confirm('이 버전으로 되돌리시겠습니까?')) return
    await restorePageFromHistory(pageId, historyId)
    onClose()
    router.refresh()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-[#e9e9e7] dark:border-[#3f3f3f] overflow-hidden search-modal-enter" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
          <div className="flex items-center gap-2 text-[#37352f] dark:text-[#e6e3dd] font-medium text-[14px]">
            <History size={18} /><span>페이지 히스토리</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded"><X size={16} className="text-[#91918e]" /></button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {entries.length === 0 && (
            <div className="px-4 py-8 text-center text-[#91918e] text-[14px]">저장된 히스토리가 없습니다</div>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.03)] group border-b border-[#e9e9e7] dark:border-[#2f2f2f]">
              <div>
                <p className="text-[14px] font-medium text-[#37352f] dark:text-[#e6e3dd]">{entry.title}</p>
                <p className="text-[12px] text-[#91918e]">{new Date(entry.createdAt).toLocaleString('ko-KR')}</p>
              </div>
              <button
                onClick={() => handleRestore(entry.id)}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-[12px] bg-[rgba(35,131,226,0.08)] text-[#2383e2] rounded hover:bg-[rgba(35,131,226,0.14)] transition-all"
              >
                <RotateCcw size={12} />복원
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
