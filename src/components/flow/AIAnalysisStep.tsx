import { useState, useEffect } from 'react'

interface Props {
  previews: string[]
}

const MESSAGES = [
  'Analizzo le foto...',
  'Riconosco l\'oggetto...',
  'Stimo il valore...',
  'Preparo i dettagli...',
]

export function AIAnalysisStep({ previews }: Props) {
  const [messageIdx, setMessageIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIdx((i) => (i + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Photo preview with scanning effect */}
      <div className="relative">
        <div className="flex gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl">
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="h-44 w-44 object-cover"
              />
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                  style={{
                    animation: 'scanLine 2s ease-in-out infinite',
                  }}
                />
              </div>
              <div className="absolute inset-0 rounded-xl ring-2 ring-primary/50" />
            </div>
          ))}
        </div>

        {/* Pulsing glow behind */}
        <div
          className="absolute -inset-4 -z-10 rounded-2xl bg-primary/10"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />
      </div>

      {/* AI brain icon */}
      <div className="relative">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20"
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.45 2.1-1.17 2.83L12 12l-2.83-3.17A4 4 0 0 1 12 2z" />
            <path d="M4.93 10a4 4 0 0 1 5.07-1.07L12 12l-2 3.07A4 4 0 0 1 4.93 10z" />
            <path d="M19.07 10a4 4 0 0 0-5.07-1.07L12 12l2 3.07A4 4 0 0 0 19.07 10z" />
            <path d="M7.93 19a4 4 0 0 1 1.07-5.07L12 12l3.07 2a4 4 0 0 1-5.07 5z" />
            <path d="M16.07 19a4 4 0 0 0-1.07-5.07L12 12l-3.07 2a4 4 0 0 0 5.07 5z" />
          </svg>
        </div>
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary"
            style={{
              animation: `orbit 2s linear infinite`,
              animationDelay: `${i * 0.66}s`,
              top: '50%',
              left: '50%',
            }}
          />
        ))}
      </div>

      {/* Message */}
      <div className="text-center">
        <p
          key={messageIdx}
          className="text-lg font-semibold text-content"
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          {MESSAGES[messageIdx]}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              style={{
                animation: 'bounce 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes scanLine {
          0% { top: -4px; }
          50% { top: calc(100% + 4px); }
          50.1% { top: -4px; }
          100% { top: calc(100% + 4px); }
        }
        @keyframes orbit {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(40px) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) rotate(180deg) translateX(40px) scale(0.6); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(40px) scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
