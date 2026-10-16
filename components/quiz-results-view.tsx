'use client'

import { ArrowUp, CircleCheck, CircleX, Clock, Home, RotateCcw, Target, Timer, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { BadgeIcon } from '@/components/achievement-card'
import { ScoreRing } from '@/components/charts'
import { DifficultyBadge, EmptyState, Panel, StatCard, TopicIcon, XpProgress } from '@/components/game-ui'
import { RecommendationCard } from '@/components/recommendation-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { recommendFromAttempt } from '@/lib/adaptive'
import { ACHIEVEMENTS, getLevelTitle } from '@/lib/progression'
import { TIMED_OUT, isCorrect } from '@/lib/quiz-engine'
import { usePlayer, useStartQuiz } from '@/lib/store'
import { getTopic } from '@/lib/topics'
import type { QuizAttempt } from '@/lib/types'
import { cn } from '@/lib/utils'

function headline(accuracy: number) {
  if (accuracy === 100) return 'Flawless victory!'
  if (accuracy >= 80) return 'Champion performance!'
  if (accuracy >= 50) return 'Solid run!'
  return 'Every miss is XP for your brain.'
}

export function QuizResultsView({ attemptId }: { attemptId?: string }) {
  const player = usePlayer()
  const attempt = attemptId ? player.history.find((a) => a.id === attemptId) : player.history[0]

  if (!attempt) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={Trophy} title="No results found" description="Finish a quiz to see your score, XP and explanations here.">
          <Link href="/categories" className={buttonVariants({ variant: 'neon', size: 'lg' })}>
            Start a quiz
          </Link>
        </EmptyState>
      </div>
    )
  }

  return <Results attempt={attempt} xp={player.xp} />
}

function Results({ attempt, xp }: { attempt: QuizAttempt; xp: number }) {
  const startQuiz = useStartQuiz()
  const topic = getTopic(attempt.config.topicId)
  const leveledUp = attempt.levelAfter > attempt.levelBefore
  const newBadges = ACHIEVEMENTS.filter((a) => attempt.newAchievements.includes(a.id))
  const totalSeconds = Math.round(attempt.times.reduce((s, t) => s + t, 0) / 1000)
  const missedCount = attempt.total - attempt.correct
  const recommendation = recommendFromAttempt(attempt)

  function retry() {
    if (attempt.config.source === 'standard') {
      startQuiz({ ...attempt.config, focusQuestionIds: undefined })
    } else {
      startQuiz({ ...attempt.config, source: attempt.config.source === 'daily' ? 'standard' : attempt.config.source }, attempt.questions)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel glow="primary" className="animate-pop-in">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
          <ScoreRing value={attempt.accuracy} label={`Accuracy ${attempt.accuracy}%`} />
          <div className="flex flex-1 flex-col items-center gap-3 text-center md:items-start md:text-left">
            <div className="flex items-center gap-2">
              <TopicIcon topicId={attempt.config.topicId} size="sm" />
              <span className="text-sm font-medium">{topic.name}</span>
              <DifficultyBadge difficulty={attempt.config.difficulty} />
              {attempt.config.source === 'daily' && (
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">Daily</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-balance sm:text-4xl">{headline(attempt.accuracy)}</h1>
            <p className="text-muted-foreground">
              You scored <strong className="text-foreground">{attempt.correct}</strong> out of {attempt.total}.
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-1.5 font-display text-lg font-bold text-primary ring-1 ring-primary/40">
                <Zap className="size-4" aria-hidden="true" />+{attempt.xpEarned} XP
              </span>
              {leveledUp && (
                <span className="flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 font-display text-lg font-bold text-accent ring-1 ring-accent/40">
                  <ArrowUp className="size-4" aria-hidden="true" />
                  Level {attempt.levelAfter} · {getLevelTitle(attempt.levelAfter)}
                </span>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto">
            <Button variant="neon" size="lg" onClick={retry}>
              <RotateCcw aria-hidden="true" />
              Play again
            </Button>
            <Link href="/categories" className={buttonVariants({ variant: 'glass', size: 'lg' })}>
              New topic
            </Link>
            <Link href="/" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              <Home aria-hidden="true" />
              Dashboard
            </Link>
          </div>
        </div>
      </Panel>

      <section aria-label="Result statistics" className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Trophy} label="Score" value={`${attempt.correct}/${attempt.total}`} tone="primary" />
        <StatCard icon={Target} label="Accuracy" value={`${attempt.accuracy}%`} tone="accent" />
        <StatCard icon={CircleCheck} label="Correct answers" value={attempt.correct} hint={`${missedCount} missed`} tone="success" />
        <StatCard icon={Timer} label="Time taken" value={`${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s`} tone="warning" />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-lg font-semibold">XP earned</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {attempt.xpBreakdown.map((item) => (
              <li key={item.label} className="flex justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold text-primary">+{item.xp}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 border-t border-border px-3 pt-3 font-semibold">
              <span>Total</span>
              <span className="text-primary">+{attempt.xpEarned} XP</span>
            </li>
          </ul>
          <XpProgress xp={xp} />
          {newBadges.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Badges unlocked</h3>
              <ul className="flex flex-col gap-2">
                {newBadges.map((b) => (
                  <li key={b.id} className="animate-pop-in flex items-center gap-3">
                    <BadgeIcon achievement={b} unlocked size="sm" />
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold">{b.name}</span>
                      <span className="text-xs text-muted-foreground">{b.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>
        <div className="flex flex-col gap-3 lg:col-span-3">
          <h2 className="text-lg font-semibold">Your next step</h2>
          <RecommendationCard recommendation={recommendation} variant="featured" />
        </div>
      </div>

      <section aria-labelledby="review-heading" className="flex flex-col gap-4">
        <h2 id="review-heading" className="text-lg font-semibold">
          Answer review
        </h2>
        <ol className="flex flex-col gap-3">
          {attempt.questions.map((q, i) => {
            const answer = attempt.answers[i]
            const correct = isCorrect(q, answer)
            const timedOut = answer === TIMED_OUT || answer === null
            return (
              <li
                key={q.id}
                className={cn(
                  'flex flex-col gap-3 rounded-2xl border bg-card/60 p-4 sm:p-5',
                  correct ? 'border-success/30' : 'border-destructive/30',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full',
                      correct ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
                    )}
                  >
                    {correct ? <CircleCheck className="size-4" aria-hidden="true" /> : <CircleX className="size-4" aria-hidden="true" />}
                    <span className="sr-only">{correct ? 'Correct' : 'Incorrect'}</span>
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Q{i + 1} · {q.concept}
                    </span>
                    <p className="font-medium text-pretty">{q.prompt}</p>
                  </div>
                </div>
                {q.code && (
                  <pre className="overflow-x-auto rounded-lg border border-border bg-background/80 p-3 font-mono text-xs text-primary/90">
                    <code>{q.code}</code>
                  </pre>
                )}
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <dt className="text-xs text-muted-foreground">Your answer</dt>
                    <dd className={cn('font-medium', correct ? 'text-success' : 'text-destructive')}>
                      {timedOut ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" aria-hidden="true" />
                          No answer (time ran out)
                        </span>
                      ) : (
                        q.options[answer]
                      )}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <dt className="text-xs text-muted-foreground">Correct answer</dt>
                    <dd className="font-medium text-success">{q.options[q.answerIndex]}</dd>
                  </div>
                </dl>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Explanation: </strong>
                  {q.explanation}
                </p>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
