export type TopicId = 'python' | 'sql' | 'aptitude' | 'dsa' | 'gk'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuizSource = 'standard' | 'daily' | 'generated'
export type Tone = 'primary' | 'accent' | 'success' | 'warning'

export type Question = {
  id: string
  topicId: TopicId
  difficulty: Difficulty
  prompt: string
  code?: string
  options: string[]
  answerIndex: number
  explanation: string
  concept: string
}

export type QuizConfig = {
  topicId: TopicId
  difficulty: Difficulty
  count: number
  source: QuizSource
  focusQuestionIds?: string[]
}

/** answers[i]: null = not answered yet, -1 = timed out, otherwise selected option index */
export type ActiveQuiz = {
  id: string
  config: QuizConfig
  questions: Question[]
  answers: Array<number | null>
  times: number[]
  currentIndex: number
  startedAt: number
}

export type XpItem = { label: string; xp: number }

export type QuizAttempt = {
  id: string
  config: QuizConfig
  questions: Question[]
  answers: Array<number | null>
  times: number[]
  correct: number
  total: number
  accuracy: number
  xpEarned: number
  xpBreakdown: XpItem[]
  completedAt: number
  newAchievements: string[]
  levelBefore: number
  levelAfter: number
}

export type Settings = {
  playerName: string
  avatarColor: Tone
  timerSeconds: number
  defaultDifficulty: Difficulty
  defaultCount: number
  showExplanations: boolean
  reducedMotion: boolean
}

export type PlayerStats = {
  quizzesPlayed: number
  questionsAnswered: number
  correctAnswers: number
  perfectQuizzes: number
  dailyCompleted: number
  generatedPlayed: number
  hardMastered: number
  topicsPlayed: TopicId[]
}

export type PlayerState = {
  version: 1
  createdAt: number
  settings: Settings
  xp: number
  stats: PlayerStats
  streak: { current: number; best: number; lastPlayed: string | null }
  daily: { date: string; completed: boolean; accuracy: number } | null
  achievements: Record<string, number>
  history: QuizAttempt[]
  activeQuiz: ActiveQuiz | null
}
