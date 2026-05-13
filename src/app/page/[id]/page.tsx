import { getPage, getBoardItems } from '@/app/actions'
import Editor from '@/components/Editor'
import BoardView from '@/components/BoardView'
import { notFound } from 'next/navigation'

export default async function PageView({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const page = await getPage(id)

  if (!page) {
    notFound()
  }

  if (page.isBoard) {
    const items = await getBoardItems(id)
    return <BoardView board={page} initialItems={items} />
  }

  return <Editor key={page.id} page={page} />
}
