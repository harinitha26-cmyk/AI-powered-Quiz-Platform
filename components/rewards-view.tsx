'use client'

import { Flame } from 'lucide-react'
import { AchievementCard } from '@/components/achievement-card'
import { DailyChallengeCard } from '@/components/daily-challenge-card'
import { LevelEmblem, PageHeader, Panel, XpProgress } from '@/components/game-ui'
import { ACHIEVEMENTS, LEVEL_TITLES, getEffectiveStreak, getLastDays, getLevelInfo, totalXpForLevel } from '@/lib/progression'
import { DAILY_BONUS_XP, PERFECT_BONUS_XP, XP_PER_CORRECT } from '@/lib/quiz-engine'
import { usePlayer } from '@/lib/store'
import { cn } from '@/lib/utils'

export function RewardsView() {
  const player = usePlayer()
  const info = getLevelInfo(player.xp)
  const streak = getEffectiveStreak(player.streak)
  const playedDays = new Set(player.history.map((a) => new Date(a.completedAt).toDateString()))
  const days = getLastDays(7)
  const unlocked = ACHIEVEMENTS.filter((a) => player.achievements[a.id]).length
  const milestones = [1, 2, 3, 5, 7, 10].map((level) => ({ level, xp: totalXpForLevel(level) }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Rewards"
        title="Your progression"
        description="Earn XP for every correct answer, keep your streak alive and unlock badges as you master each topic."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel glow="primary" className="flex flex-col gap-5 lg:col-span-2">
          <div className="flex items-center gap-4">
            <LevelEmblem level={info.level} size="lg" />
            <div>
              <p className="text-sm text-muted-foreground">Current rank</p>
              <h2 className="text-gradient text-2xl font-bold">{info.title}</h2>
            </div>
          </div>
          <XpProgress xp={player.xp} />
          <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Level milestones">
            {milestones.map((m) => {
              const reached = info.level >= m.level
              return (
                <li
                  key={m.level}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl border border-border p-2 text-center',
                    reached && 'border-primary/50 bg-primary/10',
                  )}
                >
                  <span className={cn('font-display text-lg font-bold', reached ? 'text-primary' : 'text-muted-foreground')}>
                    Lv {m.level}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{LEVEL_TITLES[Math.min(m.level - 1, LEVEL_TITLES.length - 1)]}</span>
                  <span className="text-[11px] text-muted-foreground">{m.xp.toLocaleString()} XP</span>
                </li>
              )
            })}
          </ol>
        </Panel>

        <Panel className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-warning/15 text-warning ring-1 ring-warning/30">
              <Flame className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-3xl font-bold">{streak} days</p>
              <p className="text-xs text-muted-foreground">Current streak · best {player.streak.best}</p>
            </div>
          </div>
          <ol className="grid grid-cols-7 gap-1.5" aria-label="Activity in the last 7 days">
            {days.map((d) => {
              const active = playedDays.has(d.date.toDateString())
              return (
                <li key={d.key} className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg bg-muted',
                      active && 'bg-warning text-background glow-primary',
                    )}
                  >
                    {active && <Flame className="size-4" aria-hidden="true" />}
                    <span className="sr-only">{active ? 'Played' : 'Not played'}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">{d.label}</span>
                </li>
              )
            })}
          </ol>
          <p className="text-xs text-muted-foreground">Complete at least one quiz a day to grow your streak.</p>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DailyChallengeCard className="lg:col-span-2" />
        <Panel className="flex flex-col gap-3">
          <h2 className="font-semibold">How to earn XP</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <li key={d} className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span className="capitalize text-muted-foreground">Correct answer ({d})</span>
                <span className="font-semibold text-primary">+{XP_PER_CORRECT[d]}</span>
              </li>
            ))}
            <li className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Perfect score bonus</span>
              <span className="font-semibold text-primary">+{PERFECT_BONUS_XP}</span>
            </li>
            <li className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">Daily challenge bonus</span>
              <span className="font-semibold text-primary">+{DAILY_BONUS_XP}</span>
            </li>
          </ul>
        </Panel>
      </div>

      <section aria-labelledby="badges-heading" className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 id="badges-heading" className="text-lg font-semibold">
            Badges &amp; achievements
          </h2>
          <span className="text-sm text-muted-foreground">
            {unlocked}/{ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ACHIEVEMENTS.map((a) => (
            <AchievementCard key={a.id} achievement={a} state={player} />
          ))}
        </ul>
      </section>
    </div>
  )
}
