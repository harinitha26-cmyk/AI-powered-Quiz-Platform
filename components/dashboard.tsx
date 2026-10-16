'use client'

import { ArrowRight, CircleCheck, Flame, History, Play, Sparkles, Swords, Target } from 'lucide-react'
import Link from 'next/link'
import { AttemptRow } from '@/components/attempt-row'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { EmptyState, LevelEmblem, Panel, SectionTitle, StatCard, XpProgress } from '@/components/game-ui'
import { RecommendationCard } from '@/components/recommendation-card'
import { buttonVariants } from '@/components/ui/button'
import { recommendForPlayer } from '@/lib/adaptive'
import { getEffectiveStreak, getLevelInfo } from '@/lib/progression'
import { usePlayer } from '@/lib/store'
import { getTopic } from '@/lib/topics'

export function Dashboard() {
  const player = usePlayer()
  const info = getLevelInfo(player.xp)
  const streak = getEffectiveStreak(player.streak)
  const { stats } = player
  const accuracy = stats.questionsAnswered ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0
  const recommendations = recommendForPlayer(player.history, 3)
  const active = player.activeQuiz

  return (
    <div className="flex flex-col gap-8">
      <Panel glow="primary" className="relative overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <LevelEmblem level={info.level} size="lg" />
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-2xl font-bold text-balance sm:text-3xl">{player.settings.playerName}</h1>
              <p className="text-sm">
                <span className="text-gradient font-semibold">{info.title}</span>
                <span className="text-muted-foreground"> · {player.xp.toLocaleString()} total XP</span>
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 lg:max-w-sm">
            <XpProgress xp={player.xp} />
            <div className="flex flex-wrap gap-2">
              <Link href="/categories" className={buttonVariants({ variant: 'neon', size: 'lg' })}>
                <Play aria-hidden="true" />
                Play a quiz
              </Link>
              <Link href="/generator" className={buttonVariants({ variant: 'glass', size: 'lg' })}>
                <Sparkles aria-hidden="true" />
                Generate quiz
              </Link>
            </div>
          </div>
        </div>
      </Panel>

      {active && (
        <div className="flex flex-col gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm">
            You have an unfinished <strong>{getTopic(active.config.topicId).name}</strong> quiz — question{' '}
            {active.currentIndex + 1} of {active.questions.length}.
          </p>
          <Link href="/quiz/play" className={buttonVariants({ variant: 'glass' })}>
            Resume
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      )}

      <section aria-label="Quiz statistics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Swords} label="Quizzes played" value={stats.quizzesPlayed} tone="primary" />
        <StatCard icon={Target} label="Accuracy" value={`${accuracy}%`} tone="accent" />
        <StatCard icon={CircleCheck} label="Correct answers" value={stats.correctAnswers} tone="success" />
        <StatCard icon={Flame} label="Day streak" value={streak} hint={`Best: ${player.streak.best} days`} tone="warning" />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <DailyChallengeCard className="lg:col-span-3" />
        <Panel className="lg:col-span-2">
          <SectionTitle
            title="Recent quizzes"
            action={
              player.history.length > 0 && (
                <Link href="/analytics" className="text-sm font-medium text-primary hover:underline">
                  View analytics
                </Link>
              )
            }
          />
          {player.history.length ? (
            <ul className="-mx-2 flex flex-col">
              {player.history.slice(0, 4).map((a) => (
                <AttemptRow key={a.id} attempt={a} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
              <History className="size-6" aria-hidden="true" />
              Your completed quizzes will show up here.
            </div>
          )}
        </Panel>
      </div>

      <section aria-labelledby="recommended-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="recommended-heading" className="text-lg font-semibold">
              Recommended for you
            </h2>
            <p className="text-sm text-muted-foreground">Adapted to your recent accuracy in each topic.</p>
          </div>
          <Link href="/categories" className="shrink-0 text-sm font-medium text-primary hover:underline">
            All topics
          </Link>
        </div>
        {recommendations.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((r) => (
              <RecommendationCard key={r.topicId} recommendation={r} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Sparkles} title="No recommendations yet" description="Play a quiz to get personalised suggestions." />
        )}
      </section>
    </div>
  )
}
