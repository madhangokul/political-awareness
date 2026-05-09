export interface FootnoteItem {
  /** Must match the CitationRef n prop in the article body. */
  n: number
  /** Full citation text. */
  text: string
  /** Optional external URL shown as [source →]. */
  url?: string
}

interface FootnotesProps {
  items: FootnoteItem[]
  /** Section heading — defaults to "References". */
  title?: string
}

/**
 * Footnote section rendered at the bottom of an article or section.
 * Each item has a ↑ back-link that scrolls to the matching CitationRef.
 *
 * Usage:
 *   <Footnotes items={[
 *     { n: 1, text: 'RBI State Finances 2024.', url: 'https://rbi.org.in' },
 *   ]} />
 */
export function Footnotes({ items, title = 'References' }: FootnotesProps) {
  function scrollBack(n: number) {
    const target = document.getElementById(`cite-${n}`)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Walk up to the <sup> parent for a larger flash target
    const sup = target.parentElement ?? target
    sup.classList.add('cite-highlight')
    setTimeout(() => sup.classList.remove('cite-highlight'), 1200)
  }

  return (
    <section className="footnotes-section" aria-label="Footnotes">
      <p className="footnotes-header">{title}</p>
      <ol className="footnotes-list">
        {items.map(({ n, text, url }) => (
          <li id={`fn-${n}`} key={n} className="footnote-item">
            <button
              className="fn-back-btn"
              onClick={() => scrollBack(n)}
              aria-label={`Return to citation ${n} in text`}
              title="Return to text"
            >
              ↑
            </button>
            <span className="fn-text">
              <span className="fn-n">{n}.</span>{' '}
              {text}
              {url && (
                <>
                  {' '}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fn-link"
                  >
                    [source →]
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
