import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { DifficultyBadge, TopicIcon } from '@/components/game-ui'
import { getTopic } from '@/lib/topics'
import type { QuizAttempt } from '@/lib/types'
import { cn } from '@/lib/utils'

const SOURCE_LABEL = { standard: null, daily: 'Daily', generated: 'Generated' } as const

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function AttemptRow({ attempt }: { attempt: QuizAttempt }) {
  const sourceLabel = SOURCE_LABEL[attempt.config.source]
  const tone = attempt.accuracy >= 80 ? 'text-success' : attempt.accuracy >= 50 ? 'text-warning' : 'text-destructive'
  return (
    <li>
      <Link
        href={`/quiz/results?id=${attempt.id}`}
        className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition-colors hover:border-border hover:bg-muted/40 sm:px-3"
      >
        <TopicIcon topicId={attempt.config.topicId} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-2 truncate text-sm font-medium">
            {getTopic(attempt.config.topicId).name}
            {sourceLabel && (
              <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent uppercase">
                {sourceLabel}
              </span>
            )}
          </span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <DifficultyBadge difficulty={attempt.config.difficulty} className="px-2 py-0 text-[10px]" />
            {formatDate(attempt.completedAt)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={cn('font-display text-base font-bold', tone)}>{attempt.accuracy}%</span>
          <span className="text-xs text-primary">+{attempt.xpEarned} XP</span>
        </div>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  )
}
