'use client'

import { useState } from 'react'
import { generateShareLink, removeShareLink } from '@/app/actions'
import { Link, Copy, Check, Globe, Lock, X } from 'lucide-react'

export default function ShareModal({ pageId, isPublic, shareLink, open, onClose }: {
  pageId: string
  isPublic: boolean
  shareLink: string | null
  open: boolean
  onClose: () => void
}) {
  const [shared, setShared] = useState(isPublic)
  const [link, setLink] = useState(shareLink)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleToggleShare = async () => {
    if (shared) {
      await removeShareLink(pageId)
      setShared(false)
      setLink(null)
    } else {
      const newLink = await generateShareLink(pageId)
      setShared(true)
      setLink(newLink)
    }
  }

  const fullUrl = link ? `${window.location.origin}/shared/${link}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-[#e9e9e7] dark:border-[#3f3f3f] overflow-hidden search-modal-enter p-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded">
          <X size={16} className="text-[#91918e]" />
        </button>

        <h3 className="text-[16px] font-semibold text-[#37352f] dark:text-[#e6e3dd] mb-4 flex items-center gap-2">
          <Link size={20} />공유
        </h3>

        <div className="flex items-center justify-between p-3 bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] rounded-lg mb-4">
          <div className="flex items-center gap-2">
            {shared ? <Globe size={18} className="text-green-500" /> : <Lock size={18} className="text-[#91918e]" />}
            <div>
              <p className="text-[14px] font-medium text-[#37352f] dark:text-[#e6e3dd]">
                {shared ? '웹에 공개됨' : '비공개'}
              </p>
              <p className="text-[12px] text-[#91918e]">
                {shared ? '링크가 있는 누구나 볼 수 있습니다' : '나만 볼 수 있습니다'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleShare}
            className={`px-3 py-1.5 text-[13px] rounded-md font-medium transition-colors ${
              shared
                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-[rgba(35,131,226,0.08)] text-[#2383e2] hover:bg-[rgba(35,131,226,0.14)]'
            }`}
          >
            {shared ? '공유 해제' : '공유하기'}
          </button>
        </div>

        {shared && link && (
          <div className="flex items-center gap-2">
            <input
              type="text" value={fullUrl} readOnly
              className="flex-1 px-3 py-2 text-[13px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] text-[#91918e]"
            />
            <button
              onClick={handleCopy}
              className="p-2 bg-[#37352f] dark:bg-[#e6e3dd] text-white dark:text-[#191919] rounded-lg hover:opacity-90 transition-opacity"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
