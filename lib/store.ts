'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useSyncExternalStore } from 'react'
import { completeQuiz, toDateKey } from './progression'
import { buildQuizQuestions, createId, createRng, hashString } from './quiz-engine'
import type { PlayerState, Question, QuizConfig, Settings } from './types'

const STORAGE_KEY = 'levelup-ai:progress:v1'

function createDefaultState(): PlayerState {
  return {
    version: 1,
    createdAt: Date.now(),
    settings: {
      playerName: 'Player One',
      avatarColor: 'primary',
      timerSeconds: 30,
      defaultDifficulty: 'medium',
      defaultCount: 5,
      showExplanations: true,
      reducedMotion: false,
    },
    xp: 0,
    stats: {
      quizzesPlayed: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      perfectQuizzes: 0,
      dailyCompleted: 0,
      generatedPlayed: 0,
      hardMastered: 0,
      topicsPlayed: [],
    },
    streak: { current: 0, best: 0, lastPlayed: null },
    daily: null,
    achievements: {},
    history: [],
    activeQuiz: null,
  }
}

const SERVER_SNAPSHOT = createDefaultState()
const listeners = new Set<() => void>()
let cache: PlayerState | null = null

function migrate(raw: Partial<PlayerState>): PlayerState {
  const base = createDefaultState()
  return {
    ...base,
    ...raw,
    settings: { ...base.settings, ...raw.settings },
    stats: { ...base.stats, ...raw.stats },
    streak: { ...base.streak, ...raw.streak },
    achievements: raw.achievements ?? {},
    history: Array.isArray(raw.history) ? raw.history : [],
  }
}

function read(): PlayerState {
  if (cache) return cache
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    cache = raw ? migrate(JSON.parse(raw)) : createDefaultState()
  } catch {
    cache = createDefaultState()
  }
  return cache
}

function write(next: PlayerState) {
  cache = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage may be full or unavailable (private mode); keep in-memory state.
  }
  listeners.forEach((l) => l())
}

function update(updater: (state: PlayerState) => PlayerState) {
  write(updater(read()))
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function usePlayer() {
  return useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT)
}

const noopSubscribe = () => () => {}
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

/* ---------- Actions ---------- */

export function startQuiz(config: QuizConfig, questions?: Question[]) {
  const rng = config.source === 'daily' ? createRng(hashString(`daily-${toDateKey()}`)) : Math.random
  const qs = questions ?? buildQuizQuestions(config, rng)
  update((s) => ({
    ...s,
    activeQuiz: {
      id: createId(),
      config: { ...config, count: qs.length },
      questions: qs,
      answers: qs.map(() => null),
      times: qs.map(() => 0),
      currentIndex: 0,
      startedAt: Date.now(),
    },
  }))
}

export function answerQuestion(index: number, answer: number, timeMs: number) {
  update((s) => {
    const quiz = s.activeQuiz
    if (!quiz || quiz.answers[index] !== null) return s
    const answers = [...quiz.answers]
    const times = [...quiz.times]
    answers[index] = answer
    times[index] = timeMs
    return { ...s, activeQuiz: { ...quiz, answers, times } }
  })
}

export function goToNextQuestion() {
  update((s) => {
    const quiz = s.activeQuiz
    if (!quiz) return s
    return { ...s, activeQuiz: { ...quiz, currentIndex: Math.min(quiz.currentIndex + 1, quiz.questions.length - 1) } }
  })
}

export function finishQuiz(): string | null {
  const state = read()
  if (!state.activeQuiz) return null
  const result = completeQuiz(state, state.activeQuiz)
  write(result.state)
  return result.attempt.id
}

export function abandonQuiz() {
  update((s) => ({ ...s, activeQuiz: null }))
}

export function updateSettings(patch: Partial<Settings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function resetProgress() {
  const settings = read().settings
  write({ ...createDefaultState(), settings })
}

export function useStartQuiz() {
  const router = useRouter()
  return useCallback(
    (config: QuizConfig, questions?: Question[]) => {
      startQuiz(config, questions)
      router.push('/quiz/play')
    },
    [router],
  )
}
