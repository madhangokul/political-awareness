import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { usePushSubscription } from '../features/notifications/usePushSubscription'

export function Layout() {
  // Register push subscription once user logs in
  usePushSubscription()

  return (
    <div>
      <Header />
      <main className="wrap">
        <Outlet />
      </main>
    </div>
  )
}
