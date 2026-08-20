import { Radio } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Tuning...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center neo-grid z-50" role="status" aria-label="Loading">
      <div className="mb-8 animate-float">
        <Radio className="w-24 h-24 text-black p-4 bg-[var(--accent)] border-3 border-black rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)]" aria-hidden="true" />
      </div>

      <div className="flex gap-2 mb-6" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-3 h-14 bg-[var(--accent)] border-2 border-black rounded shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            style={{
              animation: `waveform 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
              transformOrigin: 'center',
            }}
          />
        ))}
      </div>

      <p className="font-mono font-bold text-base bg-[var(--surface)] text-[var(--text)] border-3 border-black px-4 py-2 rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-pulse">
        {message}
      </p>
    </div>
  )
}
