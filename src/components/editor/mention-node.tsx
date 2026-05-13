'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react'
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { PluginKey } from 'prosemirror-state'
import tippy from 'tippy.js'
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { FileText, User } from 'lucide-react'

// --- Mention Node ---
function MentionView({ node }: NodeViewProps) {
  const type = node.attrs.mentionType // 'page' or 'user'
  const label = node.attrs.label
  const id = node.attrs.id

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={() => {
          if (type === 'page' && id) {
            window.location.href = `/page/${id}`
          }
        }}
        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-[#f1f1ef] dark:bg-[#2f2f2f] text-[#2383e2] hover:bg-[#e8e8e5] dark:hover:bg-[#3a3a3a] cursor-pointer transition-colors text-[13px] font-medium"
      >
        {type === 'page' ? <FileText size={12} /> : <User size={12} />}
        <span>{label || '알 수 없음'}</span>
      </span>
    </NodeViewWrapper>
  )
}

export const MentionNode = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: '' },
      mentionType: { default: 'page' },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-type="mention"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'mention' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MentionView)
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey('mentionSuggestion'),
        editor: this.editor,
        char: '@',
        command: ({ editor, range, props }: any) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'mention',
              attrs: {
                id: props.id,
                label: props.label,
                mentionType: props.mentionType,
              },
            })
            .run()
        },
        items: async ({ query }: { query: string }) => {
          try {
            const res = await fetch(`/api/mention?q=${encodeURIComponent(query)}`)
            if (!res.ok) return []
            return await res.json()
          } catch {
            return []
          }
        },
        render: () => {
          let component: any
          let popup: any

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(MentionList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },

            onUpdate(props: SuggestionProps) {
              component.updateProps(props)
              if (!props.clientRect) return
              popup[0].setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }
              return component.ref?.onKeyDown(props)
            },

            onExit() {
              popup[0].destroy()
              component.destroy()
            },
          }
        },
      }),
    ]
  },
})

// --- Mention List Dropdown ---
const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => setSelectedIndex(0), [props.items])

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) props.command(item)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i: number) => (i + props.items.length - 1) % props.items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i: number) => (i + 1) % props.items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  return (
    <div className="bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg shadow-lg overflow-hidden w-64 max-h-60 overflow-y-auto">
      {props.items.length === 0 ? (
        <div className="px-3 py-2 text-[13px] text-[#91918e]">검색 결과가 없습니다</div>
      ) : (
        props.items.map((item: any, index: number) => (
          <button
            key={item.id}
            onClick={() => selectItem(index)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left transition-colors ${
              index === selectedIndex
                ? 'bg-[#f1f1ef] dark:bg-[#2f2f2f] text-[#37352f] dark:text-[#e6e3dd]'
                : 'text-[#37352f] dark:text-[#e6e3dd] hover:bg-[#f7f7f5] dark:hover:bg-[#2a2a2a]'
            }`}
          >
            {item.mentionType === 'page' ? (
              <FileText size={14} className="text-[#91918e] shrink-0" />
            ) : (
              <User size={14} className="text-[#91918e] shrink-0" />
            )}
            <span className="truncate">{item.label}</span>
            <span className="text-[11px] text-[#91918e] ml-auto shrink-0">
              {item.mentionType === 'page' ? '페이지' : '사용자'}
            </span>
          </button>
        ))
      )}
    </div>
  )
})

MentionList.displayName = 'MentionList'
