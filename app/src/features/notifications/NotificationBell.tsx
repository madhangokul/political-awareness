import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { formatDate } from '../../lib/utils'

export function NotificationBell() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number | null>(null)
  const currentDragY = useRef(0)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data
    },
    enabled: !!user,
    refetchInterval: 60_000,
  })

  const unread = notifications.filter((n) => !n.read).length

  const { mutate: markAllRead } = useMutation({
    mutationFn: async () => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user!.id)
        .eq('read', false)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
  })

  // Lock body scroll while mobile sheet is open
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 639px)').matches
    if (open && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!user) return null

  function handleOpen() {
    setOpen((v) => !v)
    if (!open && unread > 0) markAllRead()
  }

  function close() { setOpen(false) }

  // ── Swipe-down-to-dismiss ──────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    currentDragY.current = 0
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null || !sheetRef.current) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) {
      currentDragY.current = dy
      sheetRef.current.style.transform = `translateY(${dy}px)`
    }
  }
  function onTouchEnd() {
    if (!sheetRef.current) return
    sheetRef.current.style.transition = ''
    if (currentDragY.current > 80) {
      close()
    } else {
      sheetRef.current.style.transform = ''
    }
    touchStartY.current = null
    currentDragY.current = 0
  }

  // ── Shared list ────────────────────────────────────────────────────────
  const notifList =
    notifications.length === 0 ? (
      <p className="px-5 py-10 text-sm text-muted italic text-center">
        No notifications yet.
      </p>
    ) : (
      <ul className="divide-y divide-dust overflow-y-auto" style={{ maxHeight: '60svh' }}>
        {notifications.map((n) => (
          <li key={n.id} className={`px-5 py-3 ${!n.read ? 'bg-paper2' : ''}`}>
            <p className="text-sm font-medium text-ink leading-snug">{n.title}</p>
            {n.body && <p className="text-xs text-muted mt-0.5 leading-snug">{n.body}</p>}
            <time className="font-mono text-[9px] text-dust2 mt-1 block">
              {formatDate(n.created_at)}
            </time>
          </li>
        ))}
      </ul>
    )

  return (
    <div className="relative">
      {/* ── Bell trigger ── */}
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        className="font-mono text-[10px] text-white/40 hover:text-white relative transition-colors"
      >
        ◎
        {unread > 0 && (
          <span className="absolute -top-1 -right-1.5 bg-[#D4810A] text-[#faf6ee] text-[8px] font-mono w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* ── Desktop dropdown ─────────────────────────────────────── */}
          <div className="hidden sm:block absolute right-0 top-full mt-2 w-80 bg-paper border border-ink z-50 shadow-lg">
            <div className="border-b border-dust px-4 py-2.5 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                Notifications
              </span>
              <button
                onClick={close}
                className="font-mono text-[11px] text-muted hover:text-ink transition-colors leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">{notifList}</div>
          </div>

          {/* ── Mobile backdrop ───────────────────────────────────────── */}
          <div
            className="sm:hidden fixed inset-0 z-40 notif-backdrop"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            onClick={close}
          />

          {/* ── Mobile bottom sheet ───────────────────────────────────── */}
          <div
            ref={sheetRef}
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper notif-sheet"
            style={{ borderRadius: '20px 20px 0 0', boxShadow: '0 -12px 48px rgba(0,0,0,0.25)' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div style={{ width: 36, height: 4, background: 'var(--dust2)', borderRadius: 2 }} />
            </div>

            {/* Sheet header */}
            <div className="border-b border-dust px-5 py-3 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                Notifications
              </span>
              <button
                onClick={close}
                className="font-mono text-[13px] text-muted hover:text-ink transition-colors leading-none"
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>

            {notifList}

            {/* iOS home-indicator safe area */}
            <div style={{ height: 'max(env(safe-area-inset-bottom), 16px)' }} />
          </div>
        </>
      )}
    </div>
  )
}
