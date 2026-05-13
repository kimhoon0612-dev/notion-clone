'use client'

import { useState, useEffect } from 'react'
import { addComment, getComments, deleteComment } from '@/app/actions'
import { MessageCircle, Send, Trash2, X } from 'lucide-react'
import { useSession } from 'next-auth/react'

type CommentData = {
  id: string
  content: string
  author: string
  createdAt: Date
}

export default function CommentSection({ pageId }: { pageId: string }) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState('')
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (open) {
      getComments(pageId).then(setComments)
    }
  }, [open, pageId])

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    const authorName = session?.user?.name || '익명'
    const comment = await addComment(pageId, newComment.trim(), authorName)
    setComments((prev) => [comment, ...prev])
    setNewComment('')
  }

  const handleDelete = async (id: string) => {
    await deleteComment(id)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="border-t border-[#e9e9e7] dark:border-[#2f2f2f] mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-8 py-3 text-[13px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] transition-colors w-full"
      >
        <MessageCircle size={16} />
        <span>댓글 {comments.length > 0 ? `(${comments.length})` : ''}</span>
      </button>

      {open && (
        <div className="px-8 pb-6">
          {/* New Comment Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="댓글을 입력하세요..."
              className="flex-1 px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg bg-transparent text-[#37352f] dark:text-[#e6e3dd] placeholder:text-[#91918e] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="p-2 bg-[#2383e2] hover:bg-[#0b6bcb] disabled:bg-[#e9e9e7] dark:disabled:bg-[#3f3f3f] text-white rounded-lg transition-colors"
            >
              <Send size={16} />
            </button>
          </div>

          {/* Comment List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="group flex items-start gap-3 p-3 rounded-lg bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {comment.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-[#37352f] dark:text-[#e6e3dd]">{comment.author}</span>
                    <span className="text-[11px] text-[#91918e]">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-[14px] text-[#37352f] dark:text-[#ffffffcf]">{comment.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded text-[#91918e] hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
