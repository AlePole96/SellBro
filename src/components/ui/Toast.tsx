import { useState, useEffect, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: number
  text: string
  type: ToastType
}

let addToast: (text: string, type?: ToastType) => void = () => {}

export function toast(text: string, type: ToastType = 'info') {
  addToast(text, type)
}

const typeClasses: Record<ToastType, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-primary/30 bg-primary/10 text-primary',
}

let nextId = 0

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  addToast = useCallback((text: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} message={t} />
      ))}
    </div>
  )
}

function ToastItem({ message }: { message: ToastMessage }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 2700)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 ${typeClasses[message.type]} ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      }`}
    >
      {message.text}
    </div>
  )
}
