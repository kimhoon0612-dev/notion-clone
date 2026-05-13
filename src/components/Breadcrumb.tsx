'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getPageWithAncestors } from '@/app/actions'
import { ChevronRight, FileText } from 'lucide-react'

type Ancestor = {
  id: string
  title: string
  icon: string | null
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const router = useRouter()
  const [ancestors, setAncestors] = useState<Ancestor[]>([])

  const pageId = pathname.startsWith('/page/') ? pathname.split('/page/')[1] : null

  useEffect(() => {
    if (pageId) {
      getPageWithAncestors(pageId).then(setAncestors)
    } else {
      setAncestors([])
    }
  }, [pageId])

  if (!pageId || ancestors.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-4 py-1.5 text-[13px] text-[#91918e] overflow-x-auto shrink-0">
      {ancestors.map((ancestor, i) => (
        <div key={ancestor.id} className="flex items-center gap-1 shrink-0">
          {i > 0 && <ChevronRight size={11} className="text-[#b4b4b4] dark:text-[#5a5a5a]" />}
          <button
            onClick={() => router.push(`/page/${ancestor.id}`)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors truncate max-w-[160px] ${
              i === ancestors.length - 1 ? 'text-[#37352f] dark:text-[#e6e3dd]' : ''
            }`}
          >
            {ancestor.icon ? (
              <span className="text-[13px]">{ancestor.icon}</span>
            ) : (
              <FileText size={13} className="shrink-0" />
            )}
            <span className="truncate">{ancestor.title || '제목 없음'}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
