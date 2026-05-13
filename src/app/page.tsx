import { getPages } from '@/app/actions'
import { FileText, KanbanSquare, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  const pages = await getPages()
  const recentPages = pages
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
  const favoritePages = pages.filter((p: any) => p.isFavorite)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-[24px] font-bold text-[#37352f] dark:text-[#e6e3dd] mb-3">시작하기</h1>
          <p className="text-[15px] text-[#91918e] mb-4 leading-relaxed">
            사이드바에서 새 문서를 추가하거나<br />
            기존 페이지를 선택하세요.
          </p>
          <div className="flex justify-center gap-4 text-[13px] text-[#b4b4b4] dark:text-[#5a5a5a]">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-[#f1f1ef] dark:bg-[#2f2f2f] text-[#91918e] font-mono text-[12px]">Ctrl+K</kbd>
              <span>검색</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-0.5 rounded bg-[#f1f1ef] dark:bg-[#2f2f2f] text-[#91918e] font-mono text-[12px]">/</kbd>
              <span>블록 커맨드</span>
            </div>
          </div>
        </div>

        {/* Favorites */}
        {favoritePages.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#91918e] uppercase tracking-wider mb-3">
              <Star size={14} /> 즐겨찾기
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {favoritePages.slice(0, 4).map((page: any) => (
                <Link
                  key={page.id}
                  href={`/page/${page.id}`}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[#e9e9e7] dark:border-[#3f3f3f] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  {page.icon ? (
                    <span className="text-lg shrink-0">{page.icon}</span>
                  ) : page.isBoard ? (
                    <KanbanSquare size={18} className="text-[#91918e] shrink-0" />
                  ) : (
                    <FileText size={18} className="text-[#91918e] shrink-0" />
                  )}
                  <span className="text-[14px] text-[#37352f] dark:text-[#e6e3dd] truncate">{page.title || '제목 없음'}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Pages */}
        {recentPages.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#91918e] uppercase tracking-wider mb-3">
              <Clock size={14} /> 최근 페이지
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {recentPages.map((page: any) => (
                <Link
                  key={page.id}
                  href={`/page/${page.id}`}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[#e9e9e7] dark:border-[#3f3f3f] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  {page.icon ? (
                    <span className="text-lg shrink-0">{page.icon}</span>
                  ) : page.isBoard ? (
                    <KanbanSquare size={18} className="text-[#91918e] shrink-0" />
                  ) : (
                    <FileText size={18} className="text-[#91918e] shrink-0" />
                  )}
                  <span className="text-[14px] text-[#37352f] dark:text-[#e6e3dd] truncate">{page.title || '제목 없음'}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Pages */}
        {pages.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#91918e] uppercase tracking-wider mb-3">
              <FileText size={14} /> 모든 페이지 ({pages.length})
            </h2>
            <div className="border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg overflow-hidden">
              {pages.map((page: any, i: number) => (
                <Link
                  key={page.id}
                  href={`/page/${page.id}`}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)] transition-colors ${i > 0 ? 'border-t border-[#e9e9e7] dark:border-[#2f2f2f]' : ''}`}
                >
                  {page.icon ? (
                    <span className="text-base shrink-0">{page.icon}</span>
                  ) : page.isBoard ? (
                    <KanbanSquare size={16} className="text-[#91918e] shrink-0" />
                  ) : (
                    <FileText size={16} className="text-[#91918e] shrink-0" />
                  )}
                  <span className="text-[14px] text-[#37352f] dark:text-[#e6e3dd] truncate flex-1">{page.title || '제목 없음'}</span>
                  <span className="text-[11px] text-[#b4b4b4] dark:text-[#5a5a5a] shrink-0">
                    {new Date(page.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
