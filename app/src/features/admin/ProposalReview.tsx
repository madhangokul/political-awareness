import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../lib/utils'
import type { ProposalWithDetails } from '../../lib/types'

export function ProposalReview() {
  const queryClient = useQueryClient()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, author:profiles(id, display_name, username), article:articles(id, slug, title)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as ProposalWithDetails[]
    },
  })

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('accept_proposal', { p_proposal_id: id } as never)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['proposals-pending'] }),
  })

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      const { error } = await supabase.rpc('reject_proposal', { p_proposal_id: id, p_note: note } as never)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals-pending'] })
      setRejectingId(null)
      setRejectNote('')
    },
  })

  if (isLoading) {
    return <p className="font-mono text-sm text-muted">Loading…</p>
  }

  if (proposals.length === 0) {
    return (
      <p className="text-muted text-sm italic">No pending proposals. All caught up.</p>
    )
  }

  return (
    <ul className="space-y-6">
      {proposals.map((p) => (
        <li key={p.id} className="border border-dust bg-paper2 p-5">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="font-mono text-xs font-bold text-ink">
              {p.article?.title ?? 'Unknown article'}
            </span>
            <span className="text-dust">·</span>
            <span className="font-mono text-[10px] text-muted">
              by {p.author?.display_name ?? p.author?.username ?? 'anonymous'}
            </span>
            {p.section_ref && (
              <code className="font-mono text-[9px] bg-paper3 border border-dust px-1.5 py-0.5 text-muted">
                #{p.section_ref}
              </code>
            )}
            <span className="font-mono text-[10px] text-muted ml-auto">
              {formatDate(p.created_at)}
            </span>
          </div>

          {/* Diff */}
          {p.original_text && (
            <p className="text-sm bg-danger-soft border-l-2 border-danger px-3 py-2 mb-2 line-through text-muted">
              {p.original_text}
            </p>
          )}
          <p className="text-sm bg-teal-soft border-l-2 border-teal px-3 py-2 mb-4">
            {p.proposed_text}
          </p>

          {/* Review note from author */}
          {p.review_note && (
            <p className="font-mono text-[10px] text-muted mb-4 italic">
              Author note: {p.review_note}
            </p>
          )}

          {/* Actions */}
          {rejectingId === p.id ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Optional: note to the author"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full font-mono text-xs bg-paper border border-dust px-3 py-2 outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => reject({ id: p.id, note: rejectNote || undefined })}
                  disabled={rejecting}
                  className="font-mono text-[9px] uppercase tracking-wider text-danger border border-danger px-4 py-1.5 hover:bg-danger hover:text-paper transition-colors disabled:opacity-40"
                >
                  {rejecting ? 'Rejecting…' : 'Confirm Reject'}
                </button>
                <button
                  onClick={() => { setRejectingId(null); setRejectNote('') }}
                  className="font-mono text-[9px] uppercase tracking-wider text-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => accept(p.id)}
                disabled={accepting}
                className="font-mono text-[9px] uppercase tracking-wider text-teal border border-teal px-4 py-1.5 hover:bg-teal hover:text-paper transition-colors disabled:opacity-40"
              >
                {accepting ? 'Accepting…' : 'Accept'}
              </button>
              <button
                onClick={() => setRejectingId(p.id)}
                className="font-mono text-[9px] uppercase tracking-wider text-muted border border-dust px-4 py-1.5 hover:border-danger hover:text-danger transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
