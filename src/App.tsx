import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/layout/AuthGuard'
import { AppShell } from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <h2 className="text-xl text-muted">{title}</h2>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<Placeholder title="Lista articoli" />} />
          <Route
            path="items/new"
            element={<Placeholder title="Nuovo articolo" />}
          />
          <Route
            path="items/:id"
            element={<Placeholder title="Dettaglio articolo" />}
          />
          <Route
            path="items/:id/edit"
            element={<Placeholder title="Modifica articolo" />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
