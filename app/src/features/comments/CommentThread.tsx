import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import type { CommentWithAuthor } from '../../lib/types'

interface Props {
  articleId: string
  versionId: string
  articleSlug: string
}

export function CommentThread({ articleId, versionId, articleSlug }: Props) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:profiles(id, username, display_name, role)')
        .eq('article_id', articleId)
        .is('parent_id', null)
        .neq('status', 'rejected')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as CommentWithAuthor[]
    },
  })

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${articleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `article_id=eq.${articleId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', articleId] })
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [articleId, queryClient])

  const commentCount = comments.length

  return (
    <section className="border-t-2 border-ink pt-10">
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="font-display font-bold text-2xl">
          Discussion
          {commentCount > 0 && (
            <span className="font-mono text-sm text-muted font-normal ml-2">
              ({commentCount})
            </span>
          )}
        </h3>
        {!user && (
          <p className="text-muted text-sm">
            <span className="text-accent cursor-pointer hover:underline">Login</span> to join the conversation.
          </p>
        )}
      </div>

      <p className="text-muted text-sm mb-8 leading-relaxed">
        Tag a section, contest a fact with evidence, or propose an edit.
        Proposals reviewed by editors become new article versions.
      </p>

      {/* Comments */}
      <div className="space-y-6 mb-10">
        {comments.length === 0 ? (
          <p className="text-muted text-sm italic">
            No comments yet. Be the first to examine this article.
          </p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              articleId={articleId}
              versionId={versionId}
              articleSlug={articleSlug}
            />
          ))
        )}
      </div>

      {/* New comment form */}
      {user && (
        <CommentForm
          articleId={articleId}
          versionId={versionId}
          parentId={null}
        />
      )}
    </section>
  )
}
