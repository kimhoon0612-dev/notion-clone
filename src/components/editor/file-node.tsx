import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { FileIcon, Download } from 'lucide-react'

const FileComponent = ({ node, updateAttributes }: any) => {
  const { src, fileName, fileSize } = node.attrs

  if (!src) {
    return (
      <NodeViewWrapper>
        <div className="file-block file-empty">
          <label className="flex items-center gap-2 cursor-pointer text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] text-[13px]">
            <FileIcon size={16} />
            <span>파일 첨부하기</span>
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const formData = new FormData()
                formData.append('file', file)
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: formData })
                  const data = await res.json()
                  updateAttributes({
                    src: data.url,
                    fileName: file.name,
                    fileSize: (file.size / 1024).toFixed(1) + ' KB',
                  })
                } catch (err) {
                  console.error(err)
                }
              }}
            />
          </label>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper>
      <div className="file-block">
        <a href={src} download={fileName} className="flex items-center gap-3 text-[#37352f] dark:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
          <FileIcon size={20} className="text-[#91918e] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium truncate">{fileName || '파일'}</p>
            <p className="text-[12px] text-[#91918e]">{fileSize}</p>
          </div>
          <Download size={16} className="text-[#91918e] shrink-0" />
        </a>
      </div>
    </NodeViewWrapper>
  )
}

export const FileBlock = Node.create({
  name: 'fileBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      fileName: { default: null },
      fileSize: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileComponent)
  },
})
