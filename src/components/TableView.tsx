'use client'

import { useState, useEffect } from 'react'
import { updatePage } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { FileText, ArrowUpDown, Filter, X, Plus } from 'lucide-react'

type TableItem = {
  id: string
  title: string
  status: string
  icon: string | null
  priority?: string
  dueDate?: Date | string | null
  properties?: string | null
}

const STATUSES = ['To Do', 'In Progress', 'Done']
const PRIORITIES = ['없음', '낮음', '보통', '높음', '긴급']

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | string
type SortDir = 'asc' | 'desc'

type FilterRule = {
  id: string
  field: string
  operator: 'equals' | 'contains'
  value: string
}

export default function TableView({ items: initialItems }: { items: TableItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filterType, setFilterType] = useState<'AND' | 'OR'>('AND')
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const [customColumns, setCustomColumns] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const keys = new Set<string>()
    initialItems.forEach(i => {
      try {
        if (i.properties) {
          Object.keys(JSON.parse(i.properties)).forEach(k => keys.add(k))
        }
      } catch(e) {}
    })
    setCustomColumns(Array.from(keys))
    setItems(initialItems)
  }, [initialItems])

  const handleUpdate = async (id: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
    await updatePage(id, { [field]: value })
  }

  const handleCustomPropUpdate = async (id: string, key: string, value: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    let props: any = {}
    try {
      if (item.properties) props = JSON.parse(item.properties)
    } catch(e) {}
    props[key] = value
    const newPropsString = JSON.stringify(props)
    
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, properties: newPropsString } : i))
    )
    await updatePage(id, { properties: newPropsString })
  }

  const handleAddColumn = () => {
    const name = prompt("새로운 속성 이름을 입력하세요 (예: 태그, 담당자, 비용)")
    if (name && !customColumns.includes(name)) {
      setCustomColumns([...customColumns, name])
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  let displayItems = [...items].map(item => {
    let parsedProps: any = {}
    try {
      if (item.properties) parsedProps = JSON.parse(item.properties)
    } catch(e) {}
    return { ...item, parsedProps }
  })

  // Apply filters
  if (filters.length > 0) {
    displayItems = displayItems.filter((item) => {
      const results = filters.map((f) => {
        let itemVal = ''
        if (['title', 'status', 'priority', 'dueDate'].includes(f.field)) {
          itemVal = (item as any)[f.field] || ''
        } else {
          itemVal = item.parsedProps[f.field] || ''
        }

        if (f.operator === 'equals') return itemVal === f.value
        if (f.operator === 'contains') return itemVal.toLowerCase().includes(f.value.toLowerCase())
        return true
      })
      return filterType === 'AND' ? results.every(Boolean) : results.some(Boolean)
    })
  }

  // Apply sort
  if (sortField) {
    displayItems.sort((a, b) => {
      let aVal = ''
      let bVal = ''

      if (['title', 'status', 'priority', 'dueDate'].includes(sortField)) {
        aVal = (a as any)[sortField] || ''
        bVal = (b as any)[sortField] || ''
      } else {
        aVal = a.parsedProps[sortField] || ''
        bVal = b.parsedProps[sortField] || ''
      }

      if (sortField === 'dueDate') {
        aVal = aVal ? new Date(aVal).getTime().toString() : '0'
        bVal = bVal ? new Date(bVal).getTime().toString() : '0'
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <button onClick={() => handleSort(field)} className="ml-1 opacity-50 hover:opacity-100">
      <ArrowUpDown size={12} className={sortField === field ? 'text-blue-500' : ''} />
    </button>
  )

  const hasFilters = filters.length > 0
  const filterOptions = ['title', 'status', 'priority', 'dueDate', ...customColumns]

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
              hasFilters
                ? 'border-[#2383e2] bg-[rgba(35,131,226,0.08)] text-[#2383e2]'
                : 'border-[#e9e9e7] dark:border-[#3f3f3f] text-[#91918e] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]'
            }`}
          >
            <Filter size={13} />필터
            {hasFilters && <span className="ml-1 bg-blue-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center">{filters.length}</span>}
          </button>
          {hasFilters && (
            <button
              onClick={() => setFilters([])}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd]"
            >
              <X size={12} />초기화
            </button>
          )}
        </div>
        <button
          onClick={handleAddColumn}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#37352f] dark:text-[#e6e3dd] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-md hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        >
          <Plus size={13} /> 열 추가
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="mb-3 p-3 bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[12px] font-medium text-[#91918e]">조건 적용 방식:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'AND' | 'OR')}
              className="px-2 py-1 text-[12px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-white dark:bg-[#252525] text-[#37352f] dark:text-[#e6e3dd]"
            >
              <option value="AND">모든 조건 만족 (AND)</option>
              <option value="OR">하나라도 만족 (OR)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            {filters.map((filter, index) => (
              <div key={filter.id} className="flex items-center gap-2">
                <select
                  value={filter.field}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].field = e.target.value;
                    setFilters(newFilters);
                  }}
                  className="px-2 py-1 text-[12px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-white dark:bg-[#252525] text-[#37352f] dark:text-[#e6e3dd]"
                >
                  {filterOptions.map(opt => <option key={opt} value={opt}>{opt === 'title' ? '제목' : opt === 'status' ? '상태' : opt === 'priority' ? '우선순위' : opt === 'dueDate' ? '마감일' : opt}</option>)}
                </select>
                <select
                  value={filter.operator}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].operator = e.target.value as any;
                    setFilters(newFilters);
                  }}
                  className="px-2 py-1 text-[12px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-white dark:bg-[#252525] text-[#37352f] dark:text-[#e6e3dd]"
                >
                  <option value="equals">와(과) 일치함</option>
                  <option value="contains">을(를) 포함함</option>
                </select>
                <input
                  type="text"
                  placeholder="값 입력"
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...filters];
                    newFilters[index].value = e.target.value;
                    setFilters(newFilters);
                  }}
                  className="px-2 py-1 text-[12px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-white dark:bg-[#252525] text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2] flex-1"
                />
                <button
                  onClick={() => setFilters(filters.filter((_, i) => i !== index))}
                  className="p-1 text-[#91918e] hover:text-[#eb5757] rounded hover:bg-[rgba(235,87,87,0.08)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setFilters([...filters, { id: Math.random().toString(), field: 'title', operator: 'contains', value: '' }])}
              className="w-fit flex items-center gap-1 px-2 py-1 text-[12px] text-[#2383e2] hover:bg-[#2383e2]/10 rounded mt-1 transition-colors"
            >
              <Plus size={14} /> 규칙 추가
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] whitespace-nowrap">
              <th className="text-left px-3 py-2.5 font-medium text-[#91918e] min-w-[200px]">
                제목 <SortIcon field="title" />
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-[#91918e] min-w-[120px]">
                상태 <SortIcon field="status" />
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-[#91918e] min-w-[100px]">
                우선순위 <SortIcon field="priority" />
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-[#91918e] min-w-[150px]">
                마감일 <SortIcon field="dueDate" />
              </th>
              {customColumns.map(col => (
                <th key={col} className="text-left px-3 py-2.5 font-medium text-[#91918e] min-w-[150px]">
                  {col} <SortIcon field={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 && (
              <tr><td colSpan={4 + customColumns.length} className="px-3 py-6 text-center text-[#91918e] text-[13px]">항목이 없습니다</td></tr>
            )}
            {displayItems.map((item) => (
              <tr key={item.id} className="border-t border-[#e9e9e7] dark:border-[#2f2f2f] hover:bg-[rgba(0,0,0,0.01)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="px-3 py-2.5">
                  <button
                    onClick={() => router.push(`/page/${item.id}`)}
                    className="flex items-center gap-2 text-[#37352f] dark:text-[#e6e3dd] hover:text-[#2383e2] transition-colors whitespace-nowrap"
                  >
                    {item.icon ? <span>{item.icon}</span> : <FileText size={14} className="text-[#91918e]" />}
                    <span className="truncate">{item.title || '제목 없음'}</span>
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdate(item.id, 'status', e.target.value)}
                    className={`border-none rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === 'Done' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : item.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={item.priority || '없음'}
                    onChange={(e) => handleUpdate(item.id, 'priority', e.target.value)}
                    className={`border-none rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.priority === '긴급' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : item.priority === '높음' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : item.priority === '보통' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="date"
                    value={item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleUpdate(item.id, 'dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="bg-transparent border border-[#e9e9e7] dark:border-[#3f3f3f] rounded px-2 py-1 text-xs text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
                  />
                </td>
                {customColumns.map(col => (
                  <td key={col} className="px-3 py-2.5">
                    <input
                      type="text"
                      placeholder="값 입력"
                      value={item.parsedProps[col] || ''}
                      onChange={(e) => handleCustomPropUpdate(item.id, col, e.target.value)}
                      className="w-full bg-transparent border border-transparent hover:border-[#e9e9e7] dark:hover:border-[#3f3f3f] rounded px-2 py-1 text-xs text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2] transition-colors"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
