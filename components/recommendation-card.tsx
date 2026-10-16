'use client'

import { ArrowRight, Compass, RotateCcw, Target, TrendingUp, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { DifficultyBadge, TONE_STYLES, TopicIcon } from '@/components/game-ui'
import { Button, buttonVariants } from '@/components/ui/button'
import type { Recommendation, RecommendationTier } from '@/lib/adaptive'
import { useStartQuiz } from '@/lib/store'
import { getTopic } from '@/lib/topics'
import type { Tone } from '@/lib/types'
import { cn } from '@/lib/utils'

const TIER_META: Record<RecommendationTier, { label: string; icon: LucideIcon; tone: Tone; cta: string }> = {
  revise: { label: 'Revise', icon: RotateCcw, tone: 'warning', cta: 'Start revision' },
  practice: { label: 'Practice', icon: Target, tone: 'primary', cta: 'Start targeted practice' },
  advance: { label: 'Level up', icon: TrendingUp, tone: 'success', cta: 'Take harder quiz' },
  explore: { label: 'New topic', icon: Compass, tone: 'accent', cta: 'Start warm-up' },
}

export function RecommendationCard({
  recommendation,
  variant = 'compact',
}: {
  recommendation: Recommendation
  variant?: 'compact' | 'featured'
}) {
  const startQuiz = useStartQuiz()
  const meta = TIER_META[recommendation.tier]
  const { config } = recommendation
  const setupHref = `/quiz/setup?topic=${config.topicId}&difficulty=${config.difficulty}&count=${config.count}`

  return (
    <article
      className={cn(
        'flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 transition-colors hover:border-primary/40',
        variant === 'featured' && 'p-6 sm:p-7',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', TONE_STYLES[meta.tone].soft)}>
          <meta.icon className="size-3.5" aria-hidden="true" />
          {meta.label}
        </span>
        {recommendation.accuracy !== null && (
          <span className="text-xs text-muted-foreground">Recent accuracy {recommendation.accuracy}%</span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <TopicIcon topicId={config.topicId} size={variant === 'featured' ? 'lg' : 'md'} />
        <div className="flex flex-col gap-1">
          <h3 className={cn('font-semibold', variant === 'featured' && 'text-xl font-bold')}>{recommendation.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{recommendation.message}</p>
        </div>
      </div>

      {recommendation.focusConcepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Focus on:</span>
          {recommendation.focusConcepts.map((c) => (
            <span key={c} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getTopic(config.topicId).name}</span>
          <DifficultyBadge difficulty={config.difficulty} />
          <span>{config.count} Qs</span>
        </div>
        <div className="flex gap-2">
          {variant === 'featured' && (
            <Link href={setupHref} className={buttonVariants({ variant: 'glass', size: 'lg' })}>
              Customize
            </Link>
          )}
          <Button
            variant={variant === 'featured' ? 'neon' : 'glass'}
            size="lg"
            onClick={() => startQuiz(config)}
            aria-label={`${meta.cta}: ${getTopic(config.topicId).name}`}
          >
            {meta.cta}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}
