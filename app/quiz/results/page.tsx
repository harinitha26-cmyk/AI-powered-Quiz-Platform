import type { Metadata } from 'next'
import { QuizResultsView } from '@/components/quiz-results-view'

export const metadata: Metadata = { title: 'Results' }

export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const { id } = await searchParams
  return <QuizResultsView attemptId={Array.isArray(id) ? id[0] : id} />
}
