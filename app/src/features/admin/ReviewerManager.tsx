import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthProvider'
import type { Role, Profile } from '../../lib/types'

export function ReviewerManager() {
  const { profile: self } = useAuth()
  const queryClient = useQueryClient()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, username, role, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Pick<Profile, 'id' | 'display_name' | 'username' | 'role' | 'created_at'>[]
    },
  })

  const { mutate: setRole } = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error } = await supabase.rpc('set_user_role', { p_user_id: userId, p_role: role } as never)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-profiles'] }),
  })

  if (isLoading) return <p className="font-mono text-sm text-muted">Loading…</p>

  return (
    <div>
      <p className="text-sm text-muted mb-6">
        Promote readers to <strong>reviewer</strong> to allow them to accept/reject proposals.
        Promote to <strong>admin</strong> with caution — admins can publish articles and manage all roles.
      </p>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="font-mono text-[9px] uppercase tracking-wider text-muted text-left pb-2">User</th>
            <th className="font-mono text-[9px] uppercase tracking-wider text-muted text-left pb-2">Current Role</th>
            <th className="font-mono text-[9px] uppercase tracking-wider text-muted text-left pb-2">Set Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dust">
          {users.map((u) => (
            <tr key={u.id} className="py-3">
              <td className="py-3 font-mono text-xs">
                {u.display_name ?? u.username ?? u.id.slice(0, 8)}
                {u.id === self?.id && (
                  <span className="ml-1 text-muted text-[9px]">(you)</span>
                )}
              </td>
              <td className="py-3">
                <span className={`role-badge role-${u.role}`}>{u.role}</span>
              </td>
              <td className="py-3">
                <select
                  value={u.role}
                  disabled={u.id === self?.id}
                  onChange={(e) => setRole({ userId: u.id, role: e.target.value as Role })}
                  className="font-mono text-[10px] bg-paper border border-dust px-2 py-1 outline-none focus:border-ink disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="reader">reader</option>
                  <option value="reviewer">reviewer</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
