import { QUESTION_BANK } from '../questions'
import { createId, selectQuestions, shuffle, shuffleOptions, type Rng } from '../quiz-engine'
import type { Difficulty, Question, TopicId } from '../types'

export type QuizGenerationRequest = {
  topicId: TopicId
  difficulty: Difficulty
  count: number
  focus?: string
}

export type QuizGenerationResult = {
  questions: Question[]
  provider: string
  isMock: boolean
  notes: string
}

/**
 * Integration point for real AI generation.
 *
 * To connect a model later: implement this interface with a generator that POSTs the
 * request to a server route (e.g. app/api/generate-quiz/route.ts using the AI SDK's
 * structured output), run the response through `validateGeneratedQuestions`, then
 * point `activeQuizGenerator` at it. The UI only talks to `activeQuizGenerator`.
 */
export interface QuizGenerator {
  id: string
  label: string
  isMock: boolean
  generate(request: QuizGenerationRequest): Promise<QuizGenerationResult>
}

export function validateGeneratedQuestions(questions: unknown[]): Question[] {
  return questions.filter((raw): raw is Question => {
    const q = raw as Partial<Question>
    return (
      typeof q?.prompt === 'string' &&
      q.prompt.length > 0 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      new Set(q.options).size === 4 &&
      typeof q.answerIndex === 'number' &&
      q.answerIndex >= 0 &&
      q.answerIndex < 4 &&
      typeof q.explanation === 'string'
    )
  })
}

/* ---------- Mock implementation ---------- */

const pick = <T,>(items: readonly T[], rng: Rng) => items[Math.floor(rng() * items.length)]

function numericOptions(answer: number, distractors: number[], format: (n: number) => string, rng: Rng) {
  const unique = Array.from(new Set(distractors.filter((d) => d !== answer && d > 0)))
  const chosen = shuffle(unique, rng).slice(0, 3)
  let bump = 1
  while (chosen.length < 3) {
    const candidate = answer + bump * (bump % 2 === 0 ? -1 : 1) * Math.max(1, Math.round(answer * 0.1))
    if (candidate > 0 && candidate !== answer && !chosen.includes(candidate)) chosen.push(candidate)
    bump++
  }
  return { options: [format(answer), ...chosen.map(format)], answerIndex: 0 }
}

type Template = (rng: Rng) => Omit<Question, 'id' | 'topicId' | 'difficulty'>

const APTITUDE_TEMPLATES: Record<Difficulty, Template[]> = {
  easy: [
    (rng) => {
      const pct = pick([10, 20, 25, 50], rng)
      const base = pick([40, 80, 120, 160, 200, 360], rng)
      const answer = (pct * base) / 100
      return {
        prompt: `What is ${pct}% of ${base}?`,
        ...numericOptions(answer, [answer + 10, answer - 10, answer * 2, answer + 5], String, rng),
        explanation: `${pct}% of ${base} = ${pct} ÷ 100 × ${base} = ${answer}.`,
        concept: 'Percentages',
      }
    },
    (rng) => {
      const start = pick([2, 3, 5, 7], rng)
      const step = pick([3, 4, 6, 9], rng)
      const series = Array.from({ length: 4 }, (_, i) => start + i * step)
      const answer = start + 4 * step
      return {
        prompt: `What comes next in the series ${series.join(', ')}, …?`,
        ...numericOptions(answer, [answer + step, answer - 1, answer + 1, answer + 2], String, rng),
        explanation: `Each term increases by ${step}: ${series[3]} + ${step} = ${answer}.`,
        concept: 'Number series',
      }
    },
  ],
  medium: [
    (rng) => {
      const principal = pick([1000, 1500, 2000, 4000], rng)
      const rate = pick([4, 5, 8, 10], rng)
      const years = pick([2, 3, 5], rng)
      const answer = (principal * rate * years) / 100
      return {
        prompt: `What is the simple interest on $${principal.toLocaleString('en-US')} at ${rate}% per year for ${years} years?`,
        ...numericOptions(answer, [answer + 50, answer - 50, (principal * rate) / 100, answer * 2], (n) => `$${n.toLocaleString('en-US')}`, rng),
        explanation: `SI = P × R × T ÷ 100 = ${principal} × ${rate} × ${years} ÷ 100 = $${answer}.`,
        concept: 'Interest',
      }
    },
    (rng) => {
      const [a, b] = pick([[2, 3], [3, 5], [1, 4], [5, 7]] as const, rng)
      const total = (a + b) * pick([6, 8, 10, 12], rng)
      const answer = (total / (a + b)) * b
      return {
        prompt: `Split ${total} in the ratio ${a}:${b}. What is the larger share?`,
        ...numericOptions(answer, [(total / (a + b)) * a, answer + a, total / 2, answer - b], String, rng),
        explanation: `One part = ${total} ÷ ${a + b} = ${total / (a + b)}. Larger share = ${b} × ${total / (a + b)} = ${answer}.`,
        concept: 'Ratios',
      }
    },
  ],
  hard: [
    (rng) => {
      const [a, b] = pick([[6, 3], [12, 6], [10, 15], [20, 30], [12, 4]] as const, rng)
      const answer = (a * b) / (a + b)
      return {
        prompt: `A finishes a job in ${a} days and B in ${b} days. How many days do they take working together?`,
        ...numericOptions(answer, [(a + b) / 2, Math.min(a, b), answer + 1, answer + 2], (n) => `${n} days`, rng),
        explanation: `Combined rate = 1/${a} + 1/${b} = ${a + b}/${a * b}, so time = ${a * b} ÷ ${a + b} = ${answer} days.`,
        concept: 'Time & work',
      }
    },
    (rng) => {
      const rise = pick([25, 50, 100], rng)
      const answer = Math.round((rise / (100 + rise)) * 1000) / 10
      return {
        prompt: `A price rises ${rise}%. By what percent must consumption fall to keep spending the same?`,
        ...numericOptions(answer, [rise, rise / 2, answer + 5, answer - 5], (n) => `${n}%`, rng),
        explanation: `Reduction = ${rise} ÷ (100 + ${rise}) × 100 ≈ ${answer}%.`,
        concept: 'Percentages',
      }
    },
  ],
}

function generateAptitude(difficulty: Difficulty, count: number, rng: Rng): Question[] {
  const templates = APTITUDE_TEMPLATES[difficulty]
  return Array.from({ length: count }, (_, i) =>
    shuffleOptions(
      { ...templates[i % templates.length](rng), id: `gen-apt-${createId()}-${i}`, topicId: 'aptitude', difficulty },
      rng,
    ),
  )
}

function scoreFocus(question: Question, keywords: string[]) {
  const haystack = `${question.prompt} ${question.concept} ${question.code ?? ''}`.toLowerCase()
  return keywords.reduce((score, k) => score + (haystack.includes(k) ? 1 : 0), 0)
}

export const mockQuizGenerator: QuizGenerator = {
  id: 'mock',
  label: 'Mock generator (offline)',
  isMock: true,
  async generate({ topicId, difficulty, count, focus }) {
    await new Promise((resolve) => setTimeout(resolve, 900))
    const rng = Math.random
    const keywords = (focus ?? '')
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((k) => k.length > 2)

    const pool = QUESTION_BANK.filter((q) => q.topicId === topicId)
    const focusIds = keywords.length
      ? pool.filter((q) => scoreFocus(q, keywords) > 0).map((q) => q.id)
      : []

    const templated = topicId === 'aptitude' ? generateAptitude(difficulty, Math.ceil(count / 2), rng) : []
    const fromBank = selectQuestions(
      pool,
      { difficulty, count: count - templated.length, focusQuestionIds: focusIds },
      rng,
    )
    const questions = validateGeneratedQuestions(shuffle([...templated, ...fromBank], rng))

    return {
      questions,
      provider: this.label,
      isMock: true,
      notes:
        topicId === 'aptitude'
          ? 'Mock mode: half the questions were built from numeric templates and the rest drawn from the built-in bank. No AI model was called.'
          : focusIds.length
            ? `Mock mode: ${focusIds.length} bank question${focusIds.length === 1 ? '' : 's'} matched your focus and were prioritised. No AI model was called.`
            : 'Mock mode: questions were selected and reshuffled from the built-in bank. No AI model was called.',
    }
  },
}

export const activeQuizGenerator: QuizGenerator = mockQuizGenerator
