import { QUESTION_BANK } from './questions'
import { DIFFICULTIES } from './topics'
import type { Difficulty, Question, QuizConfig } from './types'

export type Rng = () => number

export const XP_PER_CORRECT: Record<Difficulty, number> = { easy: 10, medium: 15, hard: 25 }
export const PERFECT_BONUS_XP = 50
export const DAILY_BONUS_XP = 100
export const QUESTION_COUNTS = [5, 8, 10] as const
export const TIMER_OPTIONS = [0, 15, 30, 45] as const
export const TIMED_OUT = -1

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function hashString(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic PRNG (mulberry32) so the daily challenge is identical all day. */
export function createRng(seed: number): Rng {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function shuffleOptions(question: Question, rng: Rng = Math.random): Question {
  const order = shuffle(
    question.options.map((_, i) => i),
    rng,
  )
  return {
    ...question,
    options: order.map((i) => question.options[i]),
    answerIndex: order.indexOf(question.answerIndex),
  }
}

function difficultyDistance(a: Difficulty, b: Difficulty) {
  return Math.abs(DIFFICULTIES.indexOf(a) - DIFFICULTIES.indexOf(b))
}

/** Picks focus questions first, then the requested difficulty, then the closest difficulties. */
export function selectQuestions(
  pool: Question[],
  { difficulty, count, focusQuestionIds = [] }: Pick<QuizConfig, 'difficulty' | 'count' | 'focusQuestionIds'>,
  rng: Rng = Math.random,
): Question[] {
  const focus = shuffle(
    pool.filter((q) => focusQuestionIds.includes(q.id)),
    rng,
  )
  const rest = shuffle(
    pool.filter((q) => !focusQuestionIds.includes(q.id)),
    rng,
  ).sort((a, b) => difficultyDistance(a.difficulty, difficulty) - difficultyDistance(b.difficulty, difficulty))
  return [...focus, ...rest].slice(0, count).map((q) => shuffleOptions(q, rng))
}

export function buildQuizQuestions(config: QuizConfig, rng: Rng = Math.random): Question[] {
  const pool = QUESTION_BANK.filter((q) => q.topicId === config.topicId)
  return selectQuestions(pool, config, rng)
}

export function isCorrect(question: Question, answer: number | null | undefined) {
  return answer === question.answerIndex
}

export function maxXpFor(difficulty: Difficulty, count: number) {
  return XP_PER_CORRECT[difficulty] * count + PERFECT_BONUS_XP
}
