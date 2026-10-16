import {
  DAILY_BONUS_XP,
  PERFECT_BONUS_XP,
  XP_PER_CORRECT,
  createId,
  hashString,
  isCorrect,
} from './quiz-engine'
import { DIFFICULTIES, TOPIC_IDS } from './topics'
import type { ActiveQuiz, PlayerState, QuizAttempt, QuizConfig, XpItem } from './types'

/* ---------- Levels ---------- */

export const LEVEL_TITLES = [
  { minLevel: 1, title: 'Rookie' },
  { minLevel: 3, title: 'Apprentice' },
  { minLevel: 5, title: 'Challenger' },
  { minLevel: 8, title: 'Expert' },
  { minLevel: 12, title: 'Master' },
  { minLevel: 16, title: 'Champion' },
]

export function xpToNextLevel(level: number) {
  return 100 + (level - 1) * 50
}

export function totalXpForLevel(level: number) {
  let total = 0
  for (let l = 1; l < level; l++) total += xpToNextLevel(l)
  return total
}

export function getLevelTitle(level: number) {
  return [...LEVEL_TITLES].reverse().find((t) => level >= t.minLevel)?.title ?? 'Rookie'
}

export function getLevelInfo(xp: number) {
  let level = 1
  let floor = 0
  while (xp >= floor + xpToNextLevel(level)) {
    floor += xpToNextLevel(level)
    level++
  }
  const xpForLevel = xpToNextLevel(level)
  const xpIntoLevel = xp - floor
  return {
    level,
    title: getLevelTitle(level),
    xpIntoLevel,
    xpForLevel,
    xpRemaining: xpForLevel - xpIntoLevel,
    progress: xpIntoLevel / xpForLevel,
  }
}

/* ---------- Dates & streaks ---------- */

export function toDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysBetween(fromKey: string, toKey: string) {
  const [fy, fm, fd] = fromKey.split('-').map(Number)
  const [ty, tm, td] = toKey.split('-').map(Number)
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000)
}

export function getEffectiveStreak(streak: PlayerState['streak'], today = toDateKey()) {
  if (!streak.lastPlayed) return 0
  return daysBetween(streak.lastPlayed, today) <= 1 ? streak.current : 0
}

export function getLastDays(count: number, today = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (count - 1 - i))
    return d
  })
}

/* ---------- Daily challenge ---------- */

export function getDailyChallenge(dateKey = toDateKey()): QuizConfig {
  const hash = hashString(`levelup-${dateKey}`)
  return {
    topicId: TOPIC_IDS[hash % TOPIC_IDS.length],
    difficulty: DIFFICULTIES[(hash >>> 4) % DIFFICULTIES.length],
    count: 5,
    source: 'daily',
  }
}

/* ---------- Achievements & badges ---------- */

export type AchievementIcon =
  | 'footprints'
  | 'swords'
  | 'crown'
  | 'target'
  | 'gem'
  | 'flame'
  | 'rocket'
  | 'compass'
  | 'calendar'
  | 'mountain'
  | 'wand'
  | 'graduation'
  | 'star'
  | 'medal'

export type Achievement = {
  id: string
  name: string
  description: string
  icon: AchievementIcon
  target: number
  value: (state: PlayerState) => number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first quiz', icon: 'footprints', target: 1, value: (s) => s.stats.quizzesPlayed },
  { id: 'quiz-regular', name: 'Quiz Regular', description: 'Complete 10 quizzes', icon: 'swords', target: 10, value: (s) => s.stats.quizzesPlayed },
  { id: 'quiz-veteran', name: 'Quiz Veteran', description: 'Complete 50 quizzes', icon: 'crown', target: 50, value: (s) => s.stats.quizzesPlayed },
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Score 100% on any quiz', icon: 'target', target: 1, value: (s) => s.stats.perfectQuizzes },
  { id: 'flawless-five', name: 'Flawless Five', description: 'Get 5 perfect scores', icon: 'gem', target: 5, value: (s) => s.stats.perfectQuizzes },
  { id: 'on-fire', name: 'On Fire', description: 'Reach a 3-day streak', icon: 'flame', target: 3, value: (s) => s.streak.best },
  { id: 'unstoppable', name: 'Unstoppable', description: 'Reach a 7-day streak', icon: 'rocket', target: 7, value: (s) => s.streak.best },
  { id: 'explorer', name: 'Explorer', description: 'Play all 5 topics', icon: 'compass', target: TOPIC_IDS.length, value: (s) => s.stats.topicsPlayed.length },
  { id: 'daily-devotee', name: 'Daily Devotee', description: 'Complete 5 daily challenges', icon: 'calendar', target: 5, value: (s) => s.stats.dailyCompleted },
  { id: 'hard-mode-hero', name: 'Hard Mode Hero', description: 'Score 80%+ on a hard quiz', icon: 'mountain', target: 1, value: (s) => s.stats.hardMastered },
  { id: 'generator-pioneer', name: 'Generator Pioneer', description: 'Play a generated quiz', icon: 'wand', target: 1, value: (s) => s.stats.generatedPlayed },
  { id: 'century', name: 'Century', description: 'Answer 100 questions correctly', icon: 'graduation', target: 100, value: (s) => s.stats.correctAnswers },
  { id: 'rising-star', name: 'Rising Star', description: 'Reach level 5', icon: 'star', target: 5, value: (s) => getLevelInfo(s.xp).level },
  { id: 'elite', name: 'Elite', description: 'Reach level 10', icon: 'medal', target: 10, value: (s) => getLevelInfo(s.xp).level },
]

export function getAchievementProgress(achievement: Achievement, state: PlayerState) {
  const current = Math.min(achievement.value(state), achievement.target)
  return {
    current,
    target: achievement.target,
    ratio: current / achievement.target,
    unlockedAt: state.achievements[achievement.id] ?? null,
  }
}

/* ---------- Completing a quiz ---------- */

export function completeQuiz(state: PlayerState, active: ActiveQuiz, now = Date.now()) {
  const today = toDateKey(new Date(now))
  const { questions, answers, config } = active

  const correctQuestions = questions.filter((q, i) => isCorrect(q, answers[i]))
  const correct = correctQuestions.length
  const total = questions.length
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100)

  const breakdown: XpItem[] = []
  const correctXp = correctQuestions.reduce((sum, q) => sum + XP_PER_CORRECT[q.difficulty], 0)
  if (correct > 0) breakdown.push({ label: `${correct} correct answer${correct === 1 ? '' : 's'}`, xp: correctXp })
  if (accuracy === 100) breakdown.push({ label: 'Perfect score bonus', xp: PERFECT_BONUS_XP })

  const prev = state.streak
  const firstToday = prev.lastPlayed !== today
  let streakCurrent = 1
  if (!firstToday) streakCurrent = prev.current
  else if (prev.lastPlayed && daysBetween(prev.lastPlayed, today) === 1) streakCurrent = prev.current + 1
  if (firstToday && streakCurrent > 1) {
    breakdown.push({ label: `${streakCurrent}-day streak bonus`, xp: Math.min(streakCurrent, 7) * 10 })
  }

  const dailyFirstClear = config.source === 'daily' && !(state.daily?.date === today && state.daily.completed)
  if (dailyFirstClear) breakdown.push({ label: 'Daily challenge bonus', xp: DAILY_BONUS_XP })

  const xpEarned = breakdown.reduce((sum, item) => sum + item.xp, 0)

  const next: PlayerState = {
    ...state,
    xp: state.xp + xpEarned,
    activeQuiz: null,
    streak: { current: streakCurrent, best: Math.max(prev.best, streakCurrent), lastPlayed: today },
    daily: dailyFirstClear ? { date: today, completed: true, accuracy } : state.daily,
    stats: {
      quizzesPlayed: state.stats.quizzesPlayed + 1,
      questionsAnswered: state.stats.questionsAnswered + total,
      correctAnswers: state.stats.correctAnswers + correct,
      perfectQuizzes: state.stats.perfectQuizzes + (accuracy === 100 ? 1 : 0),
      dailyCompleted: state.stats.dailyCompleted + (dailyFirstClear ? 1 : 0),
      generatedPlayed: state.stats.generatedPlayed + (config.source === 'generated' ? 1 : 0),
      hardMastered: state.stats.hardMastered + (config.difficulty === 'hard' && accuracy >= 80 ? 1 : 0),
      topicsPlayed: Array.from(new Set([...state.stats.topicsPlayed, config.topicId])),
    },
  }

  const newlyUnlocked = ACHIEVEMENTS.filter((a) => !next.achievements[a.id] && a.value(next) >= a.target)
  next.achievements = { ...next.achievements, ...Object.fromEntries(newlyUnlocked.map((a) => [a.id, now])) }

  const attempt: QuizAttempt = {
    id: createId(),
    config,
    questions,
    answers,
    times: active.times,
    correct,
    total,
    accuracy,
    xpEarned,
    xpBreakdown: breakdown,
    completedAt: now,
    newAchievements: newlyUnlocked.map((a) => a.id),
    levelBefore: getLevelInfo(state.xp).level,
    levelAfter: getLevelInfo(next.xp).level,
  }
  next.history = [attempt, ...state.history].slice(0, 50)

  return { state: next, attempt }
}
