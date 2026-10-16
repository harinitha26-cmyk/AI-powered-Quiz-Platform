'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

export type OptionItem<T extends string | number> = {
  value: T
  label: string
  description?: string
}

export function OptionGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: OptionItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const index = options.findIndex((o) => o.value === value)
    const next = options[(index + delta + options.length) % options.length]
    onChange(next.value)
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    buttons[options.indexOf(next)]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm font-semibold transition-all hover:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              selected && 'border-primary bg-primary/12 text-primary glow-primary',
            )}
          >
            {option.label}
            {option.description && (
              <span className={cn('text-xs font-normal text-muted-foreground', selected && 'text-primary/80')}>
                {option.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium" id={`${id}-label`}>
          {label}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground" id={`${id}-desc`}>
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border border-border bg-muted transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
          checked && 'border-primary bg-primary/80 glow-primary',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-4.5 rounded-full bg-foreground transition-transform',
            checked && 'translate-x-5 bg-primary-foreground',
          )}
        />
      </button>
    </div>
  )
}
