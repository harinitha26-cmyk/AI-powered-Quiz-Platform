'use client'

import { ArrowRight, CircleCheck, CircleX, Clock, Flag, Gamepad2, Timer, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useEffectEvent, useState } from 'react'
import { DifficultyBadge, EmptyState, ProgressBar, TopicIcon } from '@/components/game-ui'
import { Button, buttonVariants } from '@/components/ui/button'
import { TIMED_OUT, XP_PER_CORRECT, isCorrect } from '@/lib/quiz-engine'
import { abandonQuiz, answerQuestion, finishQuiz, goToNextQuestion, usePlayer } from '@/lib/store'
import { getTopic } from '@/lib/topics'
import type { ActiveQuiz, Question } from '@/lib/types'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

export function QuizPlayView() {
  const player = usePlayer()
  const router = useRouter()
  const quiz = player.activeQuiz

  if (!quiz) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={Gamepad2}
          title="No quiz in progress"
          description="Pick a topic and difficulty to start a new run, or take on today's daily challenge."
        >
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/categories" className={buttonVariants({ variant: 'neon', size: 'lg' })}>
              Browse categories
            </Link>
            <Link href="/" className={buttonVariants({ variant: 'glass', size: 'lg' })}>
              Dashboard
            </Link>
          </div>
        </EmptyState>
      </div>
    )
  }

  function quit() {
    if (window.confirm('Quit this quiz? Your progress in this run will be lost.')) {
      abandonQuiz()
      router.push('/')
    }
  }

  function finish() {
    const id = finishQuiz()
    router.push(id ? `/quiz/results?id=${id}` : '/')
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <QuizHeader quiz={quiz} onQuit={quit} />
      <QuestionCard
        key={`${quiz.id}-${quiz.currentIndex}`}
        quiz={quiz}
        timerSeconds={player.settings.timerSeconds}
        showExplanations={player.settings.showExplanations}
        onFinish={finish}
      />
    </div>
  )
}

function QuizHeader({ quiz, onQuit }: { quiz: ActiveQuiz; onQuit: () => void }) {
  const topic = getTopic(quiz.config.topicId)
  const answered = quiz.answers.filter((a) => a !== null).length
  const correct = quiz.questions.filter((q, i) => isCorrect(q, quiz.answers[i])).length
  const label =
    quiz.config.source === 'daily' ? 'Daily challenge' : quiz.config.source === 'generated' ? 'Generated quiz' : topic.name

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <TopicIcon topicId={quiz.config.topicId} size="sm" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{label}</span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {quiz.config.source !== 'standard' && <span>{topic.name}</span>}
              <DifficultyBadge difficulty={quiz.config.difficulty} className="px-2 py-0 text-[10px]" />
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
            <Zap className="size-3.5" aria-hidden="true" />+{correct * XP_PER_CORRECT[quiz.config.difficulty]} XP
          </span>
          <Button variant="ghost" size="icon" onClick={onQuit} aria-label="Quit quiz">
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Question <strong className="text-foreground">{quiz.currentIndex + 1}</strong> of {quiz.questions.length}
          </span>
          <span>{answered} answered</span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {quiz.questions.map((q, i) => {
            const a = quiz.answers[i]
            return (
              <span
                key={q.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full bg-muted transition-colors',
                  a !== null && (isCorrect(q, a) ? 'bg-success' : 'bg-destructive'),
                  a === null && i === quiz.currentIndex && 'bg-primary/60',
                )}
              />
            )
          })}
        </div>
      </div>
    </header>
  )
}

function useCountdown(seconds: number, paused: boolean, onExpire: () => void) {
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)
  const expire = useEffectEvent(onExpire)

  useEffect(() => {
    if (!seconds || paused) return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t - startedAt >= seconds * 1000) {
        window.clearInterval(id)
        expire()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [seconds, paused, startedAt])

  const elapsed = now - startedAt
  return { startedAt, remaining: seconds ? Math.max(0, Math.ceil(seconds - elapsed / 1000)) : null, ratio: seconds ? Math.max(0, 1 - elapsed / (seconds * 1000)) : 1 }
}

function QuestionCard({
  quiz,
  timerSeconds,
  showExplanations,
  onFinish,
}: {
  quiz: ActiveQuiz
  timerSeconds: number
  showExplanations: boolean
  onFinish: () => void
}) {
  const index = quiz.currentIndex
  const question = quiz.questions[index]
  const answer = quiz.answers[index]
  const answered = answer !== null
  const isLast = index === quiz.questions.length - 1

  const { startedAt, remaining, ratio } = useCountdown(timerSeconds, answered, () =>
    answerQuestion(index, TIMED_OUT, timerSeconds * 1000),
  )

  function choose(option: number) {
    if (answered) return
    answerQuestion(index, option, Date.now() - startedAt)
  }

  const next = useEffectEvent(() => (isLast ? onFinish() : goToNextQuestion()))
  const pick = useEffectEvent(choose)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      const n = Number(e.key)
      if (n >= 1 && n <= 4) pick(n - 1)
      const key = e.key.toUpperCase()
      if (LETTERS.includes(key)) pick(LETTERS.indexOf(key))
      if (e.key === 'Enter' && target.tagName !== 'BUTTON') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <article className="animate-pop-in flex flex-1 flex-col gap-5" aria-labelledby="question-prompt">
      {remaining !== null && (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex min-w-16 items-center gap-1.5 font-display text-sm font-bold tabular-nums',
              remaining <= 5 && !answered ? 'text-destructive' : 'text-muted-foreground',
            )}
            aria-live={remaining <= 5 ? 'polite' : 'off'}
          >
            <Timer className="size-4" aria-hidden="true" />
            {remaining}s<span className="sr-only"> remaining</span>
          </span>
          <ProgressBar
            value={answered ? 0 : ratio}
            tone={remaining <= 5 ? 'warning' : 'primary'}
            label="Time remaining"
            className="h-1.5 [&>div]:duration-200 [&>div]:ease-linear"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-7">
        <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{question.concept}</span>
        <h1 id="question-prompt" className="text-pretty text-xl leading-snug font-semibold sm:text-2xl">
          {question.prompt}
        </h1>
        {question.code && (
          <pre className="overflow-x-auto rounded-xl border border-border bg-background/80 p-4 font-mono text-sm leading-relaxed text-primary/90">
            <code>{question.code}</code>
          </pre>
        )}
      </div>

      <div role="group" aria-label="Answer options" className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option, i) => (
          <AnswerOption
            key={i}
            letter={LETTERS[i]}
            text={option}
            state={getOptionState(question, answer, i)}
            disabled={answered}
            onSelect={() => choose(i)}
          />
        ))}
      </div>

      {answered && (
        <Feedback question={question} answer={answer} showExplanation={showExplanations}>
          <Button variant="neon" size="xl" onClick={next} autoFocus className="w-full sm:w-auto">
            {isLast ? (
              <>
                <Flag aria-hidden="true" />
                See results
              </>
            ) : (
              <>
                Next question
                <ArrowRight aria-hidden="true" />
              </>
            )}
          </Button>
        </Feedback>
      )}

      {!answered && (
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          Tip: press <kbd className="rounded border border-border px-1">1</kbd>–<kbd className="rounded border border-border px-1">4</kbd> to answer,{' '}
          <kbd className="rounded border border-border px-1">Enter</kbd> to continue.
        </p>
      )}
    </article>
  )
}

type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed'

function getOptionState(question: Question, answer: number | null, i: number): OptionState {
  if (answer === null) return 'idle'
  if (i === question.answerIndex) return 'correct'
  if (i === answer) return 'wrong'
  return 'dimmed'
}

function AnswerOption({
  letter,
  text,
  state,
  disabled,
  onSelect,
}: {
  letter: string
  text: string
  state: OptionState
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={`${letter}: ${text}${state === 'correct' ? ' (correct answer)' : state === 'wrong' ? ' (your answer, incorrect)' : ''}`}
      className={cn(
        'group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card/60 p-4 text-left text-sm font-medium transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:text-base',
        state === 'idle' && 'hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:glow-primary',
        state === 'correct' && 'border-success bg-success/12 glow-success',
        state === 'wrong' && 'border-destructive bg-destructive/12 glow-destructive',
        state === 'dimmed' && 'opacity-50',
        disabled && 'cursor-default',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted font-display text-sm font-bold text-muted-foreground transition-colors',
          state === 'idle' && 'group-hover:bg-primary group-hover:text-primary-foreground',
          state === 'correct' && 'bg-success text-success-foreground',
          state === 'wrong' && 'bg-destructive text-background',
        )}
      >
        {state === 'correct' ? <CircleCheck className="size-4.5" /> : state === 'wrong' ? <CircleX className="size-4.5" /> : letter}
      </span>
      <span className="flex-1">{text}</span>
    </button>
  )
}

function Feedback({
  question,
  answer,
  showExplanation,
  children,
}: {
  question: Question
  answer: number
  showExplanation: boolean
  children: React.ReactNode
}) {
  const correct = isCorrect(question, answer)
  const timedOut = answer === TIMED_OUT
  return (
    <div
      role="status"
      className={cn(
        'animate-pop-in flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-end sm:justify-between',
        correct ? 'border-success/40 bg-success/8' : 'border-destructive/40 bg-destructive/8',
      )}
    >
      <div className="flex flex-col gap-1.5">
        <p className={cn('flex items-center gap-2 font-semibold', correct ? 'text-success' : 'text-destructive')}>
          {timedOut ? <Clock className="size-5" aria-hidden="true" /> : correct ? <CircleCheck className="size-5" aria-hidden="true" /> : <CircleX className="size-5" aria-hidden="true" />}
          {timedOut ? "Time's up!" : correct ? `Correct! +${XP_PER_CORRECT[question.difficulty]} XP` : 'Not quite.'}
          {!correct && (
            <span className="font-normal text-muted-foreground">
              Answer: <strong className="text-foreground">{question.options[question.answerIndex]}</strong>
            </span>
          )}
        </p>
        {showExplanation && <p className="text-sm leading-relaxed text-muted-foreground">{question.explanation}</p>}
      </div>
      {children}
    </div>
  )
}
