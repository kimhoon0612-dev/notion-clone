import { getPageByShareLink } from '@/app/actions'
import { notFound } from 'next/navigation'
import { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: Promise<{ link: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { link } = await params
  const page = await getPageByShareLink(link)

  if (!page || !page.isPublic) {
    return {
      title: 'Page Not Found',
    }
  }

  const titleText = `${page.icon ? page.icon + ' ' : ''}${page.title} - Notion Clone`
  
  return {
    title: titleText,
    description: 'Shared page from Notion Clone',
    openGraph: {
      title: titleText,
      description: 'Shared page from Notion Clone',
      images: page.coverImage ? [page.coverImage] : [],
    },
  }
}

export default async function SharedPage({ params }: Props) {
  const { link } = await params
  const page = await getPageByShareLink(link)

  if (!page || !page.isPublic) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#191919]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-2 text-sm text-zinc-400 flex items-center gap-1">
          <span>🌐</span> 공유된 페이지
        </div>
        {page.icon && <div className="text-6xl mb-4">{page.icon}</div>}
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">{page.title}</h1>
        <div
          className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-full"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  )
}
