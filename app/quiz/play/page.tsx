import type { Metadata } from 'next'
import { QuizPlayView } from '@/components/quiz-play-view'

export const metadata: Metadata = { title: 'Play' }

export default function Page() {
  return <QuizPlayView />
}
