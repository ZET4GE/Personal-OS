'use client'

import { useOptimistic, useTransition, useRef } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { createPaymentAction, deletePaymentAction } from '@/app/(dashboard)/freelance/actions'
import { PaymentCard } from './PaymentCard'
import { PaymentForm, type PaymentFormHandle } from './PaymentForm'
import { formatCurrency } from '@/lib/utils'
import type { ProjectPayment, Currency } from '@/types/clients'

type OptPayment = ProjectPayment & { isOptimistic?: boolean }

function reducer(
  state: OptPayment[],
  op: { type: 'add'; p: OptPayment } | { type: 'delete'; id: string },
): OptPayment[] {
  if (op.type === 'add')    return [op.p, ...state]
  if (op.type === 'delete') return state.filter((p) => p.id !== op.id)
  return state
}

interface PaymentsClientProps {
  payments:        ProjectPayment[]
  projectId:       string
  defaultCurrency: Currency
  budget:          number | null
}

export function PaymentsClient({ payments, projectId, defaultCurrency, budget }: PaymentsClientProps) {
  const [optimistic, dispatch] = useOptimistic(payments, reducer)
  const [, startTransition]    = useTransition()
  const formRef                = useRef<PaymentFormHandle>(null)

  const totalPaid = optimistic.reduce((sum, p) => sum + (p.currency === defaultCurrency ? p.amount : 0), 0)

  function handleCreate(fd: FormData) {
    const now = new Date().toISOString()
    const opt: OptPayment = {
      id: `opt-${Date.now()}`,
      project_id: projectId,
      user_id: '',
      amount: parseFloat(fd.get('amount') as string) || 0,
      currency: (fd.get('currency') as Currency) ?? defaultCurrency,
      payment_date: (fd.get('payment_date') as string) || now.slice(0, 10),
      method: (fd.get('method') as ProjectPayment['method']) || null,
      notes: (fd.get('notes') as string) || null,
      created_at: now,
      isOptimistic: true,
    }
    startTransition(async () => {
      dispatch({ type: 'add', p: opt })
      const r = await createPaymentAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Pago registrado')
    })
  }

  function handleDelete(fd: FormData) {
    const id = String(fd.get('id') ?? '')
    startTransition(async () => {
      dispatch({ type: 'delete', id })
      const r = await deletePaymentAction(fd)
      if ('error' in r) toast.error(r.error)
    })
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Total cobrado: <span className="text-green-600 dark:text-green-400">{formatCurrency(totalPaid, defaultCurrency)}</span>
          </p>
          {budget && (
            <p className="text-xs text-muted">
              de {formatCurrency(budget, defaultCurrency)} presupuestados
            </p>
          )}
        </div>
        <button
          onClick={() => formRef.current?.open()}
          className="flex items-center gap-2 rounded-lg bg-accent-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={14} /> Registrar pago
        </button>
      </div>

      {optimistic.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
          Sin pagos registrados todavía.
        </p>
      ) : (
        <div className="space-y-2">
          {optimistic.map((p) => (
            <PaymentCard key={p.id} payment={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <PaymentForm
        ref={formRef}
        projectId={projectId}
        defaultCurrency={defaultCurrency}
        onSubmit={handleCreate}
      />
    </>
  )
}
