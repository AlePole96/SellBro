import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-xl border border-edge bg-surface p-0 text-content shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-edge px-5 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted transition-colors hover:bg-raised hover:text-content"
          aria-label="Chiudi"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  )
}
