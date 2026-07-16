interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
  onAction?: () => void
  actionLabel?: string
}

export function ErrorDisplay({ message, onRetry, onAction, actionLabel }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-6 my-4 bg-[var(--surface)] border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] rounded-lg max-w-lg mx-auto" role="alert">
      <p className="font-space text-2xl font-black text-[var(--text)] mb-6">
        {message}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="h-12 px-6 font-space text-base font-black uppercase bg-[var(--accent)] text-black border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
          >
            Retry
          </button>
        )}
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className="h-12 px-6 font-space text-base font-black uppercase bg-[var(--surface)] text-[var(--text)] border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-lg hover:-translate-y-0.5 hover:translate-x-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[var(--accent)] hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
