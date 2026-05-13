'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getTrashPages, restorePage, permanentlyDeletePage } from '@/app/actions'
import { Trash2, Undo2, X, FileText, KanbanSquare } from 'lucide-react'

type TrashItem = {
  id: string
  title: string
  icon: string | null
  isBoard: boolean
  deletedAt: Date | null
}

export default function TrashModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<TrashItem[]>([])
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getTrashPages().then(setItems)
    }
  }, [open])

  const handleRestore = async (id: string) => {
    await restorePage(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    router.refresh()
  }

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('이 페이지를 영구적으로 삭제하시겠습니까? 복구할 수 없습니다.')) return
    await permanentlyDeletePage(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    router.refresh()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-[#e9e9e7] dark:border-[#3f3f3f] overflow-hidden search-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
          <div className="flex items-center gap-2 text-[#37352f] dark:text-[#e6e3dd] font-medium text-[14px]">
            <Trash2 size={18} />
            <span>휴지통</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded">
            <X size={16} className="text-[#91918e]" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-[#91918e] text-[14px]">
              휴지통이 비어 있습니다
            </div>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.03)] group"
            >
              <div className="flex items-center gap-2 truncate">
                {item.icon ? (
                  <span className="text-lg">{item.icon}</span>
                ) : item.isBoard ? (
                  <KanbanSquare size={16} className="text-[#91918e]" />
                ) : (
                  <FileText size={16} className="text-[#91918e]" />
                )}
                <span className="text-[14px] text-[#37352f] dark:text-[#e6e3dd] truncate">
                  {item.title || '제목 없음'}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(item.id)}
                  className="p-1.5 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd]"
                  title="복원"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  onClick={() => handlePermanentDelete(item.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-[#91918e] hover:text-red-600"
                  title="영구 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
