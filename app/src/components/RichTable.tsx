import { useState, useMemo } from 'react'

// ── Design tokens (mirror index.css) ──────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'Space Mono', monospace" }

// ── Types ──────────────────────────────────────────────────────────────────
export type CellType = 'text' | 'number' | 'badge' | 'pill' | 'barfill' | 'sparkline'

export interface BadgeDef {
  label: string
  /** CSS color for border + text. */
  color: string
}

export interface ColDef<T = Record<string, unknown>> {
  key: keyof T & string
  label: string
  type: CellType
  sortable?: boolean
  /** barfill: denominator (default 100). */
  max?: number
  /** badge: maps row value → { label, color }. */
  badgeMap?: Record<string, BadgeDef>
  /** Pixel hint for th width. */
  width?: number
}

interface RichTableProps<T extends Record<string, unknown>> {
  cols: ColDef<T>[]
  rows: T[]
  /** Rows per page (default 5). Set to 0 to disable pagination. */
  pageSize?: number
}

// ── Sub-renderers ──────────────────────────────────────────────────────────
function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const W = 52, H = 22, barW = 6, gap = 1
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      {values.map((v, i) => {
        const h = Math.max(3, ((v - min) / range) * (H - 5))
        const last = i === values.length - 1
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={H - h}
            width={barW}
            height={h}
            fill={last ? 'var(--teal)' : 'var(--dust)'}
            rx={1}
          />
        )
      })}
    </svg>
  )
}

function BarFill({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct >= 65 ? 'var(--red)' : pct >= 38 ? '#D4810A' : 'var(--teal)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--dust)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ ...MONO, fontSize: 10, color: 'var(--muted)', minWidth: 38, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

function BadgeCell({ value, map }: { value: string; map: Record<string, BadgeDef> }) {
  const def = map[value] ?? { label: value, color: 'var(--muted)' }
  return (
    <span style={{
      ...MONO, fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase',
      padding: '2px 7px', border: `1px solid ${def.color}`, color: def.color,
      borderRadius: 2, whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {def.label}
    </span>
  )
}

function PillCell({ value }: { value: string }) {
  return (
    <span style={{
      ...MONO, fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase',
      padding: '2px 7px', background: 'var(--paper3)', color: 'var(--muted)',
      borderRadius: 2, whiteSpace: 'nowrap', display: 'inline-block',
    }}>
      {value}
    </span>
  )
}

function renderCell(col: ColDef<Record<string, unknown>>, value: unknown) {
  switch (col.type) {
    case 'barfill':
      return <BarFill value={Number(value)} max={col.max} />
    case 'sparkline':
      return <Sparkline values={value as number[]} />
    case 'badge':
      return <BadgeCell value={String(value)} map={col.badgeMap ?? {}} />
    case 'pill':
      return <PillCell value={String(value)} />
    case 'number':
      return <span style={{ ...MONO, fontSize: 12, color: 'var(--muted)' }}>{String(value)}</span>
    default:
      return <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13.5 }}>{String(value)}</span>
  }
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span style={{ ...MONO, fontSize: 8, marginLeft: 5, color: active ? 'var(--accent)' : 'rgba(250,246,238,0.25)' }}>
      {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export function RichTable<T extends Record<string, unknown>>({
  cols, rows, pageSize = 5,
}: RichTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const filtered = useMemo(() => {
    if (!filter.trim()) return rows
    const q = filter.toLowerCase()
    return rows.filter(row =>
      cols.some(col => {
        const v = row[col.key]
        if (Array.isArray(v)) return false
        return String(v).toLowerCase().includes(q)
      })
    )
  }, [rows, cols, filter])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
  }, [filtered, sortKey, sortDir])

  const effectivePageSize = pageSize > 0 ? pageSize : sorted.length
  const totalPages = Math.ceil(sorted.length / effectivePageSize)
  const pageRows = sorted.slice(page * effectivePageSize, (page + 1) * effectivePageSize)

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <input
            type="search"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(0) }}
            placeholder="Filter rows…"
            style={{
              width: '100%',
              ...MONO, fontSize: 11,
              background: 'var(--paper2)',
              border: '1px solid var(--dust)',
              borderRadius: 2,
              padding: '7px 10px 7px 30px',
              color: 'var(--ink)',
              outline: 'none',
              appearance: 'none',
            }}
          />
          <span style={{
            position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--muted)', pointerEvents: 'none', lineHeight: 1,
          }}>
            ⌕
          </span>
        </div>
        <span style={{ ...MONO, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
          {filtered.length} row{filtered.length !== 1 ? 's' : ''}
          {filter.trim() ? ` of ${rows.length}` : ''}
        </span>
        {sortKey && (
          <button
            onClick={() => { setSortKey(null); setSortDir('asc') }}
            style={{
              ...MONO, fontSize: 9, color: 'var(--accent)', background: 'none',
              border: '1px solid var(--accent)', borderRadius: 2, padding: '3px 8px',
              cursor: 'pointer', letterSpacing: '0.1em',
            }}
          >
            ✕ sort
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr>
              {cols.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{
                    ...MONO, fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase',
                    background: 'var(--ink)', color: 'var(--paper)',
                    padding: '10px 16px', textAlign: 'left', whiteSpace: 'nowrap',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: col.width,
                  }}
                >
                  {col.label}
                  {col.sortable && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={cols.length}
                  style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic', fontSize: 13 }}
                >
                  No rows match "{filter}".
                </td>
              </tr>
            ) : pageRows.map((row, i) => {
              const bg = i % 2 === 0 ? 'var(--paper2)' : 'var(--paper)'
              const td: React.CSSProperties = {
                padding: '10px 16px', borderBottom: '1px solid var(--dust)',
                background: bg, color: 'var(--muted)', verticalAlign: 'middle',
              }
              return (
                <tr key={i}>
                  {cols.map(col => (
                    <td key={col.key} style={td}>
                      {renderCell(col as ColDef<Record<string, unknown>>, row[col.key])}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {pageSize > 0 && totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
          <span style={{ ...MONO, fontSize: 9, color: 'var(--muted)', letterSpacing: '0.1em' }}>
            {page + 1} / {totalPages}
          </span>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                ...MONO, fontSize: 9,
                width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === page ? 'var(--ink)' : 'var(--paper2)',
                border: '1px solid var(--dust)',
                color: i === page ? 'var(--paper)' : 'var(--muted)',
                cursor: 'pointer', borderRadius: 2,
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
            style={{
              ...MONO, fontSize: 9, padding: '4px 10px',
              background: 'var(--paper2)', border: '1px solid var(--dust)',
              color: page >= totalPages - 1 ? 'var(--dust2)' : 'var(--ink)',
              cursor: page >= totalPages - 1 ? 'default' : 'pointer', borderRadius: 2,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
