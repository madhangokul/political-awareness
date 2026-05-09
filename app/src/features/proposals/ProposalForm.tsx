import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'

interface Props {
  articleId: string
  commentId?: string
  sectionRef?: string
  originalText?: string
  onSuccess?: () => void
}

export function ProposalForm({ articleId, commentId, sectionRef, originalText, onSuccess }: Props) {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [proposedText, setProposedText] = useState(originalText ?? '')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('proposals').insert({
        article_id: articleId,
        comment_id: commentId ?? null,
        author_id: profile!.id,
        section_ref: sectionRef ?? null,
        original_text: originalText ?? null,
        proposed_text: proposedText,
        review_note: note || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setSent(true)
      queryClient.invalidateQueries({ queryKey: ['proposals', articleId] })
      onSuccess?.()
    },
  })

  if (sent) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-wider text-teal py-2">
        Proposal submitted for review.
      </p>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutate() }}
      className="bg-paper3 border border-dust p-4 space-y-3"
    >
      <p className="font-mono text-[9px] uppercase tracking-wider text-teal">
        Formal Edit Proposal
      </p>
      <p className="text-xs text-muted">
        Provide the corrected text. Reviewers will compare it to the current version and
        accept or reject. Accepted proposals become a new article version.
      </p>

      {originalText && (
        <div>
          <p className="font-mono text-[9px] text-muted uppercase mb-1">Current text</p>
          <p className="text-sm bg-danger-soft border-l-2 border-danger px-3 py-2 line-through text-muted">
            {originalText}
          </p>
        </div>
      )}

      <div>
        <p className="font-mono text-[9px] text-muted uppercase mb-1">Proposed replacement</p>
        <textarea
          value={proposedText}
          onChange={(e) => setProposedText(e.target.value)}
          placeholder="Write the corrected or improved text…"
          required
          rows={5}
          className="w-full text-sm bg-paper border border-dust px-3 py-2 outline-none focus:border-ink resize-none"
        />
      </div>

      <input
        type="text"
        placeholder="Optional: note to reviewer (your source, reasoning…)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full font-mono text-xs bg-paper border border-dust px-3 py-2 outline-none focus:border-ink"
      />

      <div className="flex items-center justify-end gap-3">
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            className="font-mono text-[9px] uppercase tracking-wider text-muted hover:text-ink"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !proposedText.trim() || proposedText === originalText}
          className="bg-teal text-paper font-mono text-[9px] uppercase tracking-widest px-5 py-2 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {isPending ? 'Submitting…' : 'Submit Proposal'}
        </button>
      </div>
    </form>
  )
}
