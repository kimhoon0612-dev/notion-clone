import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'

const ToggleComponent = () => {
  return (
    <NodeViewWrapper>
      <details className="toggle-block">
        <summary className="toggle-summary">토글</summary>
        <div className="toggle-content">
          <NodeViewContent />
        </div>
      </details>
    </NodeViewWrapper>
  )
}

export const ToggleBlock = Node.create({
  name: 'toggleBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="toggle"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggle' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleComponent)
  },
})
