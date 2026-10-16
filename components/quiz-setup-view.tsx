'use client'

import { Clock, Play, Sparkles, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DifficultyBadge, PageHeader, Panel, TopicIcon } from '@/components/game-ui'
import { QuizConfigFields, type QuizConfigDraft } from '@/components/quiz-config-fields'
import { Button, buttonVariants } from '@/components/ui/button'
import { getTopicStats } from '@/lib/adaptive'
import { PERFECT_BONUS_XP, maxXpFor } from '@/lib/quiz-engine'
import { usePlayer, useStartQuiz } from '@/lib/store'
import { getTopic } from '@/lib/topics'

export function QuizSetupView({ initial }: { initial: Partial<QuizConfigDraft> }) {
  const player = usePlayer()
  const startQuiz = useStartQuiz()
  const [draft, setDraft] = useState<QuizConfigDraft>({
    topicId: initial.topicId ?? 'python',
    difficulty: initial.difficulty ?? player.settings.defaultDifficulty,
    count: initial.count ?? player.settings.defaultCount,
  })
  const topic = getTopic(draft.topicId)
  const topicStats = getTopicStats(player.history).find((s) => s.topicId === draft.topicId)
  const timer = player.settings.timerSeconds

  return (
    <div>
      <PageHeader
        eyebrow="Quiz setup"
        title="Configure your run"
        description="Choose a topic, difficulty and length. Harder quizzes award more XP per correct answer."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <QuizConfigFields value={draft} onChange={setDraft} />
        </Panel>

        <Panel glow="primary" className="flex h-fit flex-col gap-5 lg:sticky lg:top-10">
          <div className="flex items-center gap-3">
            <TopicIcon topicId={draft.topicId} size="lg" />
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">{topic.name}</h2>
              <DifficultyBadge difficulty={draft.difficulty} className="w-fit" />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="text-xs text-muted-foreground">Questions</dt>
              <dd className="font-display text-xl font-bold">{draft.count}</dd>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" aria-hidden="true" />
                Timer
              </dt>
              <dd className="font-display text-xl font-bold">{timer ? `${timer}s` : 'Off'}</dd>
            </div>
            <div className="col-span-2 rounded-xl bg-muted/60 p-3">
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Trophy className="size-3" aria-hidden="true" />
                Max XP
              </dt>
              <dd className="font-display text-xl font-bold text-primary">
                {maxXpFor(draft.difficulty, draft.count)} XP
                <span className="ml-2 text-xs font-normal text-muted-foreground">incl. +{PERFECT_BONUS_XP} perfect bonus</span>
              </dd>
            </div>
          </dl>
          {topicStats?.attempts ? (
            <p className="text-xs text-muted-foreground">
              Your {topic.name} accuracy so far: <strong className="text-foreground">{topicStats.accuracy}%</strong> over{' '}
              {topicStats.attempts} quiz{topicStats.attempts === 1 ? '' : 'zes'}.
            </p>
          ) : null}
          <Button variant="neon" size="xl" onClick={() => startQuiz({ ...draft, source: 'standard' })}>
            <Play aria-hidden="true" />
            Start quiz
          </Button>
          <Link
            href={`/generator?topic=${draft.topicId}&difficulty=${draft.difficulty}&count=${draft.count}`}
            className={buttonVariants({ variant: 'ghost' })}
          >
            <Sparkles aria-hidden="true" />
            Generate a fresh set instead
          </Link>
          <p className="text-xs text-muted-foreground">Change the timer in Profile &amp; Settings.</p>
        </Panel>
      </div>
    </div>
  )
}
