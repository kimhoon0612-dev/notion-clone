'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react'
import { useState, useEffect, useRef } from 'react'

function MathNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const [editing, setEditing] = useState(!node.attrs.formula)
  const [formula, setFormula] = useState(node.attrs.formula || '')
  const renderRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!editing && formula && renderRef.current) {
      import('katex').then((katex) => {
        try {
          katex.default.render(formula, renderRef.current!, {
            throwOnError: false,
            displayMode: node.attrs.display,
          })
        } catch {
          if (renderRef.current) renderRef.current.textContent = formula
        }
      })
    }
  }, [formula, editing, node.attrs.display])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const save = () => {
    updateAttributes({ formula })
    setEditing(false)
  }

  if (editing) {
    return (
      <NodeViewWrapper className="my-2">
        <div className="border border-[#2383e2]/30 rounded-lg bg-[#fbfbfa] dark:bg-[#1e1e1e] p-3">
          <div className="flex items-center gap-2 mb-2 text-[12px] text-[#91918e]">
            <span>∑</span>
            <span>수식 편집 (LaTeX)</span>
          </div>
          <textarea
            ref={inputRef}
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                save()
              }
              if (e.key === 'Escape') save()
            }}
            placeholder="E = mc^2"
            className="w-full bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded px-3 py-2 text-[14px] font-mono text-[#37352f] dark:text-[#e6e3dd] outline-none focus:border-[#2383e2] resize-none min-h-[60px]"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setEditing(false)} className="text-[12px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] px-2 py-1">취소</button>
            <button onClick={save} className="text-[12px] bg-[#2383e2] text-white px-3 py-1 rounded hover:bg-[#1b6ec2] transition-colors">완료</button>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className={`my-2 ${selected ? 'ring-2 ring-[#2383e2]/30 rounded' : ''}`}>
      <div
        ref={renderRef}
        onClick={() => setEditing(true)}
        className={`cursor-pointer hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] rounded p-2 transition-colors ${
          node.attrs.display ? 'text-center text-lg' : 'inline'
        }`}
      >
        {formula || '수식을 입력하세요...'}
      </div>
    </NodeViewWrapper>
  )
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      formula: { default: '' },
      display: { default: true },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="math-block"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'math-block' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView)
  },
})
