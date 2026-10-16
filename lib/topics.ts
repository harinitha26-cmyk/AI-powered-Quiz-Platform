import type { Difficulty, TopicId, Tone } from './types'

export type Topic = {
  id: TopicId
  name: string
  tagline: string
  description: string
  tone: Tone
}

export const TOPICS: Topic[] = [
  {
    id: 'python',
    name: 'Python',
    tagline: 'Syntax, data types & idioms',
    description: 'Lists, functions, comprehensions, decorators and the gotchas every Pythonista should know.',
    tone: 'primary',
  },
  {
    id: 'sql',
    name: 'SQL',
    tagline: 'Queries, joins & indexes',
    description: 'Filtering, aggregation, joins, window functions and how databases really evaluate queries.',
    tone: 'accent',
  },
  {
    id: 'aptitude',
    name: 'Aptitude',
    tagline: 'Numbers, ratios & logic',
    description: 'Percentages, speed and distance, work problems, probability and number series.',
    tone: 'warning',
  },
  {
    id: 'dsa',
    name: 'Data Structures',
    tagline: 'Complexity & algorithms',
    description: 'Stacks, queues, trees, heaps, hashing and the Big-O behind classic algorithms.',
    tone: 'success',
  },
  {
    id: 'gk',
    name: 'General Knowledge',
    tagline: 'Science, history & geography',
    description: 'A broad mix of science, world history, geography and culture questions.',
    tone: 'primary',
  },
]

export const TOPIC_IDS = TOPICS.map((t) => t.id)

export function getTopic(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0]
}

export function isTopicId(value: unknown): value is TopicId {
  return typeof value === 'string' && (TOPIC_IDS as string[]).includes(value)
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as string[]).includes(value)
}
