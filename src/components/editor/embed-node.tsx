import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'

const EmbedComponent = ({ node, updateAttributes }: any) => {
  const { src } = node.attrs

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    return url
  }

  if (!src) {
    return (
      <NodeViewWrapper>
        <div className="embed-block embed-empty">
          <input
            type="text"
            placeholder="URL을 입력하세요 (YouTube, 웹사이트 등)"
            className="embed-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateAttributes({ src: (e.target as HTMLInputElement).value })
              }
            }}
          />
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className="embed-block">
        <iframe
          src={getEmbedUrl(src)}
          className="embed-iframe"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </NodeViewWrapper>
  )
}

export const EmbedBlock = Node.create({
  name: 'embedBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'embed' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent)
  },
})
