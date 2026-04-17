import type { Metadata } from 'next'
import { SearchPageClient } from '@/components/search/SearchPageClient'

export const metadata: Metadata = { title: 'Busqueda' }

export default function SearchPage() {
  return <SearchPageClient />
}
