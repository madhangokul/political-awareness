import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { Article } from '../../lib/types'

export function ArticleEditor() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { mutate: createArticle, isPending } = useMutation({
    mutationFn: async () => {
      setError(null)

      // 1. Create the article (draft)
      const { data: article, error: aErr } = await supabase
        .from('articles')
        .insert({
          slug,
          title,
          subtitle: subtitle || null,
          published: false,
          created_by: profile!.id,
        })
        .select()
        .single()

      if (aErr) throw aErr
      const typedArticle = article as unknown as Article

      // 2. Insert version 1 (the full content)
      const { error: vErr } = await supabase.from('article_versions').insert({
        article_id: typedArticle.id,
        version_number: 1,
        content,
        change_summary: 'Initial version',
        created_by: profile!.id,
      })

      if (vErr) throw vErr

      return typedArticle
    },
    onSuccess: (article: Article) => {
      setSuccess(`Draft created: /articles/${article.slug}`)
      setSlug(''); setTitle(''); setSubtitle(''); setContent('')
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  return (
    <div>
      <p className="text-sm text-muted mb-6">
        Create a new article as a draft. Publish it from the articles list (coming soon)
        or directly via Supabase dashboard: set <code>published = true</code>.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); createArticle() }}
        className="space-y-4 max-w-2xl"
      >
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-muted mb-1">
            Slug (URL path)
          </label>
          <input
            placeholder="e.g. dravidianism-myths"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            required
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
            className="w-full font-mono text-sm bg-paper border border-dust px-3 py-2 outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-muted mb-1">
            Title
          </label>
          <input
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full font-display text-lg bg-paper border border-dust px-3 py-2 outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-muted mb-1">
            Subtitle (optional)
          </label>
          <input
            placeholder="A brief subtitle or summary line"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-sm bg-paper border border-dust px-3 py-2 outline-none focus:border-ink text-muted"
          />
        </div>

        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-muted mb-1">
            Content (Markdown)
          </label>
          <textarea
            placeholder={`## Introduction\n\nWrite your article in Markdown…`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={16}
            className="w-full font-mono text-sm bg-paper border border-dust px-3 py-2 outline-none focus:border-ink resize-y"
          />
        </div>

        {error && (
          <p className="text-danger text-sm">{error}</p>
        )}
        {success && (
          <p className="text-teal text-sm font-mono">{success}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-ink text-paper font-mono text-[9px] uppercase tracking-widest px-6 py-3 hover:bg-accent transition-colors disabled:opacity-40"
        >
          {isPending ? 'Creating…' : 'Create Draft Article'}
        </button>
      </form>
    </div>
  )
}
