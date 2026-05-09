import { useMemo } from 'react'
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from 'diff-match-patch'

interface Props {
  oldContent: string
  newContent: string
}

const dmp = new diff_match_patch()

export function VersionDiff({ oldContent, newContent }: Props) {
  const diffs = useMemo(() => {
    const d = dmp.diff_main(oldContent, newContent)
    dmp.diff_cleanupSemantic(d)
    return d
  }, [oldContent, newContent])

  const hasChanges = diffs.some(([op]) => op !== DIFF_EQUAL)

  if (!hasChanges) {
    return (
      <p className="font-mono text-[10px] text-muted italic">No textual changes detected.</p>
    )
  }

  return (
    <div className="bg-paper2 border border-dust p-4 text-sm leading-relaxed font-body overflow-x-auto">
      <p className="font-mono text-[9px] tracking-widest uppercase text-muted mb-3">
        Changes in this version
      </p>
      <div>
        {diffs.map(([op, text], i) => {
          if (op === DIFF_EQUAL) {
            // Show brief context around changes, not full unchanged text
            const trimmed = text.length > 80
              ? `…${text.slice(-40)}`
              : text
            return <span key={i} className="text-muted">{trimmed}</span>
          }
          if (op === DIFF_DELETE) {
            return (
              <del key={i} className="diff-del no-underline rounded-[2px] px-0.5">
                {text}
              </del>
            )
          }
          if (op === DIFF_INSERT) {
            return (
              <ins key={i} className="diff-ins no-underline rounded-[2px] px-0.5">
                {text}
              </ins>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
