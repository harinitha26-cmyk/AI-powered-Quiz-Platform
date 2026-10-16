import { isCorrect } from './quiz-engine'
import { DIFFICULTIES, DIFFICULTY_LABELS, TOPICS, getTopic } from './topics'
import type { Difficulty, QuizAttempt, QuizConfig, TopicId } from './types'

export type RecommendationTier = 'revise' | 'practice' | 'advance' | 'explore'

export type Recommendation = {
  tier: RecommendationTier
  topicId: TopicId
  title: string
  message: string
  accuracy: number | null
  focusConcepts: string[]
  config: QuizConfig
}

export function getAdaptiveTier(accuracy: number): Exclude<RecommendationTier, 'explore'> {
  if (accuracy < 50) return 'revise'
  if (accuracy < 80) return 'practice'
  return 'advance'
}

export function easierDifficulty(d: Difficulty): Difficulty {
  return DIFFICULTIES[Math.max(0, DIFFICULTIES.indexOf(d) - 1)]
}

export function harderDifficulty(d: Difficulty): Difficulty {
  return DIFFICULTIES[Math.min(DIFFICULTIES.length - 1, DIFFICULTIES.indexOf(d) + 1)]
}

export function buildRecommendation({
  topicId,
  accuracy,
  difficulty,
  missedQuestionIds = [],
  missedConcepts = [],
}: {
  topicId: TopicId
  accuracy: number | null
  difficulty: Difficulty
  missedQuestionIds?: string[]
  missedConcepts?: string[]
}): Recommendation {
  const topic = getTopic(topicId).name
  const focusConcepts = Array.from(new Set(missedConcepts)).slice(0, 3)

  if (accuracy === null) {
    return {
      tier: 'explore',
      topicId,
      title: `Warm up with ${topic}`,
      message: `You haven't played ${topic} yet. Start with an easy round to set your baseline.`,
      accuracy,
      focusConcepts,
      config: { topicId, difficulty: 'easy', count: 5, source: 'standard' },
    }
  }

  const tier = getAdaptiveTier(accuracy)

  if (tier === 'revise') {
    const easier = easierDifficulty(difficulty)
    return {
      tier,
      topicId,
      title: 'Easier revision recommended',
      message:
        easier === difficulty
          ? `At ${accuracy}% accuracy, revisit the ${topic} fundamentals with another easy round before moving up.`
          : `At ${accuracy}% accuracy, step down to ${DIFFICULTY_LABELS[easier]} ${topic} to rebuild the fundamentals.`,
      accuracy,
      focusConcepts,
      config: { topicId, difficulty: easier, count: 5, source: 'standard' },
    }
  }

  if (tier === 'practice') {
    return {
      tier,
      topicId,
      title: 'Targeted practice suggested',
      message: `You're at ${accuracy}%. Replay ${DIFFICULTY_LABELS[difficulty]} ${topic} with the questions you missed placed first.`,
      accuracy,
      focusConcepts,
      config: { topicId, difficulty, count: 8, source: 'standard', focusQuestionIds: missedQuestionIds },
    }
  }

  const harder = harderDifficulty(difficulty)
  return {
    tier,
    topicId,
    title: harder === difficulty ? 'Mastery confirmed' : 'Ready for a harder quiz',
    message:
      harder === difficulty
        ? `${accuracy}% on Hard ${topic}! Keep your edge with a full 10-question hard round.`
        : `${accuracy}% accuracy — you've outgrown ${DIFFICULTY_LABELS[difficulty]}. Level up to ${DIFFICULTY_LABELS[harder]} ${topic}.`,
    accuracy,
    focusConcepts,
    config: { topicId, difficulty: harder, count: 10, source: 'standard' },
  }
}

export function getMissed(attempt: QuizAttempt) {
  return attempt.questions.filter((q, i) => !isCorrect(q, attempt.answers[i]))
}

export function recommendFromAttempt(attempt: QuizAttempt) {
  const missed = getMissed(attempt)
  return buildRecommendation({
    topicId: attempt.config.topicId,
    accuracy: attempt.accuracy,
    difficulty: attempt.config.difficulty,
    missedQuestionIds: missed.map((q) => q.id),
    missedConcepts: missed.map((q) => q.concept),
  })
}

export type TopicStats = {
  topicId: TopicId
  attempts: number
  correct: number
  total: number
  accuracy: number | null
  recentAccuracy: number | null
  bestAccuracy: number | null
  lastDifficulty: Difficulty
}

/** history is newest-first */
export function getTopicStats(history: QuizAttempt[]): TopicStats[] {
  return TOPICS.map(({ id }) => {
    const attempts = history.filter((a) => a.config.topicId === id)
    const correct = attempts.reduce((s, a) => s + a.correct, 0)
    const total = attempts.reduce((s, a) => s + a.total, 0)
    const recent = attempts.slice(0, 3)
    const recentTotal = recent.reduce((s, a) => s + a.total, 0)
    return {
      topicId: id,
      attempts: attempts.length,
      correct,
      total,
      accuracy: total ? Math.round((correct / total) * 100) : null,
      recentAccuracy: recentTotal ? Math.round((recent.reduce((s, a) => s + a.correct, 0) / recentTotal) * 100) : null,
      bestAccuracy: attempts.length ? Math.max(...attempts.map((a) => a.accuracy)) : null,
      lastDifficulty: attempts[0]?.config.difficulty ?? 'easy',
    }
  })
}

export function recommendForPlayer(history: QuizAttempt[], limit = 3): Recommendation[] {
  const stats = getTopicStats(history)
  const recommendations = stats.map((s) => {
    const latest = history.find((a) => a.config.topicId === s.topicId)
    const missed = latest ? getMissed(latest) : []
    return buildRecommendation({
      topicId: s.topicId,
      accuracy: s.recentAccuracy,
      difficulty: s.lastDifficulty,
      missedQuestionIds: missed.map((q) => q.id),
      missedConcepts: missed.map((q) => q.concept),
    })
  })
  const order: Record<RecommendationTier, number> = { revise: 0, practice: 1, advance: 2, explore: 3 }
  return recommendations
    .sort((a, b) => order[a.tier] - order[b.tier] || (a.accuracy ?? 0) - (b.accuracy ?? 0))
    .slice(0, limit)
}

export function getMissedConcepts(history: QuizAttempt[], limit = 5) {
  const counts = new Map<string, { concept: string; topicId: TopicId; misses: number }>()
  for (const attempt of history) {
    for (const q of getMissed(attempt)) {
      const key = `${q.topicId}:${q.concept}`
      const entry = counts.get(key) ?? { concept: q.concept, topicId: q.topicId, misses: 0 }
      entry.misses++
      counts.set(key, entry)
    }
  }
  return [...counts.values()].sort((a, b) => b.misses - a.misses).slice(0, limit)
}
