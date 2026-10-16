'use client'

import { ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { PageHeader, ProgressBar, TONE_STYLES, TopicIcon } from '@/components/game-ui'
import { buttonVariants } from '@/components/ui/button'
import { getAdaptiveTier, getTopicStats } from '@/lib/adaptive'
import { countQuestions } from '@/lib/questions'
import { usePlayer, useStartQuiz } from '@/lib/store'
import { DIFFICULTY_LABELS, TOPICS } from '@/lib/topics'
import { cn } from '@/lib/utils'

const TIER_LABEL = { revise: 'Needs revision', practice: 'Keep practising', advance: 'Strong' } as const

export function CategoriesView() {
  const player = usePlayer()
  const startQuiz = useStartQuiz()
  const stats = getTopicStats(player.history)
  const { defaultDifficulty, defaultCount } = player.settings

  return (
    <div>
      <PageHeader
        eyebrow="Quiz categories"
        title="Choose your arena"
        description="Five topics, three difficulty levels. Pick a category to customise your quiz, or jump straight in with your default settings."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOPICS.map((topic) => {
          const s = stats.find((st) => st.topicId === topic.id)!
          const tier = s.accuracy !== null ? getAdaptiveTier(s.accuracy) : null
          return (
            <li
              key={topic.id}
              className="group flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/70 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:glow-primary sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <TopicIcon topicId={topic.id} size="lg" />
                <span className="text-xs text-muted-foreground">{countQuestions(topic.id)} questions</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold">{topic.name}</h2>
                <p className={cn('text-sm font-medium', TONE_STYLES[topic.tone].text)}>{topic.tagline}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {s.attempts ? `${s.attempts} played · best ${s.bestAccuracy}%` : 'Not played yet'}
                  </span>
                  {tier && <span className="font-semibold">{TIER_LABEL[tier]}</span>}
                </div>
                <ProgressBar value={(s.accuracy ?? 0) / 100} tone={topic.tone} label={`${topic.name} mastery`} />
              </div>
              <div className="mt-auto flex gap-2">
                <Link
                  href={`/quiz/setup?topic=${topic.id}`}
                  className={cn(buttonVariants({ variant: 'neon', size: 'lg' }), 'flex-1')}
                >
                  Set up quiz
                  <ArrowRight aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    startQuiz({ topicId: topic.id, difficulty: defaultDifficulty, count: defaultCount, source: 'standard' })
                  }
                  className={buttonVariants({ variant: 'glass', size: 'lg' })}
                  aria-label={`Quick play ${topic.name}: ${DIFFICULTY_LABELS[defaultDifficulty]}, ${defaultCount} questions`}
                  title={`Quick play · ${DIFFICULTY_LABELS[defaultDifficulty]} · ${defaultCount} Qs`}
                >
                  <Zap aria-hidden="true" />
                  Quick
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
