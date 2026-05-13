'use client'

import { Plus, FileText, Trash2, ChevronRight, ChevronDown, Moon, Sun, KanbanSquare, Star, PanelLeftClose, PanelLeft, Search, LogOut, Settings, Users } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { createPage, softDeletePage, toggleFavorite, reorderPages } from '@/app/actions'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from 'next-themes'
import TrashModal from './TrashModal'
import SettingsModal from './SettingsModal'
import MembersModal from './MembersModal'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import NotificationBell from './NotificationBell'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

type Page = {
  id: string
  title: string
  icon: string | null
  parentId: string | null
  isBoard: boolean
  isFavorite: boolean
}

function PageItem({
  page,
  allPages,
  level = 0,
}: {
  page: Page
  allPages: Page[]
  level?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  const childPages = allPages.filter((p) => p.parentId === page.id)
  const hasChildren = childPages.length > 0
  const isActive = pathname === `/page/${page.id}`

  const handleCreateChild = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const newPage = await createPage(page.id)
    setExpanded(true)
    router.push(`/page/${newPage.id}`)
  }

  const handleSoftDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await softDeletePage(page.id)
    if (isActive) router.push('/')
    router.refresh()
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(page.id)
    router.refresh()
  }

  return (
    <div>
      <div
        onClick={() => router.push(`/page/${page.id}`)}
        className={`group flex items-center justify-between py-[5px] text-[14px] cursor-pointer rounded-[4px] mx-1 transition-colors ${
          isActive
            ? 'bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.06)]'
            : 'hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)]'
        }`}
        style={{ paddingLeft: `${level * 16 + 10}px`, paddingRight: '8px' }}
      >
        <div className="flex items-center gap-1 truncate overflow-hidden min-w-0">
          <div
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className={`p-0.5 rounded-[3px] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.08)] shrink-0 ${!hasChildren && 'invisible'}`}
          >
            {expanded ? <ChevronDown size={14} className="text-[#91918e]" /> : <ChevronRight size={14} className="text-[#91918e]" />}
          </div>
          {page.icon ? (
            <span className="shrink-0 text-[14px] leading-none">{page.icon}</span>
          ) : page.isBoard ? (
            <KanbanSquare size={16} className="shrink-0 text-[#91918e]" />
          ) : (
            <FileText size={16} className="shrink-0 text-[#91918e]" />
          )}
          <span className="truncate text-[#37352f] dark:text-[#ffffffcf]">{page.title || '제목 없음'}</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 gap-0.5 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className="p-[3px] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[3px]"
            title={page.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
          >
            <Star size={13} className={page.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-[#91918e]'} />
          </button>
          {!page.isBoard && (
            <button
              onClick={handleCreateChild}
              className="p-[3px] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[3px] text-[#91918e]"
              title="하위 페이지 추가"
            >
              <Plus size={13} />
            </button>
          )}
          <button
            onClick={handleSoftDelete}
            className="p-[3px] hover:bg-[rgba(0,0,0,0.06)] dark:hover:bg-[rgba(255,255,255,0.08)] rounded-[3px] text-[#91918e]"
            title="삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {expanded && hasChildren && !page.isBoard && (
        <div>
          {childPages.map((child) => (
            <PageItem key={child.id} page={child} allPages={allPages} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

type Workspace = {
  id: string
  name: string
  icon: string | null
  role: string
  memberCount: number
  pageCount: number
}

export default function Sidebar({ pages, workspaces, activeWorkspaceId, myRole }: { pages: Page[]; workspaces: Workspace[]; activeWorkspaceId: string | null; myRole: string }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const isResizing = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseDown = useCallback(() => {
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.min(Math.max(e.clientX, 200), 500)
      setSidebarWidth(newWidth)
    }
    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleCreateRootPage = async () => {
    const newPage = await createPage()
    router.push(`/page/${newPage.id}`)
  }

  const handleCreateBoard = async () => {
    const newBoard = await createPage(undefined, true)
    router.push(`/page/${newBoard.id}`)
  }

  const rootPages = pages.filter((p) => !p.parentId)
  const favoritePages = pages.filter((p) => p.isFavorite)

  const handleSidebarDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const reordered = Array.from(rootPages)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    await reorderPages(reordered.map((p) => p.id))
    router.refresh()
  }

  if (collapsed) {
    return (
      <div className="w-12 bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col items-center py-4 h-screen shrink-0 transition-all duration-300 shadow-sm z-40">
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110">
          <PanelLeft size={18} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col h-screen shrink-0 transition-colors relative select-none z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex-1 min-w-0">
              <WorkspaceSwitcher workspaces={workspaces} activeId={activeWorkspaceId} />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-110 text-gray-400 hover:text-amber-500 dark:hover:text-amber-300"
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              )}
              <NotificationBell />
              <button
                onClick={() => setCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-110 text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <PanelLeftClose size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 pb-2 flex flex-col gap-1 mt-2">
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
              document.dispatchEvent(event)
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
          >
            <Search size={15} />
            <span>검색</span>
            <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 rounded">Ctrl+K</span>
          </button>
          <button
            onClick={handleCreateRootPage}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
          >
            <FileText size={15} />
            <span>새 문서 추가</span>
          </button>
          <button
            onClick={handleCreateBoard}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all"
          >
            <KanbanSquare size={15} />
            <span>새 보드 추가</span>
          </button>
        </div>

        {/* Page List */}
        <div className="flex-1 overflow-y-auto pb-2">
          {/* Favorites Section */}
          {favoritePages.length > 0 && (
            <div className="mb-1">
              <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#91918e] uppercase tracking-wider">
                즐겨찾기
              </div>
              {favoritePages.map((page) => (
                <PageItem key={`fav-${page.id}`} page={page} allPages={pages} />
              ))}
            </div>
          )}

          {/* All Pages Section */}
          <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#91918e] uppercase tracking-wider">
            개인 페이지
          </div>
          <DragDropContext onDragEnd={handleSidebarDragEnd}>
            <Droppable droppableId="sidebar-pages">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {rootPages.map((page, index) => (
                    <Draggable key={page.id} draggableId={page.id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={snapshot.isDragging ? 'opacity-70' : ''}>
                          <PageItem page={page} allPages={pages} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Bottom Actions */}
        <div className="px-2 py-2 border-t border-[#e9e9e7] dark:border-[#2f2f2f] flex flex-col gap-0.5">
          <button
            onClick={() => setTrashOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-[5px] text-[13px] text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <Trash2 size={15} />
            <span>휴지통</span>
          </button>
          <button
            onClick={async () => {
              const { signOut } = await import('next-auth/react')
              await signOut({ redirect: true, callbackUrl: '/' })
            }}
            className="w-full flex items-center gap-2 px-2 py-[5px] text-[13px] text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors hover:text-red-500"
          >
            <LogOut size={15} />
            <span>로그아웃</span>
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-[5px] text-[13px] text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <Settings size={15} />
            <span>설정</span>
          </button>
          <button
            onClick={() => setMembersOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-[5px] text-[13px] text-[#91918e] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded-[4px] transition-colors"
          >
            <Users size={15} />
            <span>멤버 관리</span>
          </button>
        </div>
        {/* Resize Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-[3px] h-full cursor-col-resize hover:bg-[#2383e2]/50 active:bg-[#2383e2]/70 transition-colors z-10"
        />
      </div>
      <TrashModal open={trashOpen} onClose={() => setTrashOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {activeWorkspaceId && (
        <MembersModal workspaceId={activeWorkspaceId} myRole={myRole} open={membersOpen} onClose={() => setMembersOpen(false)} />
      )}
    </>
  )
}

