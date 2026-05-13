import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { Bookmark, ExternalLink } from 'lucide-react'

const BookmarkComponent = ({ node, updateAttributes }: any) => {
  const { url, title, description } = node.attrs

  if (!url) {
    return (
      <NodeViewWrapper>
        <div className="bookmark-block bookmark-empty">
          <input
            type="text"
            placeholder="북마크할 URL을 입력하세요"
            className="bookmark-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const inputUrl = (e.target as HTMLInputElement).value
                updateAttributes({
                  url: inputUrl,
                  title: new URL(inputUrl).hostname,
                  description: inputUrl,
                })
              }
            }}
          />
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bookmark-block bookmark-filled"
        contentEditable={false}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#37352f] dark:text-[#e6e3dd] truncate">{title || url}</p>
          <p className="text-[12px] text-[#91918e] truncate mt-0.5">{description || url}</p>
          <p className="text-[12px] text-[#2383e2] flex items-center gap-1 mt-1">
            <ExternalLink size={11} />
            {new URL(url).hostname}
          </p>
        </div>
        <div className="shrink-0 w-10 h-10 rounded bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
          <Bookmark size={18} className="text-[#91918e]" />
        </div>
      </a>
    </NodeViewWrapper>
  )
}

export const BookmarkBlock = Node.create({
  name: 'bookmarkBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      title: { default: null },
      description: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="bookmark"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'bookmark' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkComponent)
  },
})
