import { QUESTION_COUNTS } from './quiz-engine'
import { isDifficulty, isTopicId } from './topics'
import type { Difficulty, TopicId } from './types'

type Params = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export function parseQuizParams(params: Params): { topicId?: TopicId; difficulty?: Difficulty; count?: number } {
  const topic = first(params.topic)
  const difficulty = first(params.difficulty)
  const count = Number(first(params.count))
  return {
    topicId: isTopicId(topic) ? topic : undefined,
    difficulty: isDifficulty(difficulty) ? difficulty : undefined,
    count: (QUESTION_COUNTS as readonly number[]).includes(count) ? count : undefined,
  }
}
