'use client'

import {
  ChartLine,
  Flame,
  Gift,
  Layers,
  LayoutDashboard,
  Sparkles,
  Trophy,
  UserRound,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { PlayerAvatar } from '@/components/player-avatar'
import { getEffectiveStreak, getLevelInfo } from '@/lib/progression'
import { useHydrated, usePlayer } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, mobile: true },
  { href: '/categories', label: 'Categories', short: 'Topics', icon: Layers, mobile: true },
  { href: '/generator', label: 'Quiz Generator', short: 'Generate', icon: Sparkles, mobile: true },
  { href: '/rewards', label: 'Rewards', short: 'Rewards', icon: Gift, mobile: true },
  { href: '/leaderboard', label: 'Leaderboard', short: 'Ranks', icon: Trophy, mobile: false },
  { href: '/analytics', label: 'Analytics', short: 'Stats', icon: ChartLine, mobile: true },
  { href: '/profile', label: 'Profile & Settings', short: 'Profile', icon: UserRound, mobile: false },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href === '/categories') return pathname.startsWith('/categories') || pathname.startsWith('/quiz')
  return pathname.startsWith(href)
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)} aria-label="LevelUp AI home">
      <span className="flex size-9 items-center justify-center rounded-xl bg-neon-gradient glow-primary">
        <Zap className="size-5 text-primary-foreground" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        LevelUp <span className="text-gradient">AI</span>
      </span>
    </Link>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading your progress">
      <div className="h-10 w-1/3 animate-pulse rounded-xl bg-muted" />
      <div className="h-44 animate-pulse rounded-2xl bg-muted/70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const player = usePlayer()
  const { level } = getLevelInfo(player.xp)
  const streak = getEffectiveStreak(player.streak)
  const focusMode = pathname.startsWith('/quiz/play')

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(player.settings.reducedMotion)
  }, [player.settings.reducedMotion])

  const content = hydrated ? children : <PageSkeleton />

  if (focusMode) {
    return <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-6 sm:py-10">{content}</div>
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-sidebar-border bg-sidebar/80 px-4 py-6 backdrop-blur lg:flex">
        <Logo className="px-2" />
        <nav aria-label="Main" className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground',
                  active && 'bg-primary/10 text-primary ring-1 ring-primary/30',
                )}
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>
        {hydrated && (
          <Link
            href="/profile"
            className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-3 transition-colors hover:border-primary/50"
          >
            <PlayerAvatar name={player.settings.playerName} color={player.settings.avatarColor} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">{player.settings.playerName}</span>
              <span className="text-xs text-muted-foreground">
                Level {level} · {player.xp.toLocaleString()} XP
              </span>
            </span>
          </Link>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          {hydrated && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
                <Flame className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Streak:</span>
                {streak}
              </span>
              <Link
                href="/leaderboard"
                className="flex size-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground hover:text-foreground"
                aria-label="Leaderboard"
              >
                <Trophy className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/profile" aria-label="Profile and settings">
                <PlayerAvatar name={player.settings.playerName} color={player.settings.avatarColor} size="sm" />
              </Link>
            </div>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:pt-10 lg:pb-12">
          {content}
        </main>

        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border/60 bg-background/90 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
        >
          {NAV.filter((n) => n.mobile).map(({ href, short, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground',
                  active && 'text-primary',
                )}
              >
                <Icon className={cn('size-5', active && 'drop-shadow-[0_0_8px_var(--primary)]')} aria-hidden="true" />
                {short}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
