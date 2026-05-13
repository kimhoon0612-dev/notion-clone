import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import { PluginKey } from 'prosemirror-state'
import tippy from 'tippy.js'
import { CommandList } from './CommandList'
import { Heading1, Heading2, Heading3, Text, List, ListOrdered, CheckSquare, Code, Image as ImageIcon, Table as TableIcon, Minus, Quote, ChevronRight, MessageSquare, Globe, Paperclip, Bookmark, Sigma, CalendarDays, AtSign } from 'lucide-react'

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: '텍스트',
      description: '일반 텍스트를 작성하세요.',
      icon: <Text size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run()
      },
    },
    {
      title: '할 일 목록',
      description: '체크박스가 있는 할 일 목록',
      icon: <CheckSquare size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: '제목 1',
      description: '섹션 제목 (대)',
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: '제목 2',
      description: '섹션 제목 (중)',
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: '제목 3',
      description: '섹션 제목 (소)',
      icon: <Heading3 size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
      },
    },
    {
      title: '글머리 기호 목록',
      description: '간단한 글머리 기호 목록 생성',
      icon: <List size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: '번호 매기기 목록',
      description: '번호가 매겨진 목록 생성',
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: '인용구',
      description: '인용구 삽입',
      icon: <Quote size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: '구분선',
      description: '가로 구분선 삽입',
      icon: <Minus size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
    {
      title: '코드 블록',
      description: '구문 강조가 있는 코드 스니펫',
      icon: <Code size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: '표',
      description: '기본 3x3 표 삽입',
      icon: <TableIcon size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    {
      title: '이미지',
      description: '랜덤 이미지 삽입',
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: any) => {
        const url = `https://picsum.photos/seed/${Date.now()}/800/400`
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run()
      },
    },
    {
      title: '토글',
      description: '접었다 펼 수 있는 토글 블록',
      icon: <ChevronRight size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'toggleBlock', content: [{ type: 'paragraph' }] }).run()
      },
    },
    {
      title: '콜아웃',
      description: '아이콘이 있는 강조 박스',
      icon: <MessageSquare size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'calloutBlock', attrs: { emoji: '💡' }, content: [{ type: 'paragraph' }] }).run()
      },
    },
    {
      title: '임베드',
      description: 'YouTube, 웹사이트 등 임베드',
      icon: <Globe size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'embedBlock' }).run()
      },
    },
    {
      title: '파일 첨부',
      description: 'PDF, ZIP 등 파일 업로드',
      icon: <Paperclip size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'fileBlock' }).run()
      },
    },
    {
      title: '북마크',
      description: 'URL 미리보기 카드',
      icon: <Bookmark size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'bookmarkBlock' }).run()
      },
    },
    {
      title: '수식',
      description: 'LaTeX 수학 수식 블록',
      icon: <Sigma size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'mathBlock' }).run()
      },
    },
    {
      title: '날짜',
      description: '인라인 날짜 선택',
      icon: <CalendarDays size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'dateBlock' }).run()
      },
    },
    {
      title: '멘션',
      description: '페이지 또는 사용자 멘션',
      icon: <AtSign size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent('@').run()
      },
    },
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
}

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey('slashCommandSuggestion'),
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export const suggestionConfig = {
  items: getSuggestionItems,
  render: () => {
    let component: any
    let popup: any

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props: any) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
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
}
