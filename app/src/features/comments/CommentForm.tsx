import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { CommentKind } from '../../lib/types'

interface Props {
  articleId: string
  versionId: string
  parentId: string | null
  onSuccess?: () => void
}

const kindOptions: { value: CommentKind; label: string; hint: string }[] = [
  { value: 'comment',      label: 'Comment',       hint: 'Leave a general comment.' },
  { value: 'fact_contest', label: 'Contest Fact',  hint: 'Challenge a claim with evidence.' },
  { value: 'proposal',     label: 'Propose Edit',  hint: 'Suggest a specific text change.' },
]

export function CommentForm({ articleId, versionId, parentId, onSuccess }: Props) {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [kind, setKind] = useState<CommentKind>('comment')
  const [sectionTag, setSectionTag] = useState('')

  const currentHint = kindOptions.find((k) => k.value === kind)?.hint ?? ''

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('comments').insert({
        article_id: articleId,
        version_id: versionId,
        author_id: profile!.id,
        content,
        kind,
        section_tag: sectionTag.replace(/^#/, '') || null,
        parent_id: parentId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setContent('')
      setSectionTag('')
      setKind('comment')
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] })
      onSuccess?.()
    },
  })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); mutate() }}
      className="bg-paper2 border border-dust p-4 space-y-3"
    >
      {/* Kind selector (hidden for replies) */}
      {!parentId && (
        <div className="flex gap-0 border border-dust overflow-hidden">
          {kindOptions.map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 text-center font-mono text-[9px] uppercase tracking-wider py-2 cursor-pointer transition-colors ${
                kind === opt.value
                  ? 'bg-ink text-paper'
                  : 'text-muted hover:text-ink hover:bg-paper3'
              }`}
            >
              <input
                type="radio"
                value={opt.value}
                checked={kind === opt.value}
                onChange={() => setKind(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {/* Section tag (optional) */}
      {!parentId && (
        <input
          type="text"
          placeholder="Tag a section (optional) — e.g. #heading-2 or #sources"
          value={sectionTag}
          onChange={(e) => setSectionTag(e.target.value)}
          className="w-full font-mono text-xs bg-paper border border-dust px-3 py-2 outline-none focus:border-ink placeholder:text-muted"
        />
      )}

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? 'Write a reply…' : currentHint}
        required
        rows={3}
        className="w-full text-sm bg-paper border border-dust px-3 py-2 outline-none focus:border-ink resize-none placeholder:text-muted"
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
          disabled={isPending || !content.trim()}
          className="bg-ink text-paper font-mono text-[9px] uppercase tracking-widest px-5 py-2 hover:bg-accent transition-colors disabled:opacity-40"
        >
          {isPending ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  )
}
