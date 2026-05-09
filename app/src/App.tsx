import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthProvider'
import { Layout } from './components/Layout'
import { ArticleList } from './features/articles/ArticleList'
import { ArticleView } from './features/articles/ArticleView'
import { VersionHistory } from './features/articles/VersionHistory'
import { AdminPanel } from './features/admin/AdminPanel'
import { ComponentExplorer } from './pages/ComponentExplorer'
import { LegacyView } from './pages/LegacyView'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,         // 1 min
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<ArticleList />} />
              <Route path="articles/:slug" element={<ArticleView />} />
              <Route path="articles/:slug/history" element={<VersionHistory />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="components" element={<ComponentExplorer />} />
              <Route path="legacy/:slug" element={<LegacyView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
