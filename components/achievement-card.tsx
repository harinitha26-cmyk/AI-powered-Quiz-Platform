import {
  CalendarDays,
  Compass,
  Crown,
  Flame,
  Footprints,
  Gem,
  GraduationCap,
  Lock,
  Medal,
  Mountain,
  Rocket,
  Star,
  Swords,
  Target,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'
import { ProgressBar } from '@/components/game-ui'
import { getAchievementProgress, type Achievement, type AchievementIcon } from '@/lib/progression'
import type { PlayerState } from '@/lib/types'
import { cn } from '@/lib/utils'

const ICONS: Record<AchievementIcon, LucideIcon> = {
  footprints: Footprints,
  swords: Swords,
  crown: Crown,
  target: Target,
  gem: Gem,
  flame: Flame,
  rocket: Rocket,
  compass: Compass,
  calendar: CalendarDays,
  mountain: Mountain,
  wand: WandSparkles,
  graduation: GraduationCap,
  star: Star,
  medal: Medal,
}

export function BadgeIcon({ achievement, unlocked, size = 'md' }: { achievement: Achievement; unlocked: boolean; size?: 'sm' | 'md' }) {
  const Icon = ICONS[achievement.icon]
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-2xl',
        size === 'md' ? 'size-12 [&_svg]:size-6' : 'size-10 [&_svg]:size-5',
        unlocked ? 'bg-neon-gradient text-primary-foreground glow-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      <Icon />
      {!unlocked && (
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-border bg-card [&_svg]:size-3">
          <Lock />
        </span>
      )}
    </span>
  )
}

export function AchievementCard({ achievement, state }: { achievement: Achievement; state: PlayerState }) {
  const progress = getAchievementProgress(achievement, state)
  const unlocked = progress.unlockedAt !== null
  return (
    <li
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-border/70 bg-card/60 p-4',
        unlocked && 'border-primary/40 bg-primary/5',
      )}
    >
      <BadgeIcon achievement={achievement} unlocked={unlocked} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-semibold">{achievement.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {unlocked
              ? new Date(progress.unlockedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : `${progress.current}/${progress.target}`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{achievement.description}</span>
        {!unlocked && <ProgressBar value={progress.ratio} label={`${achievement.name} progress`} className="h-1.5" />}
      </div>
    </li>
  )
}
