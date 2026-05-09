import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { VersionDiff } from './VersionDiff'
import { formatDate } from '../../lib/utils'

export function VersionHistory() {
  const { slug } = useParams<{ slug: string }>()

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['versions', slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_article_versions', { p_slug: slug! })
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })

  return (
    <div className="pt-12">
      <div className="mb-8">
        <Link
          to={`/articles/${slug}`}
          className="font-mono text-[9px] tracking-widest uppercase text-muted hover:text-ink"
        >
          ← Back to article
        </Link>
        <h1 className="font-display font-bold text-3xl mt-4 mb-2">Version History</h1>
        <p className="text-muted text-sm">
          Each version was created from an accepted community proposal.
          Showing factual diffs between adjacent versions.
        </p>
      </div>

      {isLoading ? (
        <p className="font-mono text-sm text-muted">Loading…</p>
      ) : (
        <ol className="space-y-10">
          {[...versions].reverse().map((v, i, arr) => {
            const prevVersion = arr[i + 1] // reversed, so "previous" is next in array
            return (
              <li key={v.version_number} className="border-t border-dust pt-8">
                <header className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="font-mono text-xs text-accent font-bold">
                      v{v.version_number}
                    </span>
                    {v.version_number === versions[versions.length - 1]?.version_number && (
                      <span className="ml-2 font-mono text-[9px] tracking-widest uppercase bg-ink text-paper px-2 py-0.5">
                        Current
                      </span>
                    )}
                    {v.change_summary && (
                      <p className="text-sm text-ink mt-1">{v.change_summary}</p>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-muted shrink-0">
                    {formatDate(v.created_at)}
                  </p>
                </header>

                {prevVersion ? (
                  <VersionDiff
                    oldContent={prevVersion.content}
                    newContent={v.content}
                  />
                ) : (
                  <p className="font-mono text-[10px] text-muted italic">Initial version.</p>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
