'use client'

import { useState } from 'react'
import { X, User, Lock, Check, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { updateProfile, changePassword } from '@/app/profile-actions'
import { useI18n } from './I18nProvider'

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session, update } = useSession()
  const { locale, setLocale, locales } = useI18n()
  const [tab, setTab] = useState<'profile' | 'password' | 'language'>('profile')
  const [name, setName] = useState(session?.user?.name || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (!open) return null

  const handleProfileSave = async () => {
    setMessage(''); setError('')
    await updateProfile(name)
    await update({ name })
    setMessage('프로필이 업데이트되었습니다')
  }

  const handlePasswordChange = async () => {
    setMessage(''); setError('')
    if (newPw !== confirmPw) { setError('새 비밀번호가 일치하지 않습니다'); return }
    if (newPw.length < 6) { setError('비밀번호는 6자 이상이어야 합니다'); return }
    const res = await changePassword(currentPw, newPw)
    if (res.error) { setError(res.error); return }
    setMessage('비밀번호가 변경되었습니다')
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-[#e9e9e7] dark:border-[#3f3f3f] overflow-hidden search-modal-enter" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
          <h3 className="text-[16px] font-semibold text-[#37352f] dark:text-[#e6e3dd]">설정</h3>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded"><X size={16} className="text-[#91918e]" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
          <button onClick={() => setTab('profile')} className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'profile' ? 'text-[#37352f] dark:text-[#e6e3dd] border-[#37352f] dark:border-[#e6e3dd]' : 'text-[#91918e] border-transparent'}`}>
            <User size={14} /> 프로필
          </button>
          <button onClick={() => setTab('password')} className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'password' ? 'text-[#37352f] dark:text-[#e6e3dd] border-[#37352f] dark:border-[#e6e3dd]' : 'text-[#91918e] border-transparent'}`}>
            <Lock size={14} /> 비밀번호
          </button>
          <button onClick={() => setTab('language')} className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'language' ? 'text-[#37352f] dark:text-[#e6e3dd] border-[#37352f] dark:border-[#e6e3dd]' : 'text-[#91918e] border-transparent'}`}>
            <Globe size={14} /> 언어
          </button>
        </div>

        <div className="p-4">
          {tab === 'profile' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#91918e] mb-1">이메일</label>
                <input type="text" value={session?.user?.email || ''} disabled className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] text-[#91918e]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#91918e] mb-1">이름</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]" />
              </div>
              <button onClick={handleProfileSave} className="w-full py-2 bg-[#2383e2] text-white rounded font-medium text-[14px] hover:bg-[#0b6bcb] transition-colors">
                저장
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#91918e] mb-1">현재 비밀번호</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#91918e] mb-1">새 비밀번호</label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#91918e] mb-1">새 비밀번호 확인</label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full px-3 py-2 text-[14px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none focus:ring-1 focus:ring-[#2383e2]" />
              </div>
              <button onClick={handlePasswordChange} className="w-full py-2 bg-[#2383e2] text-white rounded font-medium text-[14px] hover:bg-[#0b6bcb] transition-colors">
                비밀번호 변경
              </button>
            </div>
          )}

          {tab === 'language' && (
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-[#91918e] mb-2">인터페이스 언어를 선택하세요</p>
              {locales.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLocale(l.value)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md border transition-colors text-[14px] ${
                    locale === l.value
                      ? 'border-[#2383e2] bg-[#2383e2]/5 text-[#2383e2]'
                      : 'border-[#e9e9e7] dark:border-[#3f3f3f] text-[#37352f] dark:text-[#e6e3dd] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                  <span>{l.label}</span>
                  {locale === l.value && <Check size={16} className="text-[#2383e2]" />}
                </button>
              ))}
            </div>
          )}

          {message && <div className="mt-3 flex items-center gap-1 text-green-600 text-[13px]"><Check size={14} /> {message}</div>}
          {error && <div className="mt-3 text-red-500 text-[13px]">{error}</div>}
        </div>
      </div>
    </div>
  )
}
