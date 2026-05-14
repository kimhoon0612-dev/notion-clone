'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useState } from 'react'
import { createPage, updatePage } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { FileText, Plus, LayoutGrid, Table as TableIcon, Calendar, Image as ImageIcon, GanttChartSquare } from 'lucide-react'
import TableView from './TableView'
import CalendarView from './CalendarView'
import GalleryView from './GalleryView'
import TimelineView from './TimelineView'

type BoardItem = {
  id: string
  title: string
  status: string
  icon: string | null
  priority?: string
  dueDate?: Date | string | null
}

type BoardViewProps = {
  board: {
    id: string
    title: string
  }
  initialItems: BoardItem[]
}

const COLUMNS = ['To Do', 'In Progress', 'Done']

type ViewType = 'board' | 'table' | 'calendar' | 'gallery' | 'timeline'

export default function BoardView({ board, initialItems }: BoardViewProps) {
  const router = useRouter()
  const [items, setItems] = useState<BoardItem[]>(initialItems)
  const [title, setTitle] = useState(board.title)
  const [activeView, setActiveView] = useState<ViewType>('board')

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newItems = Array.from(items)
    const draggedItemIndex = newItems.findIndex((i) => i.id === draggableId)
    const [draggedItem] = newItems.splice(draggedItemIndex, 1)

    draggedItem.status = destination.droppableId
    newItems.splice(destination.index, 0, draggedItem)

    setItems(newItems)

    await updatePage(draggableId, { status: destination.droppableId })
  }

  const handleAddItem = async (status: string) => {
    const newItem = await createPage(board.id, false, status)
    router.push(`/page/${newItem.id}`)
  }

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    await updatePage(board.id, { title: newTitle })
  }

  const getColumnItems = (status: string) => items.filter((item) => item.status === status)

  const views: { key: ViewType; label: string; icon: React.ReactNode }[] = [
    { key: 'board', label: '보드', icon: <LayoutGrid size={14} /> },
    { key: 'table', label: '테이블', icon: <TableIcon size={14} /> },
    { key: 'calendar', label: '캘린더', icon: <Calendar size={14} /> },
    { key: 'gallery', label: '갤러리', icon: <ImageIcon size={14} /> },
    { key: 'timeline', label: '타임라인', icon: <GanttChartSquare size={14} /> },
  ]

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-x-auto p-8">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="보드 이름"
        className="w-full text-[40px] font-bold bg-transparent outline-none mb-4 placeholder:text-[#e1e1df] dark:placeholder:text-[#3f3f3f] text-[#37352f] dark:text-[#e6e3dd] leading-[1.2]"
      />

      {/* View Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#e9e9e7] dark:border-[#2f2f2f]">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setActiveView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors border-b-2 ${
              activeView === v.key
                ? 'text-[#37352f] dark:text-[#e6e3dd] border-[#37352f] dark:border-[#e6e3dd]'
                : 'text-[#91918e] border-transparent hover:text-[#37352f] dark:hover:text-[#e6e3dd]'
            }`}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </div>

      {/* Board View */}
      {activeView === 'board' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start">
            {COLUMNS.map((columnId) => (
              <div key={columnId} className="flex-shrink-0 w-72 flex flex-col">
                <div className="font-semibold text-[#37352f] dark:text-[#e6e3dd] mb-3 flex items-center justify-between">
                  <span className="bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded text-[13px]">{columnId}</span>
                  <span className="text-[#91918e] text-[13px]">{getColumnItems(columnId).length}</span>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 min-h-[150px] rounded-md transition-colors ${
                        snapshot.isDraggingOver ? 'bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)]' : ''
                      }`}
                    >
                      {getColumnItems(columnId).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => router.push(`/page/${item.id}`)}
                              className={`p-3 mb-2 bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-md shadow-sm cursor-pointer hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.03)] transition-colors group ${
                                snapshot.isDragging ? 'shadow-lg ring-1 ring-[#2383e2]/30' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {item.icon ? (
                                  <span>{item.icon}</span>
                                ) : (
                                  <FileText size={14} className="text-[#91918e]" />
                                )}
                                <span className="text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd] truncate">
                                  {item.title || '제목 없음'}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <button
                  onClick={() => handleAddItem(columnId)}
                  className="mt-2 flex items-center gap-1 text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] px-2 py-1.5 rounded-md text-[13px] transition-colors w-full"
                >
                  <Plus size={16} />
                  <span>새로 만들기</span>
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Table View */}
      {activeView === 'table' && <TableView items={items} />}

      {/* Calendar View */}
      {activeView === 'calendar' && <CalendarView boardId={board.id} items={items} />}

      {/* Gallery View */}
      {activeView === 'gallery' && <GalleryView items={items as any} />}

      {/* Timeline View */}
      {activeView === 'timeline' && <TimelineView items={items as any} />}
    </div>
  )
}
