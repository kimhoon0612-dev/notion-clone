'use client'

import { useState, useEffect } from 'react'
import { X, UserPlus, Users, Crown, Shield, Pencil, Eye, Copy, Check, Link as LinkIcon, Trash2 } from 'lucide-react'
import { getWorkspaceMembers, inviteMemberByEmail, updateMemberRole, removeMember, createInviteLink } from '@/app/workspace-actions'

type Member = {
  id: string
  role: string
  user: { id: string; name: string | null; email: string; avatar: string | null }
}

const roleIcons: Record<string, any> = {
  owner: Crown,
  admin: Shield,
  editor: Pencil,
  viewer: Eye,
}

const roleLabels: Record<string, string> = {
  owner: '소유자',
  admin: '관리자',
  editor: '편집자',
  viewer: '뷰어',
}

export default function MembersModal({ workspaceId, myRole, open, onClose }: {
  workspaceId: string
  myRole: string
  open: boolean
  onClose: () => void
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  const canManage = ['owner', 'admin'].includes(myRole)

  useEffect(() => {
    if (open && workspaceId) {
      getWorkspaceMembers(workspaceId).then(setMembers)
    }
  }, [open, workspaceId])

  const handleInvite = async () => {
    setError(''); setSuccess('')
    if (!email.trim()) return
    const res = await inviteMemberByEmail(workspaceId, email.trim(), inviteRole)
    if (res.error) { setError(res.error); return }
    setSuccess(`${email} 님을 초대했습니다`)
    setEmail('')
    getWorkspaceMembers(workspaceId).then(setMembers)
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const res = await updateMemberRole(workspaceId, memberId, newRole)
    if (res?.error) { setError(res.error); return }
    getWorkspaceMembers(workspaceId).then(setMembers)
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('이 멤버를 제거하시겠습니까?')) return
    await removeMember(workspaceId, memberId)
    getWorkspaceMembers(workspaceId).then(setMembers)
  }

  const handleCreateLink = async () => {
    const code = await createInviteLink(workspaceId, inviteRole)
    const fullUrl = `${window.location.origin}/invite/${code}`
    setInviteLink(fullUrl)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#252525] rounded-xl shadow-2xl border border-[#e9e9e7] dark:border-[#3f3f3f] overflow-hidden search-modal-enter" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
          <h3 className="text-[16px] font-semibold text-[#37352f] dark:text-[#e6e3dd] flex items-center gap-2">
            <Users size={20} /> 멤버 관리
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-[rgba(255,255,255,0.04)] rounded">
            <X size={16} className="text-[#91918e]" />
          </button>
        </div>

        {/* Invite Section */}
        {canManage && (
          <div className="px-5 py-4 border-b border-[#e9e9e7] dark:border-[#3f3f3f]">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                placeholder="이메일 주소로 초대"
                className="flex-1 px-3 py-2 text-[13px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg bg-transparent text-[#37352f] dark:text-[#e6e3dd] placeholder:text-[#91918e] focus:outline-none focus:ring-1 focus:ring-[#2383e2]"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-2 py-2 text-[12px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none"
              >
                <option value="editor">편집자</option>
                <option value="admin">관리자</option>
                <option value="viewer">뷰어</option>
              </select>
              <button onClick={handleInvite} className="px-3 py-2 bg-[#2383e2] text-white rounded-lg text-[13px] hover:bg-[#0b6bcb] transition-colors">
                <UserPlus size={16} />
              </button>
            </div>

            {/* Invite Link */}
            <div className="mt-3">
              {inviteLink ? (
                <div className="flex items-center gap-2">
                  <input type="text" value={inviteLink} readOnly className="flex-1 px-3 py-1.5 text-[12px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] text-[#91918e]" />
                  <button onClick={handleCopyLink} className="p-1.5 bg-[#37352f] dark:bg-[#e6e3dd] text-white dark:text-[#191919] rounded hover:opacity-90">
                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              ) : (
                <button onClick={handleCreateLink} className="flex items-center gap-1.5 text-[12px] text-[#2383e2] hover:underline">
                  <LinkIcon size={12} /> 초대 링크 생성 (7일간 유효)
                </button>
              )}
            </div>

            {error && <p className="mt-2 text-red-500 text-[12px]">{error}</p>}
            {success && <p className="mt-2 text-green-600 text-[12px]">{success}</p>}
          </div>
        )}

        {/* Members List */}
        <div className="max-h-80 overflow-y-auto">
          <div className="px-5 py-2 text-[11px] font-semibold text-[#91918e] uppercase tracking-wider">
            멤버 ({members.length}명)
          </div>
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role] || Eye
            return (
              <div key={member.id} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                  {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#37352f] dark:text-[#e6e3dd] truncate">
                    {member.user.name || member.user.email}
                  </p>
                  <p className="text-[12px] text-[#91918e] truncate">{member.user.email}</p>
                </div>
                {canManage && member.role !== 'owner' ? (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-2 py-1 text-[11px] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded bg-transparent text-[#37352f] dark:text-[#e6e3dd] focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <option value="admin">관리자</option>
                      <option value="editor">편집자</option>
                      <option value="viewer">뷰어</option>
                    </select>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-1 text-[#91918e] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] text-[#91918e]">
                    <RoleIcon size={12} /> {roleLabels[member.role]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
