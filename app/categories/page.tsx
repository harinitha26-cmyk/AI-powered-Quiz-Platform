import type { Metadata } from 'next'
import { CategoriesView } from '@/components/categories-view'

export const metadata: Metadata = { title: 'Quiz Categories' }

export default function Page() {
  return <CategoriesView />
}
