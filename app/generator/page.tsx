import type { Metadata } from 'next'
import { GeneratorView } from '@/components/generator-view'
import { parseQuizParams } from '@/lib/search-params'

export const metadata: Metadata = { title: 'Quiz Generator' }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = parseQuizParams(await searchParams)
  return <GeneratorView key={`${initial.topicId}-${initial.difficulty}-${initial.count}`} initial={initial} />
}
