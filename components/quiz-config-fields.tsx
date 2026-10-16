'use client'

import { OptionGroup } from '@/components/option-group'
import { TopicIcon } from '@/components/game-ui'
import { QUESTION_COUNTS, XP_PER_CORRECT } from '@/lib/quiz-engine'
import { DIFFICULTIES, DIFFICULTY_LABELS, TOPICS } from '@/lib/topics'
import type { Difficulty, TopicId } from '@/lib/types'
import { cn } from '@/lib/utils'

export type QuizConfigDraft = { topicId: TopicId; difficulty: Difficulty; count: number }

export function QuizConfigFields({
  value,
  onChange,
}: {
  value: QuizConfigDraft
  onChange: (value: QuizConfigDraft) => void
}) {
  return (
    <div className="flex flex-col gap-7">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-semibold">Topic</legend>
        <div role="radiogroup" aria-label="Topic" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => {
            const selected = t.id === value.topicId
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...value, topicId: t.id })}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition-all hover:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
                  selected && 'border-primary bg-primary/10 glow-primary',
                )}
              >
                <TopicIcon topicId={t.id} size="sm" />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.tagline}</span>
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold">Difficulty</span>
        <OptionGroup
          label="Difficulty"
          value={value.difficulty}
          onChange={(difficulty) => onChange({ ...value, difficulty })}
          options={DIFFICULTIES.map((d) => ({
            value: d,
            label: DIFFICULTY_LABELS[d],
            description: `${XP_PER_CORRECT[d]} XP / correct`,
          }))}
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold">Number of questions</span>
        <OptionGroup
          label="Number of questions"
          value={value.count}
          onChange={(count) => onChange({ ...value, count })}
          options={QUESTION_COUNTS.map((c) => ({ value: c, label: `${c} questions` }))}
        />
      </div>
    </div>
  )
}
