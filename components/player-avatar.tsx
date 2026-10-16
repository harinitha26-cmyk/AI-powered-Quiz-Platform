import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/types'

const AVATAR_TONES: Record<Tone, string> = {
  primary: 'from-primary to-accent',
  accent: 'from-accent to-primary',
  success: 'from-success to-primary',
  warning: 'from-warning to-accent',
}

const SIZES = { sm: 'size-9 text-xs', md: 'size-10 text-sm', lg: 'size-20 text-2xl' }

export function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'P'
  )
}

export function PlayerAvatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string
  color: Tone
  size?: keyof typeof SIZES
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display font-bold text-primary-foreground',
        AVATAR_TONES[color],
        SIZES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  )
}
