import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'

const CalloutComponent = ({ node }: any) => {
  const emoji = node.attrs.emoji || '💡'
  return (
    <NodeViewWrapper>
      <div className="callout-block" data-emoji={emoji}>
        <span className="callout-emoji" contentEditable={false}>{emoji}</span>
        <div className="callout-content">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export const CalloutBlock = Node.create({
  name: 'calloutBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      emoji: {
        default: '💡',
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent)
  },
})
