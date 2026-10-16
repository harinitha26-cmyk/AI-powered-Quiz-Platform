'use client'

import { CircleCheck, Info, LoaderCircle, Play, RefreshCw, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { DemoTag, PageHeader, Panel } from '@/components/game-ui'
import { QuizConfigFields, type QuizConfigDraft } from '@/components/quiz-config-fields'
import { Button } from '@/components/ui/button'
import { activeQuizGenerator, type QuizGenerationResult } from '@/lib/ai/quiz-generator'
import { usePlayer, useStartQuiz } from '@/lib/store'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

export function GeneratorView({ initial }: { initial: Partial<QuizConfigDraft> }) {
  const player = usePlayer()
  const startQuiz = useStartQuiz()
  const [draft, setDraft] = useState<QuizConfigDraft>({
    topicId: initial.topicId ?? 'python',
    difficulty: initial.difficulty ?? player.settings.defaultDifficulty,
    count: initial.count ?? player.settings.defaultCount,
  })
  const [focus, setFocus] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [result, setResult] = useState<(QuizGenerationResult & { request: QuizConfigDraft }) | null>(null)

  async function generate(e?: React.FormEvent) {
    e?.preventDefault()
    setStatus('loading')
    try {
      const res = await activeQuizGenerator.generate({ ...draft, focus: focus.trim() || undefined })
      setResult({ ...res, request: draft })
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="AI quiz generator"
        title="Generate a custom quiz"
        description="Describe what you want to practise and get a fresh set of multiple-choice questions with answers and explanations."
      />

      <div
        role="note"
        className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        <p>
          <strong>Mock generation mode.</strong>{' '}
          <span className="text-muted-foreground">
            No AI model is connected yet — questions are assembled from the built-in bank and numeric templates. The app
            calls a single generator interface, so a real AI API can be plugged in later without UI changes.
          </span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel className="lg:col-span-2">
          <form onSubmit={generate} className="flex flex-col gap-7">
            <QuizConfigFields value={draft} onChange={setDraft} />
            <div className="flex flex-col gap-2">
              <label htmlFor="focus" className="text-sm font-semibold">
                Focus <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. joins, list comprehensions, percentages"
                maxLength={80}
                className="h-11 rounded-xl border border-input bg-background/50 px-3 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
              />
              <p className="text-xs text-muted-foreground">Keywords are matched against question topics and concepts.</p>
            </div>
            <Button type="submit" variant="neon" size="xl" disabled={status === 'loading'}>
              {status === 'loading' ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles aria-hidden="true" />
              )}
              {status === 'loading' ? 'Generating…' : 'Generate questions'}
            </Button>
          </form>
        </Panel>

        <section aria-labelledby="preview-heading" aria-busy={status === 'loading'} className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 id="preview-heading" className="text-lg font-semibold">
                Preview
              </h2>
              <DemoTag>{activeQuizGenerator.label}</DemoTag>
            </div>
            {result && (
              <div className="flex gap-2">
                <Button variant="glass" onClick={() => generate()} disabled={status === 'loading'}>
                  <RefreshCw aria-hidden="true" />
                  Regenerate
                </Button>
                <Button
                  variant="neon"
                  disabled={status === 'loading' || result.questions.length === 0}
                  onClick={() => startQuiz({ ...result.request, source: 'generated' }, result.questions)}
                >
                  <Play aria-hidden="true" />
                  Play this quiz
                </Button>
              </div>
            )}
          </div>

          {status === 'error' && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Generation failed. Please try again.
            </p>
          )}

          {status === 'loading' && !result && (
            <ul className="flex flex-col gap-3" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-36 animate-pulse rounded-2xl bg-card/60" />
              ))}
            </ul>
          )}

          {!result && status !== 'loading' && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
              <Sparkles className="size-8 text-primary" aria-hidden="true" />
              <p className="font-semibold">Your generated questions will appear here</p>
              <p className="max-w-sm text-sm text-muted-foreground">Review them, regenerate if needed, then play them as a quiz.</p>
            </div>
          )}

          {result && (
            <>
              <p className="text-xs text-muted-foreground">{result.notes}</p>
              <ol className={cn('flex flex-col gap-3 transition-opacity', status === 'loading' && 'opacity-50')}>
                {result.questions.map((q, i) => (
                  <li key={q.id} className="animate-pop-in flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        Q{i + 1} · {q.concept}
                      </span>
                      <p className="font-medium text-pretty">{q.prompt}</p>
                    </div>
                    {q.code && (
                      <pre className="overflow-x-auto rounded-lg border border-border bg-background/80 p-3 font-mono text-xs text-primary/90">
                        <code>{q.code}</code>
                      </pre>
                    )}
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => (
                        <li
                          key={oi}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm',
                            oi === q.answerIndex && 'border-success/50 bg-success/10',
                          )}
                        >
                          <span className="font-display text-xs font-bold text-muted-foreground">{LETTERS[oi]}</span>
                          <span className="flex-1">{opt}</span>
                          {oi === q.answerIndex && (
                            <>
                              <CircleCheck className="size-4 text-success" aria-hidden="true" />
                              <span className="sr-only">(correct answer)</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                    <details className="text-sm text-muted-foreground">
                      <summary className="cursor-pointer font-medium text-foreground">Explanation</summary>
                      <p className="mt-2 leading-relaxed">{q.explanation}</p>
                    </details>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
