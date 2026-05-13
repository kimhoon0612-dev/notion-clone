'use client'

import { useRouter } from 'next/navigation'
import { FileText, Image as ImageIcon } from 'lucide-react'

type GalleryItem = {
  id: string
  title: string
  icon: string | null
  coverImage?: string | null
  content?: string
}

type GalleryViewProps = {
  items: GalleryItem[]
}

export default function GalleryView({ items }: GalleryViewProps) {
  const router = useRouter()

  const extractFirstImage = (content: string): string | null => {
    const match = content.match(/src="([^"]+)"/)
    return match ? match[1] : null
  }

  const getPreviewText = (content: string): string => {
    return content
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .slice(0, 100)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-12 text-[#91918e] text-[14px]">
          아직 항목이 없습니다
        </div>
      ) : (
        items.map((item) => {
          const coverImg = item.coverImage || (item.content ? extractFirstImage(item.content) : null)
          const preview = item.content ? getPreviewText(item.content) : ''

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/page/${item.id}`)}
              className="group cursor-pointer bg-white dark:bg-[#252525] border border-[#e9e9e7] dark:border-[#3f3f3f] rounded-lg overflow-hidden hover:shadow-md hover:border-[#2383e2]/30 transition-all duration-200"
            >
              {/* Cover Image */}
              <div className="h-36 bg-[#f7f7f5] dark:bg-[#1e1e1e] overflow-hidden flex items-center justify-center">
                {coverImg ? (
                  <img
                    src={coverImg}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#c4c4c0] dark:text-[#3f3f3f]">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.icon ? (
                    <span className="text-[16px]">{item.icon}</span>
                  ) : (
                    <FileText size={14} className="text-[#91918e] shrink-0" />
                  )}
                  <span className="text-[14px] font-medium text-[#37352f] dark:text-[#e6e3dd] truncate">
                    {item.title || '제목 없음'}
                  </span>
                </div>
                {preview && (
                  <p className="text-[12px] text-[#91918e] line-clamp-2 leading-relaxed">
                    {preview}
                  </p>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
