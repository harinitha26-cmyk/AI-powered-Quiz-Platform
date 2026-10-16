import type { Metadata } from 'next'
import { RewardsView } from '@/components/rewards-view'

export const metadata: Metadata = { title: 'Rewards' }

export default function Page() {
  return <RewardsView />
}
