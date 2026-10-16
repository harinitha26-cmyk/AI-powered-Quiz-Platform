'use client'

import { CalendarCheck, CircleCheck, Play } from 'lucide-react'
import { DifficultyBadge, Panel, TopicIcon } from '@/components/game-ui'
import { Button } from '@/components/ui/button'
import { getDailyChallenge, toDateKey } from '@/lib/progression'
import { DAILY_BONUS_XP } from '@/lib/quiz-engine'
import { usePlayer, useStartQuiz } from '@/lib/store'
import { getTopic } from '@/lib/topics'

function hoursUntilReset() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000))
}

export function DailyChallengeCard({ className }: { className?: string }) {
  const player = usePlayer()
  const startQuiz = useStartQuiz()
  const today = toDateKey()
  const config = getDailyChallenge(today)
  const topic = getTopic(config.topicId)
  const done = player.daily?.date === today && player.daily.completed

  return (
    <Panel glow="accent" className={className}>
      <div className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            <CalendarCheck className="size-4" aria-hidden="true" />
            Daily challenge
          </div>
          <span className="text-xs text-muted-foreground">Resets in {hoursUntilReset()}h</span>
        </div>

        <div className="flex items-center gap-4">
          <TopicIcon topicId={config.topicId} size="lg" />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl font-bold">{topic.name} Sprint</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <DifficultyBadge difficulty={config.difficulty} />
              <span>{config.count} questions</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-accent">+{DAILY_BONUS_XP} XP bonus</span>
            </div>
          </div>
        </div>

        {done ? (
          <div className="mt-auto flex items-center gap-3 rounded-xl bg-success/12 px-4 py-3 text-sm text-success ring-1 ring-success/30">
            <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
            <span>
              Cleared today with <strong>{player.daily?.accuracy}%</strong> accuracy. Come back tomorrow for a new
              challenge.
            </span>
          </div>
        ) : (
          <Button variant="neon" size="xl" className="mt-auto w-full sm:w-auto" onClick={() => startQuiz(config)}>
            <Play aria-hidden="true" />
            Start daily challenge
          </Button>
        )}
      </div>
    </Panel>
  )
}
