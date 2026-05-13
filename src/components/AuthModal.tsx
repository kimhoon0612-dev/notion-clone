'use client'

import { useState } from 'react'
import { registerUser, loginUser } from '@/app/actions'
import { LogIn, UserPlus, X } from 'lucide-react'

export default function AuthModal({ open, onClose, onLogin }: {
  open: boolean
  onClose: () => void
  onLogin: (user: { id: string; name: string | null; email: string }) => void
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'register') {
      const result = await registerUser(email, password, name)
      if (result.error) { setError(result.error); setLoading(false); return }
      if (result.user) onLogin(result.user)
    } else {
      const result = await loginUser(email, password)
      if (result.error) { setError(result.error); setLoading(false); return }
      if (result.user) onLogin(result.user)
    }
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-[#252525] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 p-8 search-modal-enter" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded">
          <X size={18} className="text-zinc-400" />
        </button>

        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">이름</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="홍길동"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">이메일</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">비밀번호</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  )
}
