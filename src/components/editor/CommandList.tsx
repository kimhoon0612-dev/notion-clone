import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    },
  }))

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden py-1 z-50 w-64">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors ${
              index === selectedIndex
                ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-md p-1 shadow-sm shrink-0">
              {item.icon}
            </div>
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">결과가 없습니다</div>
      )}
    </div>
  )
})
CommandList.displayName = 'CommandList'
