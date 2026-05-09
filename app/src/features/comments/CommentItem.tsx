import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { CommentForm } from './CommentForm'
import { ProposalForm } from '../proposals/ProposalForm'
import { formatDate } from '../../lib/utils'
import type { CommentWithAuthor } from '../../lib/types'

interface Props {
  comment: CommentWithAuthor
  articleId: string
  versionId: string
  articleSlug: string
}

const kindStyles: Record<string, { label: string; borderColor: string; labelColor: string }> = {
  comment:      { label: 'comment',        borderColor: 'border-dust',   labelColor: 'text-muted' },
  fact_contest: { label: 'fact contested', borderColor: 'border-danger', labelColor: 'text-danger' },
  proposal:     { label: 'edit proposed',  borderColor: 'border-teal',   labelColor: 'text-teal' },
}

export function CommentItem({ comment, articleId, versionId, articleSlug }: Props) {
  const { user } = useAuth()
  const [showReply, setShowReply] = useState(false)
  const [showProposal, setShowProposal] = useState(false)

  const style = kindStyles[comment.kind] ?? kindStyles.comment

  return (
    <div
      className={`comment-item border-l-2 pl-4 py-1 ${style.borderColor}`}
      data-kind={comment.kind}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-[11px] text-ink font-bold">
          {comment.author?.display_name ?? comment.author?.username ?? 'anonymous'}
        </span>
        {comment.author?.role && comment.author.role !== 'reader' && (
          <span className={`role-badge role-${comment.author.role}`}>
            {comment.author.role}
          </span>
        )}
        <span className={`font-mono text-[9px] uppercase tracking-wider ${style.labelColor}`}>
          {style.label}
        </span>
        {comment.section_tag && (
          <code className="font-mono text-[9px] bg-paper3 px-1.5 py-0.5 border border-dust text-muted">
            #{comment.section_tag}
          </code>
        )}
        <time className="font-mono text-[10px] text-muted ml-auto">
          {formatDate(comment.created_at)}
        </time>
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed mb-3">{comment.content}</p>

      {/* Actions */}
      {user && (
        <div className="flex gap-4">
          <button
            onClick={() => { setShowReply((v) => !v); setShowProposal(false) }}
            className="font-mono text-[9px] uppercase tracking-wider text-muted hover:text-ink"
          >
            Reply
          </button>
          {comment.kind === 'proposal' && (
            <button
              onClick={() => { setShowProposal((v) => !v); setShowReply(false) }}
              className="font-mono text-[9px] uppercase tracking-wider text-teal hover:text-ink"
            >
              Submit as formal proposal
            </button>
          )}
        </div>
      )}

      {/* Reply form */}
      {showReply && (
        <div className="mt-3">
          <CommentForm
            articleId={articleId}
            versionId={versionId}
            parentId={comment.id}
            onSuccess={() => setShowReply(false)}
          />
        </div>
      )}

      {/* Formal proposal form */}
      {showProposal && (
        <div className="mt-3">
          <ProposalForm
            articleId={articleId}
            commentId={comment.id}
            onSuccess={() => setShowProposal(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4 pl-4 border-l border-dust">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              versionId={versionId}
              articleSlug={articleSlug}
            />
          ))}
        </div>
      )}
    </div>
  )
}
