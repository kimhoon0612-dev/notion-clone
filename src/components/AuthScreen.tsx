'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser, loginUser } from '@/app/actions'

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        const { signIn } = await import('next-auth/react')
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })
        if (res?.error) setError('이메일 또는 비밀번호가 잘못되었습니다.')
        else router.refresh()
      } else {
        const res = await registerUser(email, password, name)
        if (res.error) {
          setError(res.error)
          return
        }
        setIsLogin(true)
        setError('회원가입이 완료되었습니다. 로그인해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#fdfdfc] dark:from-[#1e1b4b] dark:to-[#111827] transition-colors p-4 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-300 dark:bg-indigo-900 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-300 dark:bg-purple-900 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-[420px] p-10 bg-white/70 dark:bg-[#1f2937]/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/50 dark:border-white/10 z-10 transition-all duration-300">
        <div className="text-center mb-10">
          <div className="text-5xl mb-5 hover:scale-110 transition-transform duration-300 cursor-default drop-shadow-md">✨</div>
          <h1 className="text-[24px] font-bold text-gray-900 dark:text-white tracking-tight font-outfit">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-2">
            {isLogin ? '다시 오신 것을 환영합니다!' : '새로운 계정을 만들어보세요!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <div>
              <label className="block text-[12px] font-medium text-[#91918e] mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
              />
            </div>
          )}
          
          <div>
            <label className="block text-[12px] font-medium text-[#91918e] mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#91918e] mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
            />
          </div>

          {error && <div className="text-red-500 text-[13px]">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-[15px] hover:-translate-y-0.5 hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e9e9e7] dark:border-[#3f3f3f]"></div>
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-white dark:bg-[#252525] px-2 text-[#91918e]">또는</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={async () => {
              const { signIn } = await import('next-auth/react')
              signIn('google')
            }}
            className="w-full py-2.5 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google로 계속하기
          </button>
          <button
            type="button"
            onClick={async () => {
              const { signIn } = await import('next-auth/react')
              signIn('github')
            }}
            className="w-full py-2.5 bg-white/80 dark:bg-[#252525]/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-[14px] hover:bg-gray-50 dark:hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            GitHub으로 계속하기
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[13px] text-[#91918e] hover:text-[#37352f] dark:hover:text-[#e6e3dd] transition-colors"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  )
}
