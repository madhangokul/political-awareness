import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { ProposalReview } from './ProposalReview'
import { ReviewerManager } from './ReviewerManager'
import { ArticleEditor } from './ArticleEditor'

type Tab = 'proposals' | 'roles' | 'articles'

export function AdminPanel() {
  const { profile, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('proposals')

  if (loading) return null

  // Reviewers see proposals only; admins see everything
  if (!profile || !['reviewer', 'admin'].includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  const allTabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: 'proposals' as Tab, label: 'Pending Proposals' },
    { id: 'roles'     as Tab, label: 'Manage Roles',    adminOnly: true },
    { id: 'articles'  as Tab, label: 'Articles',         adminOnly: true },
  ]
  const tabs = allTabs.filter((t) => !t.adminOnly || profile.role === 'admin')

  return (
    <div className="pt-12">
      <header className="border-b-2 border-ink pb-6 mb-8">
        <span className="block font-mono text-[9px] tracking-[0.28em] uppercase text-muted mb-3">
          {profile.role === 'admin' ? 'Admin Panel' : 'Reviewer Panel'}
        </span>
        <h1 className="font-display font-bold text-3xl">
          {profile.role === 'admin' ? 'Administration' : 'Review Queue'}
        </h1>
      </header>

      {/* Tab nav */}
      <div className="flex border-b border-dust mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-mono text-[10px] uppercase tracking-wider px-5 py-2.5 border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-ink text-ink'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'proposals' && <ProposalReview />}
      {tab === 'roles'     && profile.role === 'admin' && <ReviewerManager />}
      {tab === 'articles'  && profile.role === 'admin' && <ArticleEditor />}
    </div>
  )
}
