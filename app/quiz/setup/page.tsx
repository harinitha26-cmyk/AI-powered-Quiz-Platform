import type { Metadata } from 'next'
import { QuizSetupView } from '@/components/quiz-setup-view'
import { parseQuizParams } from '@/lib/search-params'

export const metadata: Metadata = { title: 'Quiz Setup' }

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = parseQuizParams(await searchParams)
  return <QuizSetupView key={`${initial.topicId}-${initial.difficulty}-${initial.count}`} initial={initial} />
}
