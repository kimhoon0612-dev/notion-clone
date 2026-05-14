'use client'

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import Collaboration from '@tiptap/extension-collaboration'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { useEffect, useState, useRef } from 'react'
import { updatePage, exportPageAsMarkdown, savePageHistory } from '@/app/actions'
import { useRouter } from 'next/navigation'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import { ImageIcon, Smile, X, Maximize2, Minimize2, Download, Share2, History, FileCode, Lock, Unlock } from 'lucide-react'
import { SlashCommand, suggestionConfig } from './editor/slash-command'
import { useTheme } from 'next-themes'
import { Sparkles, Wand2, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Link2 } from 'lucide-react'
import { ToggleBlock } from './editor/toggle-node'
import Link from '@tiptap/extension-link'
import UnderlineExt from '@tiptap/extension-underline'
import { CalloutBlock } from './editor/callout-node'
import { EmbedBlock } from './editor/embed-node'
import { FileBlock } from './editor/file-node'
import { BookmarkBlock } from './editor/bookmark-node'
import { MathBlock } from './editor/math-node'
import { DateBlock } from './editor/date-node'
import { MentionNode } from './editor/mention-node'
import CommentSection from './CommentSection'
import ShareModal from './ShareModal'
import HistoryModal from './HistoryModal'


// Load languages
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'

const lowlight = createLowlight()
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

const colors = ['#f783ac', '#818cf8', '#fbbf24', '#34d399', '#a78bfa', '#fb923c']
const names = ['익명의 토끼', '익명의 고양이', '익명의 강아지', '익명의 알파카', '익명의 코알라', '익명의 사자', '익명의 곰', '익명의 다람쥐']

function getRandomUser() {
  const name = names[Math.floor(Math.random() * names.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  return { name, color }
}

type EditorProps = {
  page: {
    id: string
    title: string
    content: string
    icon: string | null
    coverImage: string | null
    isPublic?: boolean
    shareLink?: string | null
    isFullWidth?: boolean
    isLocked?: boolean
  }
}

function EditorInner({ page, provider }: { page: EditorProps['page'], provider: WebsocketProvider }) {
  const router = useRouter()
  const { theme } = useTheme()
  const [title, setTitle] = useState(page.title)
  const [icon, setIcon] = useState(page.icon)
  const [coverImage, setCoverImage] = useState(page.coverImage)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [fullWidth, setFullWidth] = useState(page.isFullWidth || false)
  const [shareOpen, setShareOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [saveTimeoutRef, setSaveTimeoutRef] = useState<NodeJS.Timeout | null>(null)
  const [currentUser] = useState(getRandomUser)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isLocked, setIsLocked] = useState(page.isLocked || false)
  const lastHistorySaveRef = useRef<number>(Date.now())

  const handleAI = async (action: string) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ')
    if (!text) return

    setIsAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, action })
      })
      if (!res.ok) throw new Error("AI request failed")
      
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      
      // We will insert the result below the selection
      let insertPos = to
      editor.chain().focus().insertContentAt(insertPos, '\n\n✨ ').run()
      
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        editor.chain().focus().insertContent(chunk).run()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsAiLoading(false)
    }
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      return data.url
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const editor = useEditor({
    extensions: [
      GlobalDragHandle.configure({
        dragHandleWidth: 24,
        scrollTreshold: 100,
      }),
      StarterKit.configure({
        codeBlock: false,
        history: false, // history is handled by Yjs
      } as any),
      Collaboration.configure({
        document: provider.doc,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#2383e2] underline cursor-pointer' },
      }),
      UnderlineExt,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "명령어를 사용하려면 '/'를 입력하세요",
      }),
      SlashCommand.configure({
        suggestion: suggestionConfig,
      }),
      ToggleBlock,
      CalloutBlock,
      EmbedBlock,
      FileBlock,
      BookmarkBlock,
      MathBlock,
      DateBlock,
      MentionNode,
    ],
    content: page.content,
    immediatelyRender: false,
    editable: !isLocked,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[500px] w-full max-w-full',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file).then(url => {
              if (url) {
                const { schema } = view.state
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
                const node = schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.insert(coordinates?.pos || view.state.selection.to, node)
                view.dispatch(transaction)
              }
            })
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0]
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadImage(file).then(url => {
              if (url) {
                const { schema } = view.state
                const node = schema.nodes.image.create({ src: url })
                const transaction = view.state.tr.replaceSelectionWith(node)
                view.dispatch(transaction)
              }
            })
            return true
          }
        }
        return false
      }
    },
    onUpdate: ({ editor }) => {
      handleAutoSave(title, icon, coverImage, editor.getHTML())
    },
  })

  useEffect(() => {
    setTitle(page.title)
    setIcon(page.icon)
    setCoverImage(page.coverImage)
    // Tiptap Collaboration handles content syncing automatically.
  }, [page.id])

  const saveCountRef = useRef(0)

  const handleAutoSave = (newTitle: string, newIcon: string | null, newCover: string | null, newContent: string) => {
    if (saveTimeoutRef) {
      clearTimeout(saveTimeoutRef)
    }
    const timeout = setTimeout(async () => {
      await updatePage(page.id, {
        title: newTitle,
        content: newContent,
        icon: newIcon,
        coverImage: newCover,
      })
      // Save history snapshot every 5 minutes
      const now = Date.now()
      if (now - lastHistorySaveRef.current > 5 * 60 * 1000) {
        lastHistorySaveRef.current = now
        await savePageHistory(page.id, newTitle, newContent)
      }
      router.refresh()
    }, 1000)
    setSaveTimeoutRef(timeout)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    handleAutoSave(newTitle, icon, coverImage, editor?.getHTML() || '')
  }

  const handleIconSelect = (emojiData: any) => {
    const newIcon = emojiData.emoji
    setIcon(newIcon)
    setShowEmojiPicker(false)
    handleAutoSave(title, newIcon, coverImage, editor?.getHTML() || '')
  }

  const handleRemoveIcon = () => {
    setIcon(null)
    handleAutoSave(title, null, coverImage, editor?.getHTML() || '')
  }

  const handleAddCover = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const url = await uploadImage(file)
      if (url) {
        setCoverImage(url)
        handleAutoSave(title, icon, url, editor?.getHTML() || '')
      }
    }
    input.click()
  }

  const handleRemoveCover = () => {
    setCoverImage(null)
    handleAutoSave(title, icon, null, editor?.getHTML() || '')
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    target.style.height = 'auto'
    target.style.height = `${target.scrollHeight}px`
  }

  return (
    <div className="w-full flex flex-col items-center text-[#37352f] dark:text-[#e6e3dd]">
      {coverImage ? (
        <div className="relative w-full h-64 group">
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={handleRemoveCover}
            className="absolute top-4 right-4 bg-white/80 dark:bg-[#191919]/70 hover:bg-white dark:hover:bg-[#191919]/90 text-[#37352f] dark:text-[#e6e3dd] px-3 py-1.5 rounded-md text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-all"
          >
            커버 변경/제거
          </button>
        </div>
      ) : (
        <div className="w-full h-8" />
      )}

      <div className={`${fullWidth ? 'max-w-full px-24' : 'max-w-[900px] px-[96px]'} w-full pb-12 relative transition-all duration-200`}>
        {/* Top Controls */}
        <div className="absolute top-2 right-4 flex items-center gap-1 z-10">
          <button
            onClick={async () => {
              const newLocked = !isLocked
              setIsLocked(newLocked)
              await updatePage(page.id, { isLocked: newLocked } as any)
              if (editor) editor.setEditable(!newLocked)
            }}
            className={`p-1.5 rounded-[4px] transition-colors ${
              isLocked
                ? 'text-[#eb5757] hover:bg-[rgba(235,87,87,0.08)]'
                : 'text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]'
            }`}
            title={isLocked ? '잠금 해제' : '페이지 잠금'}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
          <button
            onClick={() => setFullWidth(!fullWidth)}
            className="p-1.5 text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
            title={fullWidth ? '표준 너비' : '전체 너비'}
          >
            {fullWidth ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
        {isLocked && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#fff8e1] dark:bg-[#332b00] border border-[#ffd54f]/30 rounded-md mb-4 mt-2 text-[13px] text-[#856404] dark:text-[#ffd54f]">
            <Lock size={14} />
            <span>이 페이지는 잠겨 있어 편집할 수 없습니다.</span>
          </div>
        )}
        {icon ? (
          <div className="relative group -mt-12 mb-4 w-fit">
            <div
              className="text-7xl cursor-pointer hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-md transition-colors p-1"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              {icon}
            </div>
            <button
              onClick={handleRemoveIcon}
              className="absolute -top-2 -right-2 bg-[#e9e9e7] dark:bg-[#3f3f3f] hover:bg-[#d3d3d1] dark:hover:bg-[#555] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[#37352f] dark:text-[#e6e3dd]"
            >
              <X size={16} />
            </button>
          </div>
        ) : null}

        <div className="flex gap-2 mb-4 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity pt-4 group-hover:opacity-100">
          {!icon && (
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center gap-1 text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] px-2 py-1 rounded-[4px] text-[14px] transition-colors"
            >
              <Smile size={16} />
              <span>아이콘 추가</span>
            </button>
          )}
          {!coverImage && (
            <button
              onClick={handleAddCover}
              className="flex items-center gap-1 text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] px-2 py-1 rounded-[4px] text-[14px] transition-colors"
            >
              <ImageIcon size={16} />
              <span>커버 추가</span>
            </button>
          )}
        </div>

        {showEmojiPicker && (
          <div className="absolute z-50 mt-2 shadow-2xl">
            <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
            <div className="relative">
              <EmojiPicker onEmojiClick={handleIconSelect} theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} />
            </div>
          </div>
        )}

        <textarea
          value={title}
          onChange={handleTitleChange}
          onInput={handleInput}
          placeholder="제목 없음"
          className="w-full text-[40px] font-bold bg-transparent outline-none resize-none overflow-hidden mb-2 placeholder:text-[#e1e1df] dark:placeholder:text-[#3f3f3f] text-[#37352f] dark:text-[#e6e3dd] leading-[1.2]"
          rows={1}
        />
        <div className="w-full max-w-full relative">
          {editor && !editor.state.selection.empty && (
            <div className="fixed z-50 flex overflow-hidden border border-[#e9e9e7] dark:border-[#3f3f3f] shadow-xl bg-white dark:bg-[#252525] rounded-lg" style={{ top: (() => { try { const coords = editor.view.coordsAtPos(editor.state.selection.from); return coords.top - 50 + window.scrollY; } catch { return -9999; } })(), left: (() => { try { const from = editor.view.coordsAtPos(editor.state.selection.from); const to = editor.view.coordsAtPos(editor.state.selection.to); return (from.left + to.left) / 2 - 180; } catch { return -9999; } })() }}>
              {/* Text Formatting */}
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ${editor.isActive('bold') ? 'text-[#2383e2]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}><Bold size={15} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ${editor.isActive('italic') ? 'text-[#2383e2]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}><Italic size={15} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ${editor.isActive('underline') ? 'text-[#2383e2]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}><UnderlineIcon size={15} /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ${editor.isActive('strike') ? 'text-[#2383e2]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}><Strikethrough size={15} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ${editor.isActive('code') ? 'text-[#2383e2]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}><Code size={15} /></button>
              <button onClick={() => { const url = prompt('링크 URL을 입력하세요:'); if (url) editor.chain().focus().setLink({ href: url }).run() }} className={`p-2 text-[13px] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors ${editor.isActive('link') ? 'text-[#2383e2]' : 'text-[#37352f] dark:text-[#e6e3dd]'}`}><Link2 size={15} /></button>
              <div className="w-px bg-[#e9e9e7] dark:bg-[#3f3f3f]" />
              {/* AI Actions */}
              <button onClick={() => handleAI('summarize')} disabled={isAiLoading} className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors border-r border-[#e9e9e7] dark:border-[#3f3f3f]">
                <Sparkles size={14} className="text-[#a78bfa]" /> 요약
              </button>
              <button onClick={() => handleAI('fix')} disabled={isAiLoading} className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors border-r border-[#e9e9e7] dark:border-[#3f3f3f]">
                <Wand2 size={14} className="text-[#34d399]" /> 교정
              </button>
              <button onClick={() => handleAI('translate')} disabled={isAiLoading} className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] transition-colors">
                번역
              </button>
            </div>
          )}
          <EditorContent editor={editor} />
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-[#e9e9e7] dark:border-[#2f2f2f] flex-wrap">
          <button
            onClick={async () => {
              const result = await exportPageAsMarkdown(page.id)
              if (result) {
                const blob = new Blob([result.markdown], { type: 'text/markdown' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${result.title}.md`
                a.click()
                URL.revokeObjectURL(url)
              }
            }}
            className="flex items-center gap-1.5 text-[12px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] px-2 py-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <Download size={14} /><span>Markdown</span>
          </button>
          <button
            onClick={async () => {
              const { exportPageAsHTML } = await import('@/app/actions')
              const result = await exportPageAsHTML(page.id)
              if (result) {
                const blob = new Blob([result.html], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${result.title}.html`
                a.click()
                URL.revokeObjectURL(url)
              }
            }}
            className="flex items-center gap-1.5 text-[12px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] px-2 py-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <FileCode size={14} /><span>HTML</span>
          </button>
          <div className="h-4 w-px bg-[#e9e9e7] dark:bg-[#2f2f2f]" />
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 text-[12px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] px-2 py-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <Share2 size={14} /><span>공유</span>
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 text-[12px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] px-2 py-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <History size={14} /><span>히스토리</span>
          </button>
        </div>
      </div>

      {/* Comment Section */}
      <div className="max-w-4xl w-full">
        <CommentSection pageId={page.id} />
      </div>

      {/* Modals */}
      <ShareModal pageId={page.id} isPublic={page.isPublic || false} shareLink={page.shareLink || null} open={shareOpen} onClose={() => setShareOpen(false)} />
      <HistoryModal pageId={page.id} open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  )
}

export default function EditorWrapper({ page }: EditorProps) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const docRef = useRef<Y.Doc | null>(null)

  useEffect(() => {
    // Clean up any previous connection first
    if (providerRef.current) {
      providerRef.current.destroy()
    }
    if (docRef.current) {
      docRef.current.destroy()
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234'
    const doc = new Y.Doc()
    const wsProvider = new WebsocketProvider(wsUrl, page.id, doc)
    const idbProvider = new IndexeddbPersistence(page.id, doc)

    docRef.current = doc
    providerRef.current = wsProvider
    setProvider(wsProvider)

    return () => {
      wsProvider.destroy()
      idbProvider.destroy()
      doc.destroy()
      providerRef.current = null
      docRef.current = null
    }
  }, [page.id])

  if (!provider) {
    return <div className="p-8 text-zinc-500">에디터 동기화 중...</div>
  }

  return <EditorInner page={page} provider={provider} />
}
