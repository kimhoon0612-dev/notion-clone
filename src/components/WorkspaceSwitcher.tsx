'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Plus, Check, Users } from 'lucide-react'
import { switchWorkspace, createWorkspace } from '@/app/workspace-actions'

type Workspace = {
  id: string
  name: string
  icon: string | null
  role: string
  memberCount: number
  pageCount: number
}

export default function WorkspaceSwitcher({ workspaces, activeId }: { workspaces: Workspace[]; activeId: string | null }) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const active = workspaces.find((w) => w.id === activeId) || workspaces[0]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setCreating(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitch = async (id: string) => {
    await switchWorkspace(id)
    setOpen(false)
    router.refresh()
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createWorkspace(newName.trim())
    setNewName('')
    setCreating(false)
    setOpen(false)
    router.refresh()
  }

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = { owner: '소유자', admin: '관리자', editor: '편집자', viewer: '뷰어' }
    return labels[role] || role
  }

  if (!active) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[4px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      >
        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {active.icon || active.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-[14px] font-semibold text-[#37352f] dark:text-[#e6e3dd] truncate flex-1 text-left">
          {active.name}
        </span>
        <ChevronDown size={14} className="text-[#91918e] shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-[#252525] rounded-lg shadow-xl border border-[#e9e9e7] dark:border-[#3f3f3f] z-50 overflow-hidden">
          <div className="p-1.5 text-[11px] font-semibold text-[#91918e] uppercase tracking-wider px-3 pt-2">
            워크스페이스
          </div>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSwitch(ws.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            >
              <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                {ws.icon || ws.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd] truncate">{ws.name}</p>
                <p className="text-[11px] text-[#91918e]">
                  {roleLabel(ws.role)} · <Users size={10} className="inline" /> {ws.memberCount}명
                </p>
              </div>
              {ws.id === activeId && <Check size={16} className="text-[#2383e2] shrink-0" />}
            </button>
          ))}
          
          <div className="border-t border-[#e9e9e7] dark:border-[#3f3f3f] p-1">
            {creating ? (
              <div className="px-2 py-1.5">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder="워크스페이스 이름"
                  className="w-full px-2 py-1.5 text-[13px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
                />
                <div className="flex gap-1 mt-1.5">
                  <button onClick={handleCreate} className="flex-1 py-1 text-[12px] bg-[#2383e2] text-white rounded hover:bg-[#0b6bcb]">만들기</button>
                  <button onClick={() => setCreating(false)} className="flex-1 py-1 text-[12px] text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded">취소</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors"
              >
                <Plus size={16} /> 새 워크스페이스 만들기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
