'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react'
import { useState, useRef } from 'react'
import { Calendar } from 'lucide-react'

function DateNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = d.toDateString() === tomorrow.toDateString()
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()
    
    if (isToday) return '오늘'
    if (isTomorrow) return '내일'
    if (isYesterday) return '어제'
    
    return d.toLocaleDateString('ko-KR', { 
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' 
    })
  }

  const dateStr = node.attrs.date
  const formatted = formatDate(dateStr)

  return (
    <NodeViewWrapper as="span" className="inline">
      {editing ? (
        <input
          ref={inputRef}
          type="date"
          value={dateStr || ''}
          autoFocus
          onChange={(e) => updateAttributes({ date: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditing(false) }}
          className="inline-block bg-white dark:bg-[#252525] border border-[#2383e2] rounded px-2 py-0.5 text-[13px] text-[#37352f] dark:text-[#e6e3dd] outline-none"
        />
      ) : (
        <span
          onClick={() => setEditing(true)}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors text-[13px] ${
            selected ? 'ring-2 ring-[#2383e2]/30' : ''
          } ${dateStr 
            ? 'bg-[#f1f1ef] dark:bg-[#2f2f2f] text-[#37352f] dark:text-[#e6e3dd] hover:bg-[#e8e8e5] dark:hover:bg-[#3a3a3a]' 
            : 'bg-[#f1f1ef] dark:bg-[#2f2f2f] text-[#91918e] hover:bg-[#e8e8e5] dark:hover:bg-[#3a3a3a]'
          }`}
        >
          <Calendar size={12} />
          <span>{formatted || '날짜 선택'}</span>
        </span>
      )}
    </NodeViewWrapper>
  )
}

export const DateBlock = Node.create({
  name: 'dateBlock',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      date: { default: new Date().toISOString().split('T')[0] },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="date-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'date-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DateNodeView)
  },
})
