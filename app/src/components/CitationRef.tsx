import { useCallback } from 'react'

interface CitationRefProps {
  /** The footnote number — must match the corresponding Footnotes item. */
  n: number
}

/**
 * Inline superscript citation anchor.
 * Clicking smoothly scrolls to the matching footnote and flashes it.
 * The footnote's back-link scrolls back here.
 *
 * Usage:
 *   Tamil Nadu's debt ratio reached 28.8%<CitationRef n={1} /> in 2023–24.
 */
export function CitationRef({ n }: CitationRefProps) {
  const scrollToFootnote = useCallback(() => {
    const target = document.getElementById(`fn-${n}`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    target.classList.add('fn-highlight')
    setTimeout(() => target.classList.remove('fn-highlight'), 1200)
  }, [n])

  return (
    <sup>
      <a
        id={`cite-${n}`}
        href={`#fn-${n}`}
        onClick={(e) => { e.preventDefault(); scrollToFootnote() }}
        className="cite-ref"
        aria-label={`Footnote ${n}`}
      >
        [{n}]
      </a>
    </sup>
  )
}
