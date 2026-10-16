import {
  Calculator,
  Code,
  Database,
  Globe,
  Network,
  type LucideIcon,
} from 'lucide-react'
import { getLevelInfo } from '@/lib/progression'
import { DIFFICULTY_LABELS, getTopic } from '@/lib/topics'
import type { Difficulty, Tone, TopicId } from '@/lib/types'
import { cn } from '@/lib/utils'

export const TONE_STYLES: Record<Tone, { text: string; soft: string; bar: string }> = {
  primary: { text: 'text-primary', soft: 'bg-primary/12 text-primary ring-1 ring-primary/30', bar: 'bg-primary' },
  accent: { text: 'text-accent', soft: 'bg-accent/15 text-accent ring-1 ring-accent/30', bar: 'bg-accent' },
  success: { text: 'text-success', soft: 'bg-success/12 text-success ring-1 ring-success/30', bar: 'bg-success' },
  warning: { text: 'text-warning', soft: 'bg-warning/12 text-warning ring-1 ring-warning/30', bar: 'bg-warning' },
}

export function Panel({
  className,
  glow,
  ...props
}: React.ComponentProps<'section'> & { glow?: 'primary' | 'accent' }) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm sm:p-6',
        glow === 'primary' && 'border-primary/40 glow-primary',
        glow === 'accent' && 'border-accent/40 glow-accent',
        className,
      )}
      {...props}
    />
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>}
        <h1 className="text-pretty text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="text-pretty leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {action}
    </div>
  )
}

const TOPIC_ICONS: Record<TopicId, LucideIcon> = {
  python: Code,
  sql: Database,
  aptitude: Calculator,
  dsa: Network,
  gk: Globe,
}

export function TopicIcon({ topicId, size = 'md' }: { topicId: TopicId; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = TOPIC_ICONS[topicId]
  const tone = TONE_STYLES[getTopic(topicId).tone]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl',
        tone.soft,
        size === 'sm' && 'size-8 [&_svg]:size-4',
        size === 'md' && 'size-11 [&_svg]:size-5',
        size === 'lg' && 'size-14 [&_svg]:size-7',
      )}
    >
      <Icon />
    </span>
  )
}

const DIFFICULTY_TONE: Record<Difficulty, Tone> = { easy: 'success', medium: 'warning', hard: 'accent' }

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONE_STYLES[DIFFICULTY_TONE[difficulty]].soft,
        className,
      )}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  )
}

export function ProgressBar({
  value,
  tone = 'primary',
  label,
  className,
}: {
  value: number
  tone?: Tone | 'gradient'
  label: string
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          tone === 'gradient' ? 'bg-neon-gradient shadow-[0_0_12px_var(--primary)]' : TONE_STYLES[tone].bar,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function LevelEmblem({ level, size = 'md' }: { level: number; size?: 'md' | 'lg' }) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-2xl bg-neon-gradient p-[2px] glow-primary',
        size === 'md' ? 'size-14' : 'size-20',
      )}
    >
      <div className="flex size-full flex-col items-center justify-center rounded-[calc(1rem-2px)] bg-background">
        <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Lvl</span>
        <span className={cn('font-display leading-none font-bold', size === 'md' ? 'text-xl' : 'text-3xl')}>
          {level}
        </span>
      </div>
    </div>
  )
}

export function XpProgress({ xp, className }: { xp: number; className?: string }) {
  const info = getLevelInfo(xp)
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold">
          {info.xpIntoLevel} <span className="text-muted-foreground">/ {info.xpForLevel} XP</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {info.xpRemaining} XP to level {info.level + 1}
        </span>
      </div>
      <ProgressBar value={info.progress} tone="gradient" label={`Progress to level ${info.level + 1}`} className="h-3" />
    </div>
  )
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'primary',
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: Tone
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
      <span className={cn('flex size-9 items-center justify-center rounded-lg', TONE_STYLES[tone].soft)}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/30">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export function DemoTag({ children = 'Demo' }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
      {children}
    </span>
  )
}
