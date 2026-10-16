import { getLevelInfo } from './progression'
import type { TopicId } from './types'

export type LeaderboardEntry = {
  id: string
  name: string
  xp: number
  level: number
  accuracy: number
  streak: number
  favoriteTopic: TopicId
  isDemo: boolean
}

const DEMO_PLAYERS: Omit<LeaderboardEntry, 'level' | 'isDemo'>[] = [
  { id: 'demo-1', name: 'NeonNova', xp: 5420, accuracy: 92, streak: 21, favoriteTopic: 'python' },
  { id: 'demo-2', name: 'ByteKnight', xp: 4980, accuracy: 89, streak: 14, favoriteTopic: 'dsa' },
  { id: 'demo-3', name: 'QueryQueen', xp: 4610, accuracy: 87, streak: 12, favoriteTopic: 'sql' },
  { id: 'demo-4', name: 'AlgoAce', xp: 4135, accuracy: 85, streak: 9, favoriteTopic: 'dsa' },
  { id: 'demo-5', name: 'PixelPilot', xp: 3720, accuracy: 81, streak: 7, favoriteTopic: 'gk' },
  { id: 'demo-6', name: 'LogicLynx', xp: 3310, accuracy: 79, streak: 6, favoriteTopic: 'aptitude' },
  { id: 'demo-7', name: 'StackSage', xp: 2890, accuracy: 76, streak: 5, favoriteTopic: 'python' },
  { id: 'demo-8', name: 'CipherCat', xp: 2440, accuracy: 74, streak: 4, favoriteTopic: 'sql' },
  { id: 'demo-9', name: 'DataDrift', xp: 1980, accuracy: 70, streak: 3, favoriteTopic: 'aptitude' },
  { id: 'demo-10', name: 'LoopLegend', xp: 1520, accuracy: 68, streak: 2, favoriteTopic: 'python' },
  { id: 'demo-11', name: 'SyntaxSprout', xp: 980, accuracy: 63, streak: 1, favoriteTopic: 'gk' },
  { id: 'demo-12', name: 'NullNinja', xp: 450, accuracy: 58, streak: 1, favoriteTopic: 'sql' },
]

export type LeaderboardSort = 'xp' | 'accuracy' | 'streak'

export function buildLeaderboard(
  player: Omit<LeaderboardEntry, 'level' | 'isDemo' | 'id'>,
  sort: LeaderboardSort,
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    ...DEMO_PLAYERS.map((p) => ({ ...p, level: getLevelInfo(p.xp).level, isDemo: true })),
    { ...player, id: 'you', level: getLevelInfo(player.xp).level, isDemo: false },
  ]
  return entries.sort((a, b) => b[sort] - a[sort] || b.xp - a.xp)
}
