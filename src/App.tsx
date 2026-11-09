import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/layout/AuthGuard'
import LoginPage from './pages/LoginPage'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
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
          path="/"
          element={
            <AuthGuard>
              <Placeholder title="Lista articoli" />
            </AuthGuard>
          }
        />
        <Route
          path="/items/new"
          element={
            <AuthGuard>
              <Placeholder title="Nuovo articolo" />
            </AuthGuard>
          }
        />
        <Route
          path="/items/:id"
          element={
            <AuthGuard>
              <Placeholder title="Dettaglio articolo" />
            </AuthGuard>
          }
        />
        <Route
          path="/items/:id/edit"
          element={
            <AuthGuard>
              <Placeholder title="Modifica articolo" />
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
