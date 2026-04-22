import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getRoutineWithLog } from '@/services/routines'
import { RoutineRunner } from '@/components/routines/RoutineRunner'

interface PageProps {
  params:       Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { title: 'Rutina' }
  const today = new Date().toISOString().slice(0, 10)
  const { data } = await getRoutineWithLog(supabase, id, user.id, today)
  return { title: data ? `${data.routine.name} · Rutinas` : 'Rutina no encontrada' }
}

export default async function RoutineDetailPage({ params, searchParams }: PageProps) {
  const { id }          = await params
  const { date: dp }    = await searchParams
  const today           = new Date().toISOString().slice(0, 10)
  const date            = dp && dp <= today ? dp : today

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getRoutineWithLog(supabase, id, user.id, date)
  if (result.error || !result.data) notFound()

  const { routine, items, log } = result.data

  return (
    <RoutineRunner
      routine={routine}
      items={items}
      log={log}
      date={date}
    />
  )
}
