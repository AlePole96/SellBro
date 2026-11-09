import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ToastContainer } from '../ui'

const navItems = [
  {
    path: '/',
    label: 'Articoli',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: '/items/new',
    label: 'Nuovo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
]

export function AppShell() {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <header className="sticky top-0 z-30 border-b border-edge bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link to="/" className="text-lg font-bold text-primary">
            SellBro
          </Link>
          <button
            onClick={signOut}
            className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-content"
          >
            Esci
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-edge bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 transition-all duration-150 ${
                  active
                    ? 'text-primary'
                    : 'text-faint hover:text-muted'
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <ToastContainer />
    </div>
  )
}
