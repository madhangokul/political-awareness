import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import { formatDate } from '../../lib/utils'

export function NotificationBell() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

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
    refetchInterval: 60_000, // poll every 60s as a fallback
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

  if (!user) return null

  function handleOpen() {
    setOpen((v) => !v)
    if (!open && unread > 0) markAllRead()
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
        className="font-mono text-[10px] text-white/40 hover:text-white relative transition-colors"
      >
        ◎
        {unread > 0 && (
          <span className="absolute -top-1 -right-1.5 bg-accent text-paper text-[8px] font-mono w-3.5 h-3.5 flex items-center justify-center rounded-full">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-paper border border-ink z-50 shadow-lg">
          <div className="border-b border-dust px-4 py-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
              Notifications
            </span>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted italic">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-dust max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 ${!n.read ? 'bg-paper2' : ''}`}
                >
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-muted mt-0.5">{n.body}</p>
                  )}
                  <time className="font-mono text-[9px] text-dust2 mt-1 block">
                    {formatDate(n.created_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
