'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvite } from '@/app/workspace-actions'
import { Users, Check, AlertCircle } from 'lucide-react'

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    params.then(async ({ code }) => {
      const res = await acceptInvite(code)
      if (res.error) {
        setStatus('error')
        setMessage(res.error)
        if (res.workspaceId) {
          setTimeout(() => router.push('/'), 2000)
        }
      } else {
        setStatus('success')
        setMessage('워크스페이스에 참여했습니다!')
        setTimeout(() => router.push('/'), 1500)
      }
    }).catch(() => {
      setStatus('error')
      setMessage('초대 처리 중 오류가 발생했습니다')
    })
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfa] dark:bg-[#191919]">
      <div className="text-center max-w-sm p-8">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center animate-pulse">
              <Users size={24} className="text-[#2383e2]" />
            </div>
            <p className="text-[15px] text-[#37352f] dark:text-[#e6e3dd]">초대를 처리하고 있습니다...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <Check size={24} className="text-green-500" />
            </div>
            <p className="text-[15px] font-medium text-[#37352f] dark:text-[#e6e3dd]">{message}</p>
            <p className="text-[13px] text-[#91918e] mt-2">잠시 후 이동합니다...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-[15px] font-medium text-[#37352f] dark:text-[#e6e3dd]">{message}</p>
            <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-[#37352f] dark:bg-[#e6e3dd] text-white dark:text-[#191919] rounded-lg text-[14px] hover:opacity-90">
              홈으로 이동
            </button>
          </>
        )}
      </div>
    </div>
  )
}
