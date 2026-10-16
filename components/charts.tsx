import { TONE_STYLES } from '@/components/game-ui'
import type { Tone } from '@/lib/types'
import { cn } from '@/lib/utils'

type Point = { label: string; value: number }

export function LineChart({ data, ariaLabel, max = 100, suffix = '%' }: { data: Point[]; ariaLabel: string; max?: number; suffix?: string }) {
  const points = data.map((d, i) => ({
    ...d,
    x: data.length === 1 ? 50 : (i / (data.length - 1)) * 100,
    y: 100 - (Math.min(d.value, max) / max) * 100,
  }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${line} L${points.at(-1)?.x ?? 100},100 L${points[0]?.x ?? 0},100 Z`
  const ticks = [100, 75, 50, 25, 0]

  return (
    <figure role="img" aria-label={ariaLabel} className="flex flex-col gap-2">
      <div className="flex gap-3">
        <div className="relative h-52 w-9 shrink-0 text-[11px] text-muted-foreground" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2 leading-none" style={{ top: `${100 - t}%` }}>
              {Math.round((t / 100) * max)}
              {suffix}
            </span>
          ))}
        </div>
        <div className="relative h-52 flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-dashed border-border/60" style={{ top: `${100 - t}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <defs>
              <linearGradient id="line-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="line-stroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>
            {points.length > 1 && <path d={area} fill="url(#line-area)" />}
            {points.length > 1 && (
              <path d={line} fill="none" stroke="url(#line-stroke)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            )}
          </svg>
          {points.map((p, i) => (
            <span
              key={i}
              title={`${p.label}: ${p.value}${suffix}`}
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-[0_0_10px_var(--primary)]"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}
        </div>
      </div>
      <figcaption className="flex justify-between gap-1 pl-12 text-[11px] text-muted-foreground" aria-hidden="true">
        {points.map((p, i) => (
          <span key={i} className={cn('truncate', points.length > 8 && i % 2 === 1 && 'hidden sm:inline')}>
            {p.label}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

export function ColumnChart({ data, ariaLabel, tone = 'accent' }: { data: Point[]; ariaLabel: string; tone?: Tone }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <figure role="img" aria-label={ariaLabel} className="flex flex-col gap-2">
      <div className="flex h-52 items-end gap-1.5 border-b border-border/60 sm:gap-2.5" aria-hidden="true">
        {data.map((d, i) => (
          <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
              {d.value}
            </span>
            <div
              className={cn('w-full max-w-10 rounded-t-md opacity-85 transition-all group-hover:opacity-100', TONE_STYLES[tone].bar)}
              style={{ height: `${Math.max(2, (d.value / max) * 85)}%` }}
            />
          </div>
        ))}
      </div>
      <figcaption className="flex gap-1.5 text-[11px] text-muted-foreground sm:gap-2.5" aria-hidden="true">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center">
            {d.label}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

export function BarList({
  items,
  ariaLabel,
}: {
  items: { label: string; value: number | null; tone: Tone; meta?: string; icon?: React.ReactNode }[]
  ariaLabel: string
}) {
  return (
    <ul aria-label={ariaLabel} className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          {item.icon}
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">
                {item.meta && <span className="mr-2">{item.meta}</span>}
                <span className={cn('font-semibold', TONE_STYLES[item.tone].text)}>
                  {item.value === null ? 'Not played' : `${item.value}%`}
                </span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <div
                className={cn('h-full rounded-full transition-[width] duration-700', TONE_STYLES[item.tone].bar)}
                style={{ width: `${item.value ?? 0}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ScoreRing({ value, size = 160, label }: { value: number; size?: number; label: string }) {
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="score-ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#score-ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out drop-shadow-[0_0_8px_var(--primary)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-display text-4xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">accuracy</span>
      </div>
    </div>
  )
}
